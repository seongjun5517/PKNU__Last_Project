import os
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from flask import Flask, jsonify, request
from langchain_chroma import Chroma
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama, OllamaEmbeddings


def parse_keep_alive_seconds(value):
    match = re.fullmatch(r"\s*(\d+)\s*([smh]?)\s*", value, flags=re.IGNORECASE)
    if not match:
        raise ValueError(f"Invalid CHATBOT_KEEP_ALIVE value: {value}")
    amount = int(match.group(1))
    multiplier = {"": 1, "s": 1, "m": 60, "h": 3600}[match.group(2).lower()]
    return amount * multiplier


BASE_DIR = Path(__file__).resolve().parent
CHROMA_PATH = Path(os.getenv("CHATBOT_CHROMA_PATH", BASE_DIR / "data" / "Chroma_DB_Skin_v6"))
INGREDIENT_PATH = Path(os.getenv("CHATBOT_INGREDIENT_PATH", BASE_DIR / "data" / "ingredient_dictionary_100.xlsx"))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CHAT_MODEL = os.getenv("CHATBOT_MODEL", "gemma3:4b")
EMBEDDING_MODEL = os.getenv("CHATBOT_EMBEDDING_MODEL", "nomic-embed-text")
KEEP_ALIVE = os.getenv("CHATBOT_KEEP_ALIVE", "1h")
KEEP_ALIVE_SECONDS = parse_keep_alive_seconds(KEEP_ALIVE)
NUM_PREDICT = max(1, int(os.getenv("CHATBOT_NUM_PREDICT", "800")))
WARMUP_ENABLED = os.getenv("CHATBOT_WARMUP_ENABLED", "false").strip().lower() in {
    "1", "true", "yes", "on",
}
WARMUP_PARALLELISM = max(1, int(os.getenv("CHATBOT_WARMUP_PARALLELISM", "2")))
PORT = int(os.getenv("CHATBOT_PORT", "5001"))

SYSTEM_PROMPT = """
당신은 피부 연구 자료와 일반적인 피부 관리 방법을 안내하는 AI 피부 상담 챗봇입니다. 답변은 한국어로 작성하세요.

질문 처리 규칙

피부 관련 질문은 아래 검색 자료를 우선 활용하여 답변합니다.
"너는 누구야?", "무엇을 할 수 있어?"와 같은 질문에는 검색 자료를 사용하지 말고, 피부 관리, 화장품 성분, 세안법을 안내하는 AI 피부 상담 챗봇이라고 소개합니다.
인사나 감사 표현에는 짧고 자연스럽게 답변합니다.
피부와 관련 없는 질문에는 피부 관련 질문을 해달라고 안내합니다.

답변 규칙

1.검색 자료에서 질문과 관련된 내용을 찾아 이해하기 쉽게 요약합니다.
2.검색 자료에 구체적인 내용이 부족하면 그 사실을 한 문장으로 알린 뒤, 일반적으로 권장되는 안전한 관리 방법을 별도로 안내합니다.
3.세안법, 관리법, 스킨케어 질문은 실행 가능한 방법을 번호 목록으로 3~5개 제시합니다.
4.성분 질문은 성분명, 기대할 수 있는 역할, 사용 시 주의점을 함께 설명합니다.
5.치료 효과를 단정하지 말고 "도움이 될 수 있습니다"와 같이 표현합니다.
6.과도한 사용, 강한 마찰, 임의 압출 등 피부를 악화시킬 수 있는 행동을 주의시킵니다.
7.질문과 관련 없는 내용이나 확인되지 않은 수치와 효과를 만들지 않습니다.
8.답변은 핵심 위주로 간결하게 작성하고 반드시 완성된 문장으로 끝냅니다.
9.필요한 경우 마지막에 개인차와 피부과 상담이 필요한 상황을 짧게 안내합니다.

검색 자료

{context}

사용자 질문

{question}

출력 형식 최우선 규칙

일반 텍스트만 출력합니다.
마크다운 문법을 절대 사용하지 않습니다.
제목 앞에 # 문자를 붙이지 않습니다.
별표, 밑줄, 백틱, 코드 블록 기호를 사용하지 않습니다.
HTML 태그를 사용하지 않습니다.
제목은 아무 기호 없이 일반 텍스트 한 줄로 작성합니다.
목록이 필요하면 1. 2. 3. 형식만 사용합니다.
불필요하게 긴 설명은 줄이고 핵심 내용을 우선합니다.
이 규칙은 검색 자료의 형식보다 우선합니다.
"""

app = Flask(__name__)
initialize_lock = threading.Lock()
session_registry_lock = threading.Lock()
session_histories = {}
session_locks = {}
runtime = {"ready": False, "error": None, "retriever": None, "chain": None, "ingredient_dict": {}}


def load_ingredient_dictionary():
    if not INGREDIENT_PATH.exists():
        return {}
    import pandas as pd

    dataframe = pd.read_excel(INGREDIENT_PATH)
    if not {"english", "korean"}.issubset(dataframe.columns):
        raise ValueError("성분 사전에 english, korean 열이 필요합니다.")
    return {
        str(english): str(korean)
        for english, korean in zip(dataframe["english"], dataframe["korean"])
        if str(english).strip() and str(korean).strip()
    }


