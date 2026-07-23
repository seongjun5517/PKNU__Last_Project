import { springApi } from "../config/axiosInstance";

export const saveSkinTypeResult = (results) =>
  springApi.post("/skin-type/results", { results });

export const getLatestSkinTypeResult = () =>
  springApi.get(`/skin-type/results/latest`);

export const getTodaySkinTypeResult = () =>
  springApi.get(`/skin-type/results/today`);

export const deleteTodaySkinTypeResult = () =>
  springApi.delete(`/skin-type/results/today`);

export const deleteLatestSkinTypeResult = () =>
  springApi.delete(`/skin-type/results/latest`);

export const getSkinTypeHistory = () =>
  springApi.get(`/skin-type/results/history`);
