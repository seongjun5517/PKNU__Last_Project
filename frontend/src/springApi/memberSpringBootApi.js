// axiosInstance.js 불러들이기
// - springApi 변수 사용
import { springApi } from "../config/axiosInstance";

// 회원 전체 목록 조회
export const getMemberList = () => springApi.get("/api/admin/users");

// 회원가입
export const insertMember = (member) => springApi.post("/user/insert", member);

// Spring Security 서버 세션 로그인
export const loginMember = (member) => {
  const form = new URLSearchParams();
  form.append("user_id", member.user_id);
  form.append("user_pwd", member.user_pwd);

  return springApi.post("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const getCurrentMember = () => springApi.get("/api/auth/me");

export const logoutMember = () => springApi.post("/api/auth/logout");

// 회원가입/정보수정 프로필 이미지 업로드
export const uploadMemberProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return springApi.post("/user/me/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
