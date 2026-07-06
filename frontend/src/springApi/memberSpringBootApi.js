// axiosInstance.js 불러들이기
// - springApi 변수 사용
import { springApi } from "../config/axiosInstance";

// 회원 전체 목록 조회
export const getMemberList = () => springApi.get("/user/list");

// 회원가입
export const insertMember = (member) => springApi.post("/user/insert", member);

// 로그인
export const loginMember = (member) => springApi.post("/user/login", member);
