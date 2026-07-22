import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "C:/pknu_202601/Last_project/outputs/019f88b4-ec56-79b3-bb1a-870b864f4e9d";
const outputPath = `${outputDir}/Triple_Skin_요구사항정의서.xlsx`;
const previewPath = `${outputDir}/Triple_Skin_요구사항정의서_전체.png`;

const requirements = [
  ["공통", "서비스 진입", "시작 화면 제공", "페이지", "• Triple Skin 서비스의 목적과 주요 기능을 소개한다.\n• 회원가입, 로그인 및 주요 서비스 화면으로 이동할 수 있는 진입 경로를 제공한다.", "React `/`, `/start`"],
  ["공통", "공통 UI", "헤더·푸터 및 로고 표시", "페이지", "• 모든 주요 화면에 서비스 로고와 공통 탐색 메뉴를 표시한다.\n• 푸터에 서비스 안내와 AI 결과의 비의료적 참고 정보임을 고지한다.", "공통 Layout"],
  ["공통", "공통 UI", "인증 상태별 메뉴 제공", "R", "• 로그인 여부와 사용자 권한에 따라 로그인, 로그아웃, 마이페이지, 관리자 메뉴를 구분해 표시한다.\n• 인증이 필요한 기능 접근 시 로그인 화면으로 안내한다.", "세션 기반"],
  ["공통", "공통 UI", "반응형 화면 및 오류 안내", "페이지", "• 데스크톱·태블릿·모바일 화면 폭에 맞춰 콘텐츠를 재배치한다.\n• API 지연, 연결 실패, 권한 오류 및 빈 결과를 사용자 메시지로 안내한다.", "React/CSS"],

  ["비회원", "회원관리", "회원가입", "C", "• 아이디, 이메일, 비밀번호, 닉네임, 생년월일 및 선택 프로필 이미지를 입력받는다.\n• 아이디 또는 이메일 중복 시 가입을 차단하고 원인을 안내한다.\n• 가입 성공 후 로그인할 수 있도록 저장한다.", "POST `/user/insert`"],
  ["비회원", "회원관리", "로그인", "C", "• 아이디와 비밀번호로 로그인한다.\n• 성공 시 서버 세션을 생성하고 메인 서비스로 이동한다.\n• 자격 증명이 올바르지 않으면 오류 메시지를 표시한다.", "POST `/api/auth/login`"],
  ["사용자", "회원관리", "로그아웃", "D", "• 로그아웃 요청 시 서버 세션과 인증 정보를 무효화한다.\n• 브라우저의 세션 쿠키를 삭제하고 비회원 상태로 전환한다.", "POST `/api/auth/logout`"],
  ["사용자", "회원관리", "내 회원정보 조회", "R", "• 로그인한 사용자의 아이디, 이메일, 닉네임, 생년월일, 권한 및 프로필 정보를 조회한다.\n• 조회 정보는 마이페이지와 공통 헤더에 반영한다.", "GET `/api/auth/me`"],
  ["공통", "회원관리", "공개 프로필 조회", "R", "• 게시글·댓글 작성자의 공개 가능한 닉네임과 프로필 정보를 조회한다.\n• 비밀번호 등 민감 정보는 응답에서 제외한다.", "GET `/user/public/{id}`"],
  ["사용자", "회원관리", "회원정보 수정", "RU", "• 마이페이지에서 닉네임과 프로필 이미지 경로를 수정한다.\n• 변경 성공 시 화면의 사용자 정보를 즉시 갱신한다.", "PUT `/user/me`"],
  ["사용자", "회원관리", "프로필 이미지 업로드", "CU", "• 이미지 파일을 선택해 프로필 사진으로 저장한다.\n• 빈 파일과 10MB 초과 파일은 거부한다.\n• 안전한 파일명으로 저장하고 공개 이미지 URL을 반환한다.", "10MB 이하"],
  ["사용자", "회원관리", "비밀번호 변경", "U", "• 현재 비밀번호를 검증한 후 새 비밀번호로 변경한다.\n• 검증 실패 시 변경하지 않고 오류 사유를 안내한다.", "PUT `/user/me/password`"],
  ["사용자", "회원관리", "회원탈퇴", "D", "• 본인 계정 삭제 확인 후 회원과 연관 데이터를 삭제한다.\n• 처리 완료 시 현재 세션을 무효화하고 서비스 시작 화면으로 이동한다.", "DELETE `/user/me`"],

  ["사용자", "메인화면", "개인 대시보드 조회", "R", "• 최신 피부 타입, 최신 AI 분석, 일정, 커뮤니티 활동을 한 화면에서 요약한다.\n• 데이터가 없는 영역에는 진단 또는 일정 등록을 유도하는 빈 상태를 표시한다.", "React `/main`"],
  ["사용자", "메인화면", "최신 진단 바로가기", "R", "• 최근 피부 유형 진단과 이미지 분석의 핵심 결과를 표시한다.\n• 각 카드에서 상세 결과, 재진단 및 분석 화면으로 이동할 수 있다.", "피부유형·AI 연동"],
  ["사용자", "메인화면", "일정 및 커뮤니티 요약", "R", "• 오늘·다가오는 피부 관리 일정을 우선 표시한다.\n• 최신 커뮤니티 게시글을 표시하고 상세 페이지로 연결한다.", "캘린더·커뮤니티 연동"],

  ["사용자", "피부유형 설문", "설문 질문 제공", "R", "• 공통, T존, U존, 민감도 영역별 질문과 단일 선택지를 제공한다.\n• 질문을 섹션 단위로 나누어 단계적으로 표시한다.", "설문 JSON v1"],
  ["사용자", "피부유형 설문", "답변 진행 및 검증", "C", "• 선택한 답변과 현재 설문 단계를 유지하고 진행률을 표시한다.\n• 현재 단계의 필수 질문에 답하지 않으면 다음 단계 또는 제출을 차단한다.", "클라이언트 검증"],
  ["사용자", "피부유형 설문", "피부 유형 점수 계산", "분석", "• 건성, 지성, 중성, 민감성 점수를 답변별 가중치로 합산한다.\n• T존과 U존의 우세 유형 및 민감도 비율을 계산한다.\n• 영역 차이를 반영해 최종 피부 유형을 결정한다.", "Triple Skin 계산 로직"],
  ["사용자", "피부유형 설문", "진단 결과 저장", "C", "• T존, U존, 민감도, 최종 결과와 백분율을 사용자 계정에 저장한다.\n• 유효하지 않거나 비어 있는 결과는 저장하지 않는다.", "POST `/skin-type/results`"],
  ["사용자", "피부유형 결과", "진단 결과 조회", "R", "• 최신 결과, 오늘 결과 및 전체 이력을 조회한다.\n• 얼굴 영역별 유형·비율, 최종 유형, 진단 일시를 시각적으로 표시한다.", "latest/today/history"],
  ["사용자", "피부유형 결과", "맞춤 관리 정보 제공", "R", "• 최종 피부 유형에 맞는 권장 성분과 제품 탐색 정보를 제공한다.\n• 제품 항목에서 외부 쇼핑 검색으로 이동할 수 있다.", "올리브영 검색 연동"],
  ["사용자", "피부유형 결과", "결과 삭제 및 재진단", "D", "• 오늘 또는 최신 진단 결과 삭제 전 사용자 확인을 받는다.\n• 삭제 완료 후 설문을 다시 수행할 수 있도록 초기화한다.", "DELETE `/skin-type/results/*`"],

  ["사용자", "AI 피부 분석", "피부 이미지 입력", "C", "• 기기에서 피부 이미지를 선택하거나 카메라 촬영 이미지를 입력할 수 있다.\n• 미리보기를 제공하고 분석 전 이미지를 다시 선택할 수 있다.", "React `/analysis1`"],
  ["사용자", "AI 피부 분석", "이미지 파일 검증", "C", "• 빈 파일, 비이미지 파일 및 10MB 초과 파일을 차단한다.\n• 서버 요청 전체 크기는 11MB 이내로 제한하고 초과 시 명확한 오류를 반환한다.", "이미지 10MB 이하"],
  ["시스템", "AI 피부 분석", "YOLO 피부 상태 추론", "분석", "• 업로드 이미지를 YOLOv8 모델로 분석한다.\n• 여드름, 아토피, 색소침착·잡티, 정상 영역을 신뢰도 기준으로 탐지한다.\n• 추론 실패 시 원본 저장 및 결과 저장을 중단한다.", "YOLO Flask `/predict`"],
  ["사용자", "AI 피부 분석", "탐지 결과 시각화", "R", "• 탐지된 피부 상태별 영역과 개수를 결과 화면에 표시한다.\n• 분석 결과가 반영된 이미지와 상태별 설명을 함께 제공한다.", "4개 탐지 유형"],
  ["사용자", "AI 피부 분석", "분석 결과 저장", "C", "• 탐지 유형, 유형별 개수, 분석 이미지 경로 및 분석 일시를 사용자 계정에 저장한다.\n• 동일 요청 처리 실패 시 충돌 상태를 안내한다.", "POST `/deep/save`"],
  ["사용자", "AI 피부 분석", "분석 결과 및 이력 조회", "R", "• 오늘 결과, 최신 결과 및 날짜별 전체 이력을 조회한다.\n• 이력 차트에서 날짜별 탐지 개수 변화를 비교할 수 있다.", "GET `/deep/*`"],
  ["사용자", "AI 피부 분석", "분석 결과 삭제 및 재분석", "D", "• 특정 결과, 선택 날짜, 오늘 결과 또는 최신 결과를 삭제한다.\n• 삭제 전 확인을 받고 완료 후 새 분석을 수행할 수 있게 한다.", "DELETE `/deep/*`"],
  ["사용자", "AI 피부 분석", "상태별 관리 정보 제공", "R", "• 탐지된 피부 상태에 맞는 관리 팁과 권장 성분을 제공한다.\n• 관련 제품을 외부 쇼핑몰에서 검색할 수 있는 링크를 제공한다.", "결과 화면 추천"],

  ["사용자", "피부관리 일정", "캘린더 및 일정 조회", "R", "• 로그인 사용자의 피부 관리 일정을 월간 캘린더와 목록으로 조회한다.\n• 날짜별 할 일과 다가오는 일정을 구분해 표시한다.", "GET `/calendar`"],
  ["사용자", "피부관리 일정", "일정 등록", "C", "• 날짜, 제목, 설명, 카테고리 및 선택 이미지 정보를 입력해 일정을 등록한다.\n• 필수값 누락 시 저장하지 않고 입력을 요청한다.", "POST `/calendar`"],
  ["사용자", "피부관리 일정", "일정 상세 및 수정", "RU", "• 선택한 일정의 상세 내용을 조회하고 본인 일정만 수정한다.\n• 수정 후 캘린더와 목록에 변경 내용을 즉시 반영한다.", "GET/PUT `/calendar/{id}`"],
  ["사용자", "피부관리 일정", "일정 삭제", "D", "• 본인 일정만 삭제할 수 있다.\n• 삭제 대상이 없거나 다른 사용자의 일정이면 처리하지 않는다.", "DELETE `/calendar/{id}`"],

  ["공통", "커뮤니티", "카테고리·게시글 목록 조회", "R", "• 커뮤니티 카테고리와 게시글 목록을 조회한다.\n• 비회원도 목록과 게시글 내용을 열람할 수 있다.", "GET `/community/*`"],
  ["공통", "커뮤니티", "게시글 검색·필터·정렬", "R", "• 전체 또는 카테고리별로 게시글을 필터링한다.\n• 제목·내용 검색을 지원하고 최신순, 추천순, 조회순으로 정렬한다.", "클라이언트 목록 기능"],
  ["공통", "커뮤니티", "게시글 상세 및 조회수", "RU", "• 게시글 제목, 내용, 작성자, 작성일, 조회수, 좋아요·스크랩 수를 표시한다.\n• 로그인 사용자의 상세 열람 시 조회수를 반영한다.", "GET/POST `/posts/{id}`"],
  ["사용자", "커뮤니티", "게시글 작성", "C", "• 카테고리, 제목, 내용을 입력해 게시글을 작성한다.\n• 필수 입력을 검증하고 성공 시 생성된 게시글 상세 화면으로 이동한다.", "POST `/community/posts`"],
  ["사용자", "커뮤니티", "게시글 수정·삭제", "UD", "• 작성자 본인만 게시글을 수정하거나 삭제할 수 있다.\n• 권한이 없거나 대상이 없으면 적절한 오류를 반환한다.", "PUT/DELETE `/posts/{id}`"],
  ["공통", "커뮤니티", "댓글 조회 및 작성", "RC", "• 게시글별 댓글과 작성자 공개 프로필을 조회한다.\n• 로그인 사용자는 빈 내용이 아닌 댓글을 등록할 수 있다.", "`/posts/{id}/comments`"],
  ["사용자", "커뮤니티", "댓글 수정·삭제", "UD", "• 댓글 작성자 본인만 댓글 내용을 수정하거나 삭제할 수 있다.\n• 삭제 결과는 게시글 상세의 댓글 목록에 즉시 반영한다.", "`/community/comments/{id}`"],
  ["사용자", "커뮤니티", "게시글 좋아요", "CRD", "• 게시글 좋아요 상태를 조회하고 클릭 시 등록·해제를 전환한다.\n• 사용자와 게시글 조합별 중복 좋아요를 허용하지 않는다.", "`/posts/{id}/like`"],
  ["사용자", "커뮤니티", "게시글 스크랩", "CRD", "• 게시글 스크랩 상태를 조회하고 등록·해제를 전환한다.\n• 사용자와 게시글 조합별 중복 스크랩을 허용하지 않는다.", "`/posts/{id}/scrap`"],
  ["사용자", "커뮤니티", "게시글 신고", "C", "• 신고 사유를 선택하거나 입력해 게시글을 신고한다.\n• 같은 사용자의 동일 게시글 중복 신고를 차단하고 본인 게시글 신고를 제한한다.", "POST `/posts/{id}/reports`"],
  ["사용자", "커뮤니티", "내 커뮤니티 활동 조회", "R", "• 내가 작성한 게시글·댓글과 좋아요·스크랩한 게시글을 구분해 조회한다.\n• 각 항목에서 원문 게시글 상세 화면으로 이동할 수 있다.", "마이페이지 활동 탭"],

  ["사용자", "알림", "알림 목록 및 미확인 수 조회", "R", "• 댓글·좋아요 등 사용자 활동 알림을 최신순으로 조회한다.\n• 읽지 않은 알림 수를 헤더 배지에 표시한다.", "GET `/notifications*`"],
  ["사용자", "알림", "알림 읽음 처리", "U", "• 개별 알림 또는 전체 알림을 읽음 상태로 변경한다.\n• 관련 게시글이 있으면 알림 선택 시 상세 화면으로 이동한다.", "PATCH `/notifications/*`"],
  ["사용자", "알림", "알림 삭제", "D", "• 개별 알림을 삭제하거나 읽은 알림을 일괄 삭제한다.\n• 다른 사용자의 알림은 변경하거나 삭제할 수 없다.", "DELETE `/notifications/*`"],

  ["사용자", "서비스 피드백", "분석 피드백 등록", "C", "• 피부 유형 또는 AI 이미지 분석 결과에 대해 평가와 최대 1,000자의 의견을 등록한다.\n• 최신 분석 건별 중복 제출을 차단한다.", "POST `/feedback`"],
  ["사용자", "서비스 피드백", "피드백 제출 상태 조회", "R", "• 분석 유형별 최신 결과에 대한 피드백 제출 여부를 조회한다.\n• 이미 제출한 경우 입력 폼 대신 완료 상태를 표시한다.", "GET `/feedback/status`"],

  ["공통", "피부 상담 챗봇", "플로팅 챗봇 열기", "페이지", "• 모든 주요 화면에서 플로팅 버튼으로 피부 상담 패널을 열고 닫을 수 있다.\n• 최초 이용 시 사용 방법과 의료 진단 대체가 아님을 안내한다.", "FloatingChatbot"],
  ["공통", "피부 상담 챗봇", "RAG 피부 상담", "CR", "• 최대 1,000자의 질문을 입력받아 피부 연구 자료를 검색하고 한국어 답변을 생성한다.\n• 검색 근거와 일반 관리 원칙을 구분하고 피부 성분 영문명에 한국어 표기를 제공한다.", "POST `/chat`"],
  ["공통", "피부 상담 챗봇", "대화 문맥 및 새 대화", "RD", "• 브라우저 세션 식별자별로 대화 문맥을 유지한다.\n• 새 대화 선택 시 해당 세션 기록을 삭제하고 초기 안내로 되돌린다.\n• 서버 준비 중·네트워크 오류를 구분해 안내한다.", "DELETE `/sessions/{id}`"],

  ["관리자", "운영관리", "회원 목록 조회", "R", "• 전체 회원의 관리용 목록을 조회한다.\n• SUPER_ADMIN 권한이 없는 사용자의 접근을 거부한다.", "GET `/api/admin/users`"],
  ["관리자", "운영관리", "피드백 목록 조회", "R", "• 사용자가 제출한 분석 유형, 평가, 내용 및 제출 일시를 조회한다.\n• 유형·평가별 통계를 요약해 운영 개선에 활용한다.", "GET `/api/admin/feedback`"],
  ["관리자", "운영관리", "커뮤니티 신고 처리", "RU", "• 게시글별 신고 건수와 신고 내역을 조회한다.\n• 처리 결정을 저장하고 필요한 경우 신고 대상 게시글에 조치한다.\n• SUPER_ADMIN만 수행할 수 있다.", "`/reports/*`, SUPER_ADMIN"],

  ["시스템", "보안·품질", "인증·권한 및 CSRF 보호", "보안", "• 서버 세션 기반 인증을 적용하고 로그인 시 세션 ID를 변경한다.\n• 관리자 API는 SUPER_ADMIN 역할로 제한한다.\n• 상태 변경 요청은 CSRF 보호 정책을 적용한다.", "Spring Security"],
  ["시스템", "보안·품질", "사용자 데이터 소유권 검증", "보안", "• 일정, 분석 결과, 게시글, 댓글, 알림 조회·변경 시 로그인 사용자와 데이터 소유자를 검증한다.\n• 타인의 식별자를 사용한 접근은 403 또는 404로 차단한다.", "IDOR 방지"],
  ["시스템", "보안·품질", "비밀번호 및 파일 안전성", "보안", "• 비밀번호는 단방향 해시로 저장하고 평문 비밀번호를 응답하지 않는다.\n• 업로드 경로를 정규화하고 안전한 파일명과 용량 제한을 적용한다.", "PasswordEncoder·경로 검증"],
  ["시스템", "운영·데이터", "데이터 무결성 및 영속성", "연동", "• MySQL에 회원, 진단, 일정, 커뮤니티, 알림, 피드백 데이터를 영속화한다.\n• 외래키, 고유키 및 연쇄 삭제 규칙으로 중복과 고아 데이터를 방지한다.", "MySQL 8.0"],
  ["시스템", "운영·데이터", "서비스 분리 및 상태 확인", "연동", "• React, Spring Boot, YOLO Flask, 챗봇 Flask, MySQL, Ollama를 독립 서비스로 구성한다.\n• AI 서비스는 상태 확인 API를 제공하고 장애 시 사용자 화면이 대체 안내를 표시한다.", "Docker Compose·`/health`"],
];

