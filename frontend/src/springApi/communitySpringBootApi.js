import { springApi } from "../config/axiosInstance";

export const getCommunityCategoryList = () => springApi.get("/community/categories");
export const getCommunityPostList = () => springApi.get("/community/posts");
export const getCommunityPost = (postCode) => springApi.get(`/community/posts/${postCode}`);
export const increaseCommunityPostView = (postCode, userId) =>
  springApi.post(`/community/posts/${postCode}/view`, { userId });
export const insertCommunityPost = (post) => springApi.post("/community/posts", post);
export const updateCommunityPost = (postCode, post) =>
  springApi.put(`/community/posts/${postCode}`, post);
export const deleteCommunityPost = (postCode, userId) =>
  springApi.delete(`/community/posts/${postCode}`, { params: { userId } });
export const likeCommunityPost = (postCode, userId) =>
  springApi.post(`/community/posts/${postCode}/like`, { userId });
export const getCommunityPostLikeStatus = (postCode, userId) =>
  springApi.get(`/community/posts/${postCode}/like`, { params: { userId } });
export const scrapCommunityPost = (postCode, userId) =>
  springApi.post(`/community/posts/${postCode}/scrap`, { userId });
export const getCommunityPostScrapStatus = (postCode, userId) =>
  springApi.get(`/community/posts/${postCode}/scrap`, { params: { userId } });
export const getCommunityPostComments = (postCode) =>
  springApi.get(`/community/posts/${postCode}/comments`);
export const createCommunityPostComment = (postCode, userId, contents) =>
  springApi.post(`/community/posts/${postCode}/comments`, { userId, contents });
export const getMyCommunityComments = (userId) =>
  springApi.get(`/community/comments/mine/${userId}`);
export const deleteCommunityComment = (commentCode, userId) =>
  springApi.delete(`/community/comments/${commentCode}`, { params: { userId } });
