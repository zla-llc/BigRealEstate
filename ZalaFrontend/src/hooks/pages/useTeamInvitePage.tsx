import { useState, useEffect, useRef } from "react";
import { useApi } from "../api";
import { useSnack } from "../utils";
import { useAuthStore, useTeamsStore } from "../../stores";
import { CONFIG } from "../../config";
import type {
  TeamWithMembers,
  TeamInvitation,
  TeamAnnouncement,
} from "../api/types";

export const useTeamInvitePage = () => {
  const api = useApi();
  const [successMsg, errorMsg] = useSnack();
  const user = useAuthStore((state) => state.user);

  // Teams store - use as single source of truth
  const teams = useTeamsStore((state) => state.teams);
  const setTeams = useTeamsStore((state) => state.setTeams);
  const removeTeam = useTeamsStore((state) => state.removeTeam);

  // Ref to prevent infinite fetching
  const hasFetchedTeams = useRef(false);

  // State
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [announcements, setAnnouncements] = useState<TeamAnnouncement[]>([]);

  // Separate loading states
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removingMember, setRemovingMember] = useState<number | null>(null);
  const [promotingMember, setPromotingMember] = useState<number | null>(null);
  const [demotingMember, setDemotingMember] = useState<number | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [cancelingInvitation, setCancelingInvitation] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<number | null>(null);

  // Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "invitations" | "announcements">("members");

  // Load user's teams
  const loadTeams = async () => {
    if (!user) return;
    setLoadingTeams(true);
    const response = await api.getTeamsByUser(user.userId);
    if (response.data) {
      setTeams(response.data);
    }
    setLoadingTeams(false);
  };

  // Load team invitations
  const loadInvitations = async (teamId: number) => {
    if (!user) return;
    const response = await api.getTeamInvitations(teamId, user.userId);
    if (response.data) {
      setInvitations(response.data);
    }
  };

  // Load team announcements
  const loadAnnouncements = async (teamId: number) => {
    if (!user) return;
    setLoadingAnnouncements(true);
    const response = await api.getTeamAnnouncements(teamId, user.userId);
    if (response.data) {
      setAnnouncements(response.data);
    }
    setLoadingAnnouncements(false);
  };

  // Initial load - only once
  useEffect(() => {
    if (user && !hasFetchedTeams.current) {
      hasFetchedTeams.current = true;
      loadTeams();
    }
  }, [user]);

  // Load invitations and announcements when team is selected
  useEffect(() => {
    if (selectedTeam) {
      loadInvitations(selectedTeam.team_id);
      loadAnnouncements(selectedTeam.team_id);
    }
  }, [selectedTeam?.team_id]);

  // WebSocket for real-time team updates
  useEffect(() => {
    if (!selectedTeam || !user) return;

    const wsProtocol = CONFIG.api.startsWith("https") ? "wss" : "ws";
    const wsHost = CONFIG.api.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${wsHost}/ws/team/${selectedTeam.team_id}`;

    console.log("[TeamWS] Connecting to:", wsUrl);
    const teamSocket = new WebSocket(wsUrl);
    const currentTeamId = selectedTeam.team_id;

    teamSocket.onopen = () => {
      console.log("[TeamWS] Connected to team", currentTeamId);
    };

    teamSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[TeamWS] Received:", message);

        if (message.type === "invitation_update") {
          const updatedInvitation = message.data;

          // Update invitation status in list
          setInvitations((prev) =>
            prev.map((inv) =>
              inv.invitation_id === updatedInvitation.invitation_id
                ? { ...inv, status: updatedInvitation.status }
                : inv
            )
          );
        }

        if (message.type === "member_joined") {
          console.log("[TeamWS] Member joined, updating state...");
          const { user_id, username, profile_pic, first_name, last_name, role } = message.data;

          const newMember = {
            role: role || "member",
            user: {
              user_id,
              username: username || `User #${user_id}`,
              profile_pic: profile_pic || undefined,
              first_name: first_name || undefined,
              last_name: last_name || undefined,
            },
          };

          // Add new member to selectedTeam
          setSelectedTeam((prev) => {
            if (!prev) return prev;
            // Check if member already exists to avoid duplicates
            if (prev.members.some((m) => m.user.user_id === user_id)) {
              return prev;
            }
            return {
              ...prev,
              members: [...prev.members, newMember],
            };
          });

          // Add new member to teams list
          setTeams((prev) =>
            prev.map((t) => {
              if (t.team_id !== currentTeamId) return t;
              // Check if member already exists
              if (t.members.some((m) => m.user.user_id === user_id)) {
                return t;
              }
              return {
                ...t,
                members: [...t.members, newMember],
              };
            })
          );
        }

        if (message.type === "member_removed") {
          console.log("[TeamWS] Member removed, updating state...");
          const removedUserId = message.data.user_id;

          // Update selectedTeam by removing the member immediately
          setSelectedTeam((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              members: prev.members.filter((m) => m.user.user_id !== removedUserId),
            };
          });

          // Update teams list
          setTeams((prev) =>
            prev.map((t) => {
              if (t.team_id !== currentTeamId) return t;
              return {
                ...t,
                members: t.members.filter((m) => m.user.user_id !== removedUserId),
              };
            })
          );
        }

        if (message.type === "member_role_changed") {
          console.log("[TeamWS] Member role changed, updating state...");
          const { user_id: changedUserId, new_role: newRole } = message.data;

          // Update selectedTeam by changing the member's role
          setSelectedTeam((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              members: prev.members.map((m) =>
                m.user.user_id === changedUserId ? { ...m, role: newRole } : m
              ),
            };
          });

          // Update teams list
          setTeams((prev) =>
            prev.map((t) => {
              if (t.team_id !== currentTeamId) return t;
              return {
                ...t,
                members: t.members.map((m) =>
                  m.user.user_id === changedUserId ? { ...m, role: newRole } : m
                ),
              };
            })
          );
        }

        if (message.type === "team_deleted") {
          console.log("[TeamWS] Team deleted, removing from state...");
          const deletedTeamId = message.data.team_id;

          // Clear selected team if it's the deleted one
          setSelectedTeam((prev) => {
            if (prev?.team_id === deletedTeamId) {
              return null;
            }
            return prev;
          });

          // Remove the team from teams list
          setTeams((prev) => prev.filter((t) => t.team_id !== deletedTeamId));

          // Also remove from the global store
          removeTeam(deletedTeamId);

          // Exit edit mode if active
          setEditMode(false);
        }

        // Handle new announcements in real-time
        if (message.type === "new_announcement") {
          console.log("[TeamWS] New announcement received:", message.data);
          const newAnnouncement: TeamAnnouncement = {
            announcement_id: message.data.announcement_id,
            team_id: message.data.team_id,
            author_id: message.data.author_id,
            title: message.data.title,
            message: message.data.message,
            created_at: message.data.created_at,
            author: {
              user_id: message.data.author_id,
              username: message.data.author_name,
              profile_pic: message.data.author_profile_pic,
            },
          };
          
          // Add to beginning of announcements list
          setAnnouncements((prev) => [newAnnouncement, ...prev]);
        }

        // Handle announcement updates
        if (message.type === "announcement_updated") {
          console.log("[TeamWS] Announcement updated:", message.data);
          setAnnouncements((prev) =>
            prev.map((a) =>
              a.announcement_id === message.data.announcement_id
                ? { ...a, title: message.data.title, message: message.data.message, updated_at: message.data.updated_at }
                : a
            )
          );
        }

        // Handle announcement deletions
        if (message.type === "announcement_deleted") {
          console.log("[TeamWS] Announcement deleted:", message.data);
          setAnnouncements((prev) =>
            prev.filter((a) => a.announcement_id !== message.data.announcement_id)
          );
        }
      } catch (error) {
        console.error("[TeamWS] Failed to parse message:", error);
      }
    };

    teamSocket.onerror = (error) => {
      console.error("[TeamWS] Error:", error);
    };

    teamSocket.onclose = () => {
      console.log("[TeamWS] Disconnected from team", currentTeamId);
    };

    return () => {
      console.log("[TeamWS] Cleaning up connection for team", currentTeamId);
      teamSocket.close();
    };
  }, [selectedTeam?.team_id, user]);

  // Create team handler
  const onCreateTeam = async () => {
    if (!user || !newTeamName.trim()) {
      errorMsg("Team name is required");
      return;
    }

    // Check if user is already in a team (users can only join 1 team)
    if (teams.length > 0) {
      errorMsg("You're already on a team. Leave your current team first to create a new one.");
      return;
    }

    setCreatingTeam(true);
    const response = await api.createTeam({
      team_name: newTeamName.trim(),
      admin_user_id: user.userId,
    });
    setCreatingTeam(false);

    if (response.err || !response.data) {
      errorMsg(response.err ?? "Failed to create team");
      return;
    }

    successMsg(`Team "${response.data.team_name}" created!`);
    setNewTeamName("");
    setShowCreateModal(false);
    loadTeams();
  };

  // Invite handler
  const onInvite = async () => {
    if (!user || !selectedTeam || !inviteEmail.trim()) {
      errorMsg("Please enter an email address");
      return;
    }

    setSendingInvite(true);
    const response = await api.inviteToTeam({
      team_id: selectedTeam.team_id,
      sender_id: user.userId,
      recipient_email: inviteEmail.trim(),
    });
    setSendingInvite(false);

    if (response.err || !response.data) {
      errorMsg(response.err ?? "Failed to send invitation");
      return;
    }

    successMsg(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setShowInvitePanel(false);
    loadInvitations(selectedTeam.team_id);
  };

  // Remove member handler
  const onRemoveMember = async (memberId: number) => {
    if (!user || !selectedTeam) return;

    setRemovingMember(memberId);
    const response = await api.removeMemberFromTeam(
      selectedTeam.team_id,
      memberId
    );
    setRemovingMember(null);

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    successMsg("Member removed from team");

    // Update UI immediately (WebSocket will also update, but this ensures immediate feedback)
    setSelectedTeam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter((m) => m.user.user_id !== memberId),
      };
    });
    setTeams((prev) =>
      prev.map((t) => {
        if (t.team_id !== selectedTeam.team_id) return t;
        return {
          ...t,
          members: t.members.filter((m) => m.user.user_id !== memberId),
        };
      })
    );
  };

  // Promote member to admin handler
  const onPromoteToAdmin = async (memberId: number) => {
    if (!user || !selectedTeam) return;

    setPromotingMember(memberId);
    const response = await api.promoteToAdmin(selectedTeam.team_id, memberId);
    setPromotingMember(null);

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    successMsg("Member promoted to admin");

    // Update UI immediately
    setSelectedTeam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.user.user_id === memberId ? { ...m, role: "admin" } : m
        ),
      };
    });
    setTeams((prev) =>
      prev.map((t) => {
        if (t.team_id !== selectedTeam.team_id) return t;
        return {
          ...t,
          members: t.members.map((m) =>
            m.user.user_id === memberId ? { ...m, role: "admin" } : m
          ),
        };
      })
    );
  };

  // Demote admin to member handler
  const onDemoteFromAdmin = async (memberId: number) => {
    if (!user || !selectedTeam) return;

    setDemotingMember(memberId);
    const response = await api.demoteFromAdmin(selectedTeam.team_id, memberId);
    setDemotingMember(null);

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    successMsg("Admin demoted to member");

    // Update UI immediately
    setSelectedTeam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.user.user_id === memberId ? { ...m, role: "member" } : m
        ),
      };
    });
    setTeams((prev) =>
      prev.map((t) => {
        if (t.team_id !== selectedTeam.team_id) return t;
        return {
          ...t,
          members: t.members.map((m) =>
            m.user.user_id === memberId ? { ...m, role: "member" } : m
          ),
        };
      })
    );
  };

  // Post announcement handler (admin only)
  const onPostAnnouncement = async () => {
    if (!user || !selectedTeam) return;

    if (!announcementTitle.trim()) {
      errorMsg("Please enter a title for your announcement");
      return;
    }

    if (!announcementMessage.trim()) {
      errorMsg("Please enter a message for your announcement");
      return;
    }

    setPostingAnnouncement(true);
    const response = await api.createAnnouncement({
      team_id: selectedTeam.team_id,
      author_id: user.userId,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
    });
    setPostingAnnouncement(false);

    if (response.err || !response.data) {
      errorMsg(response.err ?? "Failed to post announcement");
      return;
    }

    successMsg("Announcement posted!");
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setShowAnnouncementModal(false);
    // The WebSocket will add the announcement to the list in real-time
  };

  // Delete announcement handler (admin only)
  const onDeleteAnnouncement = async (announcementId: number) => {
    if (!user || !selectedTeam) return;

    setDeletingAnnouncement(announcementId);
    const response = await api.deleteAnnouncement(
      selectedTeam.team_id,
      announcementId,
      user.userId
    );
    setDeletingAnnouncement(null);

    if (response.err) {
      errorMsg(response.err ?? "Failed to delete announcement");
      return;
    }

    successMsg("Announcement deleted");
    // The WebSocket will remove the announcement from the list in real-time
  };

  // Helper to get display name for member
  const getMemberDisplayName = (member: TeamWithMembers["members"][0]) => {
    const { first_name, last_name, username, user_id } = member.user || {};

    // Prefer first name + last name if available
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }

    // Fall back to username
    return username || `User #${user_id ?? "unknown"}`;
  };

  // Check if current user is the team creator (original admin)
  const isCurrentUserCreator = (team: TeamWithMembers | null): boolean => {
    if (!team || !user) return false;
    // If created_by_user_id is set, check if current user is the creator
    if (team.created_by_user_id) {
      return team.created_by_user_id === user.userId;
    }
    // Fallback for old teams: treat any admin as having creator privileges
    return team.members.some(
      (m) => m.user.user_id === user.userId && m.role === "admin"
    );
  };

  // Check if current user is any admin of the selected team
  const isCurrentUserAdmin = (team: TeamWithMembers | null): boolean => {
    if (!team || !user) return false;
    return team.members.some(
      (m) => m.user.user_id === user.userId && m.role === "admin"
    );
  };

  // Delete team handler
  const onDeleteTeam = async () => {
    if (!user || !selectedTeam) return;

    setDeletingTeam(true);
    const response = await api.deleteTeam(selectedTeam.team_id, user.userId);
    setDeletingTeam(false);

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    successMsg(`Team "${selectedTeam.team_name}" deleted`);

    // Remove team from list and clear selection
    setTeams((prev) => prev.filter((t) => t.team_id !== selectedTeam.team_id));
    setSelectedTeam(null);
    setInvitations([]);
    setEditMode(false);
    setShowDeleteModal(false);
  };

  // Cancel invitation handler
  const onCancelInvitation = async (invitationId: number) => {
    if (!user || !selectedTeam) return;

    setCancelingInvitation(invitationId);
    const response = await api.cancelInvitation(invitationId, user.userId);
    setCancelingInvitation(null);

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    successMsg("Invitation canceled");

    // Remove from invitations list
    setInvitations((prev) => prev.filter((inv) => inv.invitation_id !== invitationId));
  };

  // Select a team
  const onSelectTeam = (team: TeamWithMembers) => {
    setSelectedTeam(team);
    setEditMode(false);
    setShowInvitePanel(false);
    setActiveTab("members");
  };

  // Open create modal
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  // Close create modal
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTeamName("");
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Open delete modal
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  // Toggle invite panel
  const toggleInvitePanel = () => {
    setShowInvitePanel(!showInvitePanel);
  };

  return {
    // User
    user,

    // Teams data
    teams,
    selectedTeam,
    invitations,
    announcements,

    // Loading states
    loading: {
      creatingTeam,
      loadingTeams,
      sendingInvite,
      removingMember,
      promotingMember,
      demotingMember,
      deletingTeam,
      cancelingInvitation,
      postingAnnouncement,
      loadingAnnouncements,
      deletingAnnouncement,
    },

    // UI states
    editMode,
    showCreateModal,
    showDeleteModal,
    showInvitePanel,
    showAnnouncementModal,
    activeTab,

    // Form values
    forms: {
      newTeamName,
      setNewTeamName,
      inviteEmail,
      setInviteEmail,
      announcementTitle,
      setAnnouncementTitle,
      announcementMessage,
      setAnnouncementMessage,
    },

    // Actions
    actions: {
      onCreateTeam,
      onInvite,
      onRemoveMember,
      onPromoteToAdmin,
      onDemoteFromAdmin,
      onDeleteTeam,
      onCancelInvitation,
      onSelectTeam,
      loadTeams,
      onPostAnnouncement,
      onDeleteAnnouncement,
    },

    // Modal/UI controls
    controls: {
      openCreateModal,
      closeCreateModal,
      toggleEditMode,
      openDeleteModal,
      closeDeleteModal,
      toggleInvitePanel,
      setActiveTab,
      setShowInvitePanel,
      setShowAnnouncementModal,
    },

    // Helper functions
    helpers: {
      getMemberDisplayName,
      isCurrentUserCreator,
      isCurrentUserAdmin,
      // User can only be in one team
      canCreateOrJoinTeam: teams.length === 0,
    },
  };
};
