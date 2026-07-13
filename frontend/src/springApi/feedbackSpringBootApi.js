import { springApi } from "../config/axiosInstance";

export const submitFeedback = (data) => springApi.post("/feedback", data);

export const getFeedbackList = (adminUserId) =>
  springApi.get("/feedback", { params: { adminUserId } });
