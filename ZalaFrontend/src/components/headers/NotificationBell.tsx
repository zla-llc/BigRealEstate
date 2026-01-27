import { useNotificationBell } from "../../hooks";
import { Icons, Icon } from "../icons";

export const NotificationBell = () => {
  const {
    user,
    dropdownRef,
    displayedNotifications,
    notifications,
    unreadCount,
    hasMoreNotifications,
    isOpen,
    showAll,
    actions,
    controls,
    helpers,
  } = useNotificationBell();

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={controls.toggleDropdown}
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
                onClick={actions.onMarkAllAsRead}
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
                const style = helpers.getNotificationStyle(notif.type);
                const isPending = helpers.isInvitePending(notif);
                const isResponded = helpers.isInviteResponded(notif);
                const isRemoved = helpers.isRemoved(notif);

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
                        {(isResponded || isRemoved) && style.label && (
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
                        {isPending && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                actions.onRespondToInvitation(
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
                                actions.onRespondToInvitation(
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
                        {(isResponded || isRemoved) && (
                          <button
                            onClick={() => actions.onClearNotification(notif.notification_id)}
                            className="text-xs text-secondary-50 hover:text-red-500 mt-2 flex items-center gap-1"
                          >
                            <span>✕</span> Clear
                          </button>
                        )}

                        {/* Mark as read for unread notifications (except pending invites which have Accept/Decline) */}
                        {!notif.viewed && !isPending && (
                          <button
                            onClick={() => actions.onMarkAsRead(notif.notification_id)}
                            className="text-xs text-accent hover:underline mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>

                      {/* Clear button on the right side */}
                      <button
                        onClick={() => actions.onClearNotification(notif.notification_id)}
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
                onClick={controls.toggleShowAll}
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
