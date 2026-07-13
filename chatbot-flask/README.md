# 피부 상담 챗봇 Flask 서버

기존 YOLO 추론 서버(`../flask`, 5000번 포트)와 독립적으로 5001번 포트에서 실행됩니다.

## 데이터 준비

노트북에서 만든 아래 자산을 `data` 폴더에 복사합니다.

- `Chroma_DB_Skin_v6` 폴더
- `ingredient_dictionary_100.xlsx`

환경 변수로 다른 위치를 지정하려면 `.env.example`을 참고하세요. Flask는 `.env`를 자동으로 읽지 않으므로 셸에서 환경 변수를 설정하거나 실행 스크립트에서 지정합니다.

## Ollama 준비

```powershell
ollama pull gemma3:4b
ollama pull nomic-embed-text
```

Ollama 앱 또는 `ollama serve`가 실행 중이어야 합니다.

## 실행

```powershell
cd chatbot-flask
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

상태 확인은 `GET http://localhost:5001/health`, 대화 요청은 `POST http://localhost:5001/chat`을 사용합니다.
