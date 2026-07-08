import { springApi } from "../config/axiosInstance";

export const saveSkinTypeResult = (data) => springApi.post("/skin-type/results", data);

export const getLatestSkinTypeResult = (userId) =>
  springApi.get(`/skin-type/results/latest/${userId}`);

export const getTodaySkinTypeResult = (userId) =>
  springApi.get(`/skin-type/results/today/${userId}`);

export const deleteTodaySkinTypeResult = (userId) =>
  springApi.delete(`/skin-type/results/today/${userId}`);
