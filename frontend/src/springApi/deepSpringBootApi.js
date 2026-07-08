import { springApi } from "../config/axiosInstance";

// GET /deep/today?userId=xxx
export const getTodayDeepResult = (userId) =>
  springApi.get("/deep/today", { params: { userId } });

// GET /deep/history?userId=xxx  ← 백엔드에 아직 없음, 추가 필요
export const getDeepHistory = (userId) =>
  springApi.get("/deep/history", { params: { userId } });