for (const row of requirements) {
  for (let column = 0; column < row.length; column += 1) {
    if (typeof row[column] === "string") {
      row[column] = row[column].replaceAll("`", "");
    }
  }
}

await fs.mkdir(outputDir, { recursive: true });
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("요구사항정의서");
sheet.getRange("A1:F1").merge();
sheet.getRange("A2:F2").merge();
sheet.getRange("A1").values = [["사용자 요구사항 정의서_트리플 스킨 프로젝트"]];
sheet.getRange("A2").values = [["CRUD : C(입력), R(조회), U(수정), D(삭제) / 기타 : 페이지, 분석, 보안, 연동"]];
sheet.getRange("A3:F3").values = [["페이지 구분", "그룹", "요구사항명", "기능", "요구사항 설명", "비고"]];

const startRow = 4;
const endRow = startRow + requirements.length - 1;
sheet.getRange(`A${startRow}:F${endRow}`).values = requirements;

const border = { preset: "all", style: "thin", color: "#595959" };
sheet.getRange("A1:F1").format = {
  fill: "#A6A6A6",
  font: { typeface: "맑은 고딕", bold: true, fontSize: 16, color: "#111111" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: border,
};
sheet.getRange("A2:F2").format = {
  fill: "#FFFFFF",
  font: { typeface: "맑은 고딕", italic: true, fontSize: 10, color: "#333333" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  borders: border,
};
sheet.getRange("A3:F3").format = {
  fill: "#BFBFBF",
  font: { typeface: "맑은 고딕", bold: true, fontSize: 10, color: "#111111" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: border,
};
sheet.getRange(`A${startRow}:F${endRow}`).format = {
  fill: "#FFFFFF",
  font: { typeface: "맑은 고딕", fontSize: 9, color: "#111111" },
  verticalAlignment: "center",
  wrapText: true,
  borders: border,
};

sheet.getRange(`A${startRow}:B${endRow}`).format.horizontalAlignment = "center";
sheet.getRange(`C${startRow}:C${endRow}`).format.horizontalAlignment = "left";
sheet.getRange(`D${startRow}:D${endRow}`).format.horizontalAlignment = "center";
sheet.getRange(`E${startRow}:F${endRow}`).format.horizontalAlignment = "left";

sheet.getRange("A:A").format.columnWidth = 12;
sheet.getRange("B:B").format.columnWidth = 18;
sheet.getRange("C:C").format.columnWidth = 23;
sheet.getRange("D:D").format.columnWidth = 10;
sheet.getRange("E:E").format.columnWidth = 62;
sheet.getRange("F:F").format.columnWidth = 24;
sheet.getRange("1:1").format.rowHeight = 30;
sheet.getRange("2:2").format.rowHeight = 22;
sheet.getRange("3:3").format.rowHeight = 28;

for (let index = 0; index < requirements.length; index += 1) {
  const descriptionLines = requirements[index][4].split("\n").length;
  const noteLines = requirements[index][5].split("\n").length;
  const height = Math.max(40, 16 + Math.max(descriptionLines, noteLines) * 15);
  sheet.getRange(`${startRow + index}:${startRow + index}`).format.rowHeight = height;
}
sheet.getRange(`A${startRow}:F${endRow}`).format.autofitRows();

sheet.freezePanes.freezeRows(3);
sheet.showGridLines = false;

const keyCheck = await workbook.inspect({
  kind: "table",
  range: `요구사항정의서!A1:F${endRow}`,
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 6,
  maxChars: 10000,
});
console.log("KEY_CHECK");
console.log(keyCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log("ERROR_SCAN");
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "요구사항정의서",
  range: `A1:F${endRow}`,
  scale: 1.25,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const topPreview = await workbook.render({
  sheetName: "요구사항정의서",
  range: "A1:F18",
  scale: 2,
  format: "png",
});
await fs.writeFile(`${outputDir}/Triple_Skin_요구사항정의서_상단확대.png`, new Uint8Array(await topPreview.arrayBuffer()));

const bottomPreview = await workbook.render({
  sheetName: "요구사항정의서",
  range: `A49:F${endRow}`,
  scale: 2,
  format: "png",
});
await fs.writeFile(`${outputDir}/Triple_Skin_요구사항정의서_하단확대.png`, new Uint8Array(await bottomPreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, previewPath, rows: requirements.length, endRow }));
