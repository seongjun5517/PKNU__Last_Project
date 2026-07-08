import { springApi } from "../config/axiosInstance";

export const getCommunityCategoryList = () => springApi.get("/community/categories");
export const getCommunityPostList = () => springApi.get("/community/posts");
export const getCommunityPost = (postCode) => springApi.get(`/community/posts/${postCode}`);
export const insertCommunityPost = (post) => springApi.post("/community/posts", post);
export const likeCommunityPost = (postCode, userId) =>
  springApi.post(`/community/posts/${postCode}/like`, { userId });
export const getCommunityPostLikeStatus = (postCode, userId) =>
  springApi.get(`/community/posts/${postCode}/like`, { params: { userId } });
