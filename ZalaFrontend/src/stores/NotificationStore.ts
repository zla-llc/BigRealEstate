import { create } from "zustand";
import type { Notification } from "../hooks/api/types";

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => void;
  clearAll: () => void;
};

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.viewed).length,
    }),
    
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.viewed ? 0 : 1),
    })),
    
  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, viewed: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.viewed).length,
      };
    }),
    
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