def translate_ingredients(text):
    for english, korean in sorted(runtime["ingredient_dict"].items(), key=lambda item: len(item[0]), reverse=True):
        text = re.sub(rf"(?<!\()\b{re.escape(english)}\b", f"{korean}({english})", text, flags=re.IGNORECASE)
    return text


def remove_markdown(text):
    text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
    text = re.sub(r"```(?:\w+)?", "", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"__(.*?)__", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"<[^>\n]+>", "", text)
    text = re.sub(r"(?m)^\s*>\s?", "", text)
    text = re.sub(r"(?m)^\s*[-+*]\s+", "", text)
    text = text.replace("*", "")
    return text.strip()


def initialize_runtime():
    if runtime["ready"]:
        return
    with initialize_lock:
        if runtime["ready"]:
            return
        if not CHROMA_PATH.exists():
            raise FileNotFoundError(f"Chroma DB를 찾을 수 없습니다: {CHROMA_PATH}")
        try:
            embeddings = OllamaEmbeddings(
                model=EMBEDDING_MODEL,
                base_url=OLLAMA_BASE_URL,
                keep_alive=KEEP_ALIVE_SECONDS,
            )
            vector_db = Chroma(persist_directory=str(CHROMA_PATH), embedding_function=embeddings)
            model = ChatOllama(
                model=CHAT_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.1,
                num_predict=NUM_PREDICT,
                num_ctx=8192,
                keep_alive=KEEP_ALIVE,
            )
            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("placeholder", "{chat_history}"),
                ("human", "{question}"),
            ])
            runtime["retriever"] = vector_db.as_retriever(
                search_type="mmr", search_kwargs={"k": 5, "fetch_k": 30}
            )
            runtime["chain"] = prompt | model | StrOutputParser()
            runtime["ingredient_dict"] = load_ingredient_dictionary()
            runtime["ready"] = True
            runtime["error"] = None
        except Exception as error:
            runtime["error"] = str(error)
            raise


def format_documents(documents):
    return "\n\n".join(document.page_content for document in documents)


def get_session_lock(session_id):
    with session_registry_lock:
        return session_locks.setdefault(session_id, threading.Lock())


def get_session_history(session_id):
    with session_registry_lock:
        return session_histories.setdefault(session_id, InMemoryChatMessageHistory())


def run_warmup_question(question):
    documents = runtime["retriever"].invoke(question)
    runtime["chain"].invoke({
        "context": format_documents(documents),
        "question": question,
        "chat_history": [],
    })
    return len(documents)


def warmup_runtime():
    started_at = time.perf_counter()
    initialize_runtime()
    questions = [
        "건성 피부 관리 방법을 간단히 알려줘",
        "민감성 피부 관리 방법을 간단히 알려줘",
        "지성 피부 관리 방법을 간단히 알려줘",
        "복합성 피부 관리 방법을 간단히 알려줘",
    ][:WARMUP_PARALLELISM]
    with ThreadPoolExecutor(max_workers=len(questions)) as executor:
        document_counts = list(executor.map(run_warmup_question, questions))
    elapsed_seconds = time.perf_counter() - started_at
    print(
        f"Chatbot RAG warmup completed in {elapsed_seconds:.2f}s "
        f"with {len(questions)} parallel requests and "
        f"{sum(document_counts)} documents",
        flush=True,
    )


if WARMUP_ENABLED:
    warmup_runtime()


@app.get("/health")
def health():
    chroma_exists = CHROMA_PATH.exists()
    ingredient_exists = INGREDIENT_PATH.exists()
    assets_ready = chroma_exists and ingredient_exists

    response = jsonify({
        "status": "ok" if assets_ready else "missing_assets",
        "ready": runtime["ready"],
        "chromaExists": chroma_exists,
        "ingredientExists": ingredient_exists,
    })
    return response, 200 if assets_ready else 503


@app.post("/chat")
def chat():
    body = request.get_json(silent=True) or {}
    message = str(body.get("message", "")).strip()
    session_id = str(body.get("sessionId", "")).strip()
    if not message:
        return jsonify({"error": "질문을 입력해 주세요."}), 400
    if not session_id:
        return jsonify({"error": "sessionId가 필요합니다."}), 400
    if len(message) > 1000:
        return jsonify({"error": "질문은 1,000자 이하로 입력해 주세요."}), 400

    try:
        initialize_runtime()
        session_lock = get_session_lock(session_id)
        with session_lock:
            history = get_session_history(session_id)
            documents = runtime["retriever"].invoke(message)
            answer = runtime["chain"].invoke({
                "context": format_documents(documents),
                "question": message,
                "chat_history": history.messages,
            })
            answer = translate_ingredients(answer)
            answer = remove_markdown(answer)
            history.add_user_message(message)
            history.add_ai_message(answer)

        sources = []
        for document in documents:
            source = document.metadata.get("source")
            if source and source not in sources:
                sources.append(source)
        return jsonify({"answer": answer, "sessionId": session_id, "sources": sources})
    except Exception as error:
        app.logger.exception("챗봇 응답 생성 실패")
        return jsonify({"error": f"챗봇 서버를 준비하지 못했습니다: {error}"}), 503


@app.delete("/sessions/<session_id>")
def clear_session(session_id):
    session_lock = get_session_lock(session_id)
    with session_lock:
        with session_registry_lock:
            session_histories.pop(session_id, None)
    return jsonify({"status": "cleared", "sessionId": session_id})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
