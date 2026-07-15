# 배포 절차

이 문서는 GPU가 연결된 Linux VM에서 전체 서비스를 Docker Compose로 실행하는 기준입니다.

## 1. 서버 준비

다음 항목이 준비돼 있어야 합니다.

- Docker Engine과 Docker Compose 플러그인
- NVIDIA 드라이버와 NVIDIA Container Toolkit
- 프로젝트 전체 파일
- `flask/models/last_model/best.pt`
- `chatbot-flask/data/Chroma_DB_Skin_v6` 실제 폴더
- `chatbot-flask/data/ingredient_dictionary_100.xlsx`

Windows의 폴더 링크나 바로가기는 Linux 서버에서 사용할 수 없습니다. Chroma DB는 실제 폴더를 복사해야 합니다.

## 2. 환경변수 준비

프로젝트 루트에서 `.env.example`을 `.env`로 복사한 뒤 다음 값을 반드시 변경합니다.

- `MYSQL_ROOT_PASSWORD`: MySQL 관리자용 긴 임의 비밀번호
- `MYSQL_PASSWORD`: 애플리케이션 DB 계정용 별도의 긴 임의 비밀번호
- `APP_PORT`: 외부에서 접속할 HTTP 포트. 기본값은 `80`
- `CHATBOT_DATA_DIR`: 챗봇 데이터가 다른 위치에 있을 때 해당 절대 경로

`.env`는 Git에 올리지 않습니다. 비밀번호에는 서로 다른 값을 사용합니다.

## 3. 데이터 구조 확인

```text
flask/models/last_model/best.pt
chatbot-flask/data/Chroma_DB_Skin_v6/
chatbot-flask/data/ingredient_dictionary_100.xlsx
sql/init.sql
```

하나라도 빠지면 YOLO 또는 챗봇 상태 검사가 실패하고 프런트 서비스가 시작되지 않습니다.

## 4. GPU 배포 시작

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build
```

최초 실행에서는 Ollama 이미지와 두 모델을 내려받기 때문에 시간이 오래 걸릴 수 있습니다. 이후에는 `ollama_models` 볼륨을 재사용합니다.

## 5. 상태 확인

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml ps
docker compose -f docker-compose.yml -f docker-compose.gpu.yml logs --tail=100 spring
docker compose -f docker-compose.yml -f docker-compose.gpu.yml logs --tail=100 yolo-flask
docker compose -f docker-compose.yml -f docker-compose.gpu.yml logs --tail=100 ollama-init
docker compose -f docker-compose.yml -f docker-compose.gpu.yml logs --tail=100 chatbot-flask
docker compose -f docker-compose.yml -f docker-compose.gpu.yml logs --tail=100 frontend
```

`mysql`, `spring`, `yolo-flask`, `ollama`, `chatbot-flask`, `frontend`가 `healthy` 상태인지 확인합니다. `ollama-init`은 모델 준비가 끝나면 종료 코드 `0`으로 끝나는 것이 정상입니다.

## 6. 기능 확인 순서

1. 메인 화면 접속 및 새로고침
2. 회원가입과 로그인
3. 프로필 이미지 업로드 후 다시 접속해 이미지 유지 여부 확인
4. 피부 분석 실행 후 결과 이미지 확인
5. 같은 날 다시 접속했을 때 오늘의 분석 결과 표시 확인
6. 챗봇 질문과 대화 초기화 확인
7. 컨테이너 재시작 후 DB, 분석 이미지, 프로필 이미지, Ollama 모델 유지 확인

## 7. 공개 배포 전 추가 항목

현재 Nginx 설정은 HTTP만 제공합니다. 인터넷에 공개할 때는 도메인과 TLS 인증서를 연결해 HTTPS를 적용하고, 방화벽에서는 실제로 필요한 HTTP/HTTPS 포트만 허용해야 합니다. MySQL, Spring, YOLO, Ollama, 챗봇 포트는 외부에 공개하지 않습니다.

운영 중에는 다음 Docker 볼륨을 정기적으로 백업합니다.

- `mysql_data`
- `profile_images`
- `analysis_images`
- `ollama_models`는 다시 다운로드할 수 있으므로 필요에 따라 백업
