/*
 어떤 백엔드 서버와 통신을 할것인지를 정의해 놓는 페이지
  - 백엔드 서버가 여러개면 모두 이곳에 정의함
  - 사용 라이브러리 : axios 라이브러리 import 해야함
*/

// axios 라이브러리 불러들이기
import axios from "axios";

/* SpringBoot 백엔드 서버 통신 설정 */
export const springApi = axios.create({
  // 프록시 서버에서 사용할 대표 URL 정의
  // 실제 백엔드 주소는 setupProxy.js에서 http://localhost:8080으로 연결함
  baseURL: "/spring",

  // HTTP 통신을 위한 헤더 전송정보 정의
  headers: {
    // json 형태의 데이터로 전송하겠다는 규칙 정의
    "Content-Type": "application/json",
  },
});
