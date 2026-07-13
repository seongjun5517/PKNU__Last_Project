import { chatbotApi } from "../config/axiosInstance";

export const sendChatMessage = (sessionId, message) =>
  chatbotApi.post("/chat", { sessionId, message });

export const clearChatSession = (sessionId) =>
  chatbotApi.delete(`/sessions/${encodeURIComponent(sessionId)}`);
