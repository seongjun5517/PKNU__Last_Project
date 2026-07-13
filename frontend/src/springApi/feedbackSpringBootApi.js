import { springApi } from "../config/axiosInstance";

export const submitFeedback = (data) => springApi.post("/feedback", data);

export const getFeedbackSubmissionStatus = (userId, feedbackType) =>
  springApi.get("/feedback/status", { params: { userId, feedbackType } });

export const getFeedbackList = (adminUserId) =>
  springApi.get("/feedback", { params: { adminUserId } });
