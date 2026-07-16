import { springApi } from "../config/axiosInstance";

export const submitFeedback = (data) => springApi.post("/feedback", data);

export const getFeedbackSubmissionStatus = (feedbackType) =>
  springApi.get("/feedback/status", { params: { feedbackType } });

export const getFeedbackList = () => springApi.get("/api/admin/feedback");
