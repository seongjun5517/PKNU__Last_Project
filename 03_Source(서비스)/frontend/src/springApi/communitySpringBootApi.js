import { springApi } from "../config/axiosInstance";

export const getCommunityCategoryList = () => springApi.get("/community/categories");
export const getCommunityPostList = () => springApi.get("/community/posts");
export const getCommunityPost = (postCode) => springApi.get(`/community/posts/${postCode}`);
export const increaseCommunityPostView = (postCode) =>
  springApi.post(`/community/posts/${postCode}/view`);
export const insertCommunityPost = (post) => springApi.post("/community/posts", post);
export const updateCommunityPost = (postCode, post) =>
  springApi.put(`/community/posts/${postCode}`, post);
export const deleteCommunityPost = (postCode) =>
  springApi.delete(`/community/posts/${postCode}`);
export const likeCommunityPost = (postCode) =>
  springApi.post(`/community/posts/${postCode}/like`);
export const getCommunityPostLikeStatus = (postCode) =>
  springApi.get(`/community/posts/${postCode}/like`);
export const scrapCommunityPost = (postCode) =>
  springApi.post(`/community/posts/${postCode}/scrap`);
export const getCommunityPostScrapStatus = (postCode) =>
  springApi.get(`/community/posts/${postCode}/scrap`);
export const getCommunityPostComments = (postCode) =>
  springApi.get(`/community/posts/${postCode}/comments`);
export const createCommunityPostComment = (postCode, contents) =>
  springApi.post(`/community/posts/${postCode}/comments`, { contents });
export const createCommunityPostReport = (postCode, reportReason) =>
  springApi.post(`/community/posts/${postCode}/reports`, { reportReason });
export const getCommunityPostReportCount = (postCode) =>
  springApi.get(`/community/posts/${postCode}/reports/count`);
export const getCommunityPostReports = (postCode) =>
  springApi.get(`/community/posts/${postCode}/reports`);
export const resolveCommunityPostReports = (postCode, decision) =>
  springApi.post(`/community/posts/${postCode}/reports/resolve`, { decision });
export const getMyCommunityComments = () =>
  springApi.get(`/community/comments/mine`);
export const deleteCommunityComment = (commentCode) =>
  springApi.delete(`/community/comments/${commentCode}`);
