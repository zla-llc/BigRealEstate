import { useState, useEffect, useRef } from "react";
import { useAuthStore, useNotificationStore, useTeamsStore } from "../../stores";
import { useApi } from "../../hooks";
import { wsManager } from "../../utils";
import { CONFIG } from "../../config";
import { Icons, Icon } from "../icons";
import type { Notification, TeamWithMembers } from "../../hooks/api/types";

export const NotificationBell = () => {
  const user = useAuthStore((state) => state.user);
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead,
    removeNotification,
  } = useNotificationStore();
  const { addTeam, removeTeam } = useTeamsStore();
  const api = useApi();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedNotifications = useRef(false);
  const wsConnected = useRef(false);
  
  const PREVIEW_COUNT = 3;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, PREVIEW_COUNT);
  const hasMoreNotifications = notifications.length > PREVIEW_COUNT;

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

    // Listen for team_deleted events - remove team from My Teams in real-time
    const unsubscribeTeamDeleted = wsManager.on<{ team_id: number; team_name: string }>("team_deleted", (message) => {
      console.log("[NotificationBell] Team deleted:", message.data);
      removeTeam(message.data.team_id);
    });

    // Listen for team_joined events - add team to My Teams when user accepts invitation
    const unsubscribeTeamJoined = wsManager.on<TeamWithMembers>("team_joined", (message) => {
      console.log("[NotificationBell] Team joined:", message.data);
      addTeam(message.data);
    });

    // Listen for member_kicked events - remove team from My Teams when user is kicked
    const unsubscribeMemberKicked = wsManager.on<{ team_id: number; team_name: string }>("member_kicked", (message) => {
      console.log("[NotificationBell] Kicked from team:", message.data);
      removeTeam(message.data.team_id);
    });

    return () => {
      unsubscribe();
      unsubscribeTeamDeleted();
      unsubscribeTeamJoined();
      unsubscribeMemberKicked();
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
    notificationId: number,
    _teamId?: number // teamId kept for backwards compatibility, WebSocket handles team addition now
  ) => {
    if (!user) return;
    
    const response = await api.respondToInvitation({
      invitation_id: invitationId,
      accept,
      user_id: user.userId,
    });

    if (!response.err) {
      markAsRead(notificationId);
      
      // Note: If accepted, the backend sends a team_joined WebSocket event
      // which will automatically add the team to the store
      
      // Refresh notifications after accepting/declining
      const refreshResponse = await api.getNotifications(user.userId);
      if (refreshResponse.data) {
        setNotifications(refreshResponse.data);
      }
    }
  };

  const onClearNotification = async (notificationId: number) => {
    const response = await api.deleteNotification(notificationId);
    if (!response.err) {
      removeNotification(notificationId);
    }
  };

  // Helper to get notification icon and color based on type
  const getNotificationStyle = (type: string | undefined | null) => {
    switch (type) {
      case "team_invite":
        return { icon: "📨", color: "bg-blue-500", label: "Invitation" };
      case "team_invite_accepted":
        return { icon: "✅", color: "bg-green-500", label: "Accepted" };
      case "team_invite_declined":
        return { icon: "❌", color: "bg-red-500", label: "Declined" };
      case "team_removed":
        return { icon: "🚫", color: "bg-orange-500", label: "Removed" };
      default:
        return { icon: "🔔", color: "bg-accent", label: null };
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
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  // Mark all visible unread notifications as read
                  for (const notif of displayedNotifications.filter(n => !n.viewed)) {
                    await onMarkAsRead(notif.notification_id);
                  }
                }}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-secondary-50 text-sm">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-secondary-10">
              {displayedNotifications.map((notif) => {
                const style = getNotificationStyle(notif.type);
                const isInvitePending = notif.type === "team_invite" && notif.invitation_id && !notif.viewed;
                const isInviteResponded = notif.type === "team_invite_accepted" || notif.type === "team_invite_declined";
                const isRemoved = notif.type === "team_removed";
                
                return (
                  <div
                    key={notif.notification_id}
                    className={`p-3 hover:bg-secondary-10 transition-colors ${
                      !notif.viewed ? "bg-accent/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Icon indicator */}
                      <div className="text-lg flex-shrink-0">
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Status badge for responded invites */}
                        {(isInviteResponded || isRemoved) && style.label && (
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white mb-1 ${style.color}`}>
                            {style.label}
                          </span>
                        )}
                        
                        <p className="text-sm text-secondary line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-secondary-50 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>

                        {/* Action buttons for pending team invites */}
                        {isInvitePending && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                onRespondToInvitation(
                                  notif.invitation_id!,
                                  true,
                                  notif.notification_id,
                                  notif.team_id
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
                                  notif.notification_id,
                                  notif.team_id
                                )
                              }
                              className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Clear button for responded invites and removal notifications */}
                        {(isInviteResponded || isRemoved) && (
                          <button
                            onClick={() => onClearNotification(notif.notification_id)}
                            className="text-xs text-secondary-50 hover:text-red-500 mt-2 flex items-center gap-1"
                          >
                            <span>✕</span> Clear
                          </button>
                        )}

                        {/* Mark as read for unread notifications (except pending invites which have Accept/Decline) */}
                        {!notif.viewed && !isInvitePending && (
                          <button
                            onClick={() => onMarkAsRead(notif.notification_id)}
                            className="text-xs text-accent hover:underline mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      
                      {/* Clear button on the right side */}
                      <button
                        onClick={() => onClearNotification(notif.notification_id)}
                        className="text-secondary-50 hover:text-red-500 p-1 flex-shrink-0"
                        title="Clear notification"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All / Show Less button */}
          {hasMoreNotifications && (
            <div className="p-2 border-t border-secondary-25">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-sm text-accent hover:bg-accent/5 rounded-lg transition-colors"
              >
                {showAll ? `Show Less` : `View All (${notifications.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
