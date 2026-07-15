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

## Docker 배포

배포 서버의 `chatbot-flask/data` 안에 다음 구조가 있어야 합니다.

```text
chatbot-flask/data/
├─ Chroma_DB_Skin_v6/
└─ ingredient_dictionary_100.xlsx
```

이 데이터는 용량 때문에 Git에 포함되지 않으므로 서버에 별도로 복사해야 합니다. 다른 위치에 저장했다면 루트 `.env`의 `CHATBOT_DATA_DIR`에 해당 경로를 지정합니다.

CPU 서버에서는 프로젝트 루트에서 다음 구성을 사용합니다.

```bash
docker compose up -d --build
```

Ollama는 외부 포트로 공개되지 않고 Docker 내부에서만 접근합니다. `ollama-init` 서비스가 `gemma3:4b`와 `nomic-embed-text` 모델을 준비하며, 다운로드된 모델은 `ollama_models` 볼륨에 보존됩니다.
