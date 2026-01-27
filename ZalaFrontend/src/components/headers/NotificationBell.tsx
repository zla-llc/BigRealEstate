import { useState, useEffect, useRef } from "react";
import { useAuthStore, useNotificationStore } from "../../stores";
import { useApi, useAppNavigation } from "../../hooks";
import { wsManager } from "../../utils";
import { CONFIG } from "../../config";
import { Icons, Icon } from "../icons";
import type { Notification } from "../../hooks/api/types";

export const NotificationBell = () => {
  const user = useAuthStore((state) => state.user);
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead,
  } = useNotificationStore();
  const api = useApi();
  const { toTeamInviteTestPage } = useAppNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedNotifications = useRef(false);
  const wsConnected = useRef(false);

  // Load notifications on mount - only once
  useEffect(() => {
    if (!user || hasFetchedNotifications.current) return;
    
    hasFetchedNotifications.current = true;
    const loadNotifications = async () => {
      const response = await api.getNotifications(user.userId);
      if (response.data) {
        setNotifications(response.data);
      }
    };
    loadNotifications();
  }, [user]);

  // WebSocket connection for real-time notifications - only fires on events, doesn't poll
  useEffect(() => {
    if (!user || wsConnected.current) return;

    // Construct WebSocket URL
    const wsProtocol = CONFIG.api.startsWith("https") ? "wss" : "ws";
    const wsHost = CONFIG.api.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${wsHost}/ws/notifications/${user.userId}`;

    wsManager.connect(wsUrl);
    wsConnected.current = true;

    // Listen for new notifications - WebSocket only pushes when events happen
    const unsubscribe = wsManager.on<Notification>("notification", (message) => {
      console.log("New notification received:", message);
      addNotification(message.data as Notification);
    });

    return () => {
      unsubscribe();
      wsManager.disconnect();
      wsConnected.current = false;
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onMarkAsRead = async (notificationId: number) => {
    const response = await api.markNotificationRead(notificationId);
    if (response.data) {
      markAsRead(notificationId);
    }
  };

  const onRespondToInvitation = async (
    invitationId: number,
    accept: boolean,
    notificationId: number
  ) => {
    if (!user) return;
    
    const response = await api.respondToInvitation({
      invitation_id: invitationId,
      accept,
      user_id: user.userId,
    });

    if (!response.err) {
      markAsRead(notificationId);
      // Refresh notifications after accepting/declining
      const refreshResponse = await api.getNotifications(user.userId);
      if (refreshResponse.data) {
        setNotifications(refreshResponse.data);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Icon name={Icons.Notification} size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-secondary-25 z-50">
          <div className="p-3 border-b border-secondary-25 flex justify-between items-center">
            <p className="font-bold text-secondary">Notifications</p>
            <button
              onClick={() => {
                setIsOpen(false);
                toTeamInviteTestPage();
              }}
              className="text-xs text-accent hover:underline"
            >
              View All
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-secondary-50 text-sm">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-secondary-10">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.notification_id}
                  className={`p-3 hover:bg-secondary-10 transition-colors ${
                    !notif.viewed ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                        notif.viewed ? "bg-transparent" : "bg-accent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-secondary-50 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>

                      {/* Action buttons for team invites */}
                      {notif.type === "team_invite" && notif.invitation_id && !notif.viewed && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              onRespondToInvitation(
                                notif.invitation_id!,
                                true,
                                notif.notification_id
                              )
                            }
                            className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              onRespondToInvitation(
                                notif.invitation_id!,
                                false,
                                notif.notification_id
                              )
                            }
                            className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {!notif.viewed && notif.type !== "team_invite" && (
                        <button
                          onClick={() => onMarkAsRead(notif.notification_id)}
                          className="text-xs text-accent hover:underline mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
