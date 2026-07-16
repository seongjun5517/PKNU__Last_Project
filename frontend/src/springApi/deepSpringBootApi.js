import { springApi } from "../config/axiosInstance";

export const getTodayDeepResult = () => springApi.get("/deep/today");

export const getLatestDeepResult = () => springApi.get("/deep/latest");

export const getDeepHistory = () => springApi.get("/deep/history");

export const deleteLatestDeepResult = () => springApi.delete("/deep/latest");

export const deleteTodayDeepResult = () => springApi.delete("/deep/today");

export const deleteDeepHistoryByDate = (date) =>
  springApi.delete("/deep/date", { params: { date } });
