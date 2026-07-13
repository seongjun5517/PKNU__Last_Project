import os
import re
import threading
from pathlib import Path

from flask import Flask, jsonify, request
from langchain_chroma import Chroma
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama, OllamaEmbeddings

BASE_DIR = Path(__file__).resolve().parent
CHROMA_PATH = Path(os.getenv("CHATBOT_CHROMA_PATH", BASE_DIR / "data" / "Chroma_DB_Skin_v6"))
INGREDIENT_PATH = Path(os.getenv("CHATBOT_INGREDIENT_PATH", BASE_DIR / "data" / "ingredient_dictionary_100.xlsx"))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
CHAT_MODEL = os.getenv("CHATBOT_MODEL", "gemma3:4b")
EMBEDDING_MODEL = os.getenv("CHATBOT_EMBEDDING_MODEL", "nomic-embed-text")
PORT = int(os.getenv("CHATBOT_PORT", "5001"))

SYSTEM_PROMPT = """
당신은 피부 관련 연구 자료와 일반적인 피부 관리 원칙을 이해하기 쉽게 안내하는 AI 상담사입니다.
사용자의 질문에 바로 답하고, 짧은 거절 문장만 출력하지 마세요.

[답변 작성 원칙]
1. 검색 자료에서 질문과 관련된 내용을 먼저 찾아 자연스럽게 요약합니다.
2. 검색 자료에 구체적인 방법이 부족하면 그 사실을 한 문장으로 알린 뒤, 널리 알려진 보수적이고 안전한 일반 관리 방법을 추가로 안내합니다.
3. 일반 관리 방법은 "일반적으로 권장되는 관리 방법"임을 분명히 하고, 검색 자료에 있는 것처럼 꾸미지 않습니다.
4. 사용자가 세안법·관리법·스킨케어 방법을 물으면 실행 가능한 방법을 번호 목록으로 3~5개 제시합니다.
5. 사용자가 성분을 물으면 성분명, 기대할 수 있는 역할, 사용 시 주의점을 함께 설명합니다.
6. 치료 효과를 단정하지 않고 "도움이 될 수 있습니다"처럼 표현합니다.
7. 과도한 사용, 강한 마찰, 임의 압출 등 악화 가능성이 있는 행동은 주의시킵니다.
8. 마지막에는 개인차와 피부과 상담이 필요한 상황을 짧게 안내합니다.
9. 답변은 한국어로 작성하고, 성분명은 필요한 경우 한국어(영어) 형식으로 표기합니다.
10. 질문과 관련 없는 내용이나 확인되지 않은 구체적인 수치·치료 효과는 만들지 않습니다.

[권장 답변 구성]
- 검색 자료를 바탕으로 한 핵심 설명
- 일반적으로 권장되는 구체적인 관리 방법
- 주의사항

[검색 자료]
{context}

[사용자 질문]
{question}
"""

app = Flask(__name__)
initialize_lock = threading.Lock()
chat_lock = threading.Lock()
session_histories = {}
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


def initialize_runtime():
    if runtime["ready"]:
        return
    with initialize_lock:
        if runtime["ready"]:
            return
        if not CHROMA_PATH.exists():
            raise FileNotFoundError(f"Chroma DB를 찾을 수 없습니다: {CHROMA_PATH}")
        try:
            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL, base_url=OLLAMA_BASE_URL)
            vector_db = Chroma(persist_directory=str(CHROMA_PATH), embedding_function=embeddings)
            model = ChatOllama(
                model=CHAT_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.1,
                num_predict=800,
                num_ctx=8192,
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


@app.get("/health")
def health():
    return jsonify({
        "status": "ok" if runtime["ready"] else "not_initialized",
        "ready": runtime["ready"],
        "error": runtime["error"],
        "chromaPath": str(CHROMA_PATH),
        "chromaExists": CHROMA_PATH.exists(),
        "chatModel": CHAT_MODEL,
        "embeddingModel": EMBEDDING_MODEL,
    })


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
        with chat_lock:
            history = session_histories.setdefault(session_id, InMemoryChatMessageHistory())
            documents = runtime["retriever"].invoke(message)
            answer = runtime["chain"].invoke({
                "context": format_documents(documents),
                "question": message,
                "chat_history": history.messages,
            })
            answer = translate_ingredients(answer)
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
    session_histories.pop(session_id, None)
    return jsonify({"status": "cleared", "sessionId": session_id})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
