import { springApi } from "../config/axiosInstance";

export const getNotifications = (userId) =>
  springApi.get("/notifications", { params: { userId } });

export const getUnreadNotificationCount = (userId) =>
  springApi.get("/notifications/unread-count", { params: { userId } });

export const markNotificationRead = (notiCode, userId) =>
  springApi.patch(`/notifications/${notiCode}/read`, null, {
    params: { userId },
  });

export const markAllNotificationsRead = (userId) =>
  springApi.patch("/notifications/read-all", null, { params: { userId } });

export const deleteNotification = (notiCode, userId) =>
  springApi.delete(`/notifications/${notiCode}`, { params: { userId } });

export const deleteReadNotifications = (userId) =>
  springApi.delete("/notifications/read", { params: { userId } });
