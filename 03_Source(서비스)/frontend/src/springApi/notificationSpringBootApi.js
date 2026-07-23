import { springApi } from "../config/axiosInstance";

export const getNotifications = () => springApi.get("/notifications");

export const getUnreadNotificationCount = () =>
  springApi.get("/notifications/unread-count");

export const markNotificationRead = (notiCode) =>
  springApi.patch(`/notifications/${notiCode}/read`);

export const markAllNotificationsRead = () =>
  springApi.patch("/notifications/read-all");

export const deleteNotification = (notiCode) =>
  springApi.delete(`/notifications/${notiCode}`);

export const deleteReadNotifications = () =>
  springApi.delete("/notifications/read");
