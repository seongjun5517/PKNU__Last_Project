// api/calendarApi.js (예시 파일명)
import { springApi } from "../config/axiosInstance";

export const getCalList = () => springApi.get(`/calendar`);
export const getCalView = (calCode) => springApi.get(`/calendar/${calCode}`);
export const setCalUpdate = (calCode, data) => springApi.put(`/calendar/${calCode}`, data);
export const setCalInsert = (data) => springApi.post(`/calendar`, data);
export const setCaldel = (calCode) => springApi.delete(`/calendar/${calCode}`);