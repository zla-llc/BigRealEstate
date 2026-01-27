import { useState, useEffect, useRef } from "react";
import { TextInput } from "../../components";
import { Icons, Icon } from "../../components/icons";
import { useApi } from "../../hooks";
import { useSnack } from "../../hooks/utils";
import { useAuthStore, useTeamsStore } from "../../stores";
import { CONFIG } from "../../config";
import type {
  TeamWithMembers,
  TeamInvitation,
} from "../../hooks/api/types";

// Modal component for creating teams
const CreateTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  setTeamName,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  teamName: string;
  setTeamName: (name: string) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">Create New Team</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-10 rounded-full transition-colors"
          >
            <Icon name={Icons.Close} size={20} className="text-secondary-50" />
          </button>
        </div>
        <TextInput
          label="Team Name"
          placeholder="Enter a name for your team"
          value={teamName}
          setValue={setTeamName}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-secondary-25 text-secondary font-medium hover:bg-secondary-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !teamName.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation modal for destructive actions
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon name={Icons.Trash} size={20} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-secondary">{title}</h2>
        </div>
        <p className="text-secondary-50 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-secondary-25 text-secondary font-medium hover:bg-secondary-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TeamInviteTestPage = () => {
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

  // Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");

  // Load user's teams - called manually, not in useCallback to avoid infinite loops
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

  // Initial load - only once
  useEffect(() => {
    if (user && !hasFetchedTeams.current) {
      hasFetchedTeams.current = true;
      loadTeams();
    }
  }, [user]);

  // Load invitations when team is selected
  useEffect(() => {
    if (selectedTeam) {
      loadInvitations(selectedTeam.team_id);
    }
  }, [selectedTeam?.team_id]);

  // WebSocket for real-time team updates (separate from notification websocket)
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
          // Note: If accepted, the member_joined event will handle adding the new member
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

  // Helper to get display name for member (handles nested user structure from backend)
  const getMemberDisplayName = (member: TeamWithMembers["members"][0]) => {
    // Backend returns { role, user: { user_id, username, profile_pic, first_name, last_name } }
    const { first_name, last_name, username, user_id } = member.user || {};
    
    // Prefer first name + last name if available
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    
    // Fall back to username
    return username || `User #${user_id ?? "unknown"}`;
  };

  // Check if current user is the team creator (original admin)
  // Falls back to admin check for teams created before created_by_user_id was added
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

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    if (status === true) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Accepted
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Declined
      </span>
    );
  };

  if (!user) {
    return (
      <div className="flex flex-1 justify-center items-center p-10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
            <Icon name={Icons.Group} size={32} className="text-secondary-50" />
          </div>
          <p className="text-lg font-medium text-secondary mb-2">Welcome to Teams</p>
          <p className="text-secondary-50">Please log in to manage your teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-secondary-5">
      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewTeamName("");
        }}
        onSubmit={onCreateTeam}
        teamName={newTeamName}
        setTeamName={setNewTeamName}
        isLoading={creatingTeam}
      />
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDeleteTeam}
        title="Delete Team"
        message={`Are you sure you want to delete "${selectedTeam?.team_name}"? All members will be removed and this action cannot be undone.`}
        confirmText="Delete Team"
        isLoading={deletingTeam}
      />

      {/* Header */}
      <div className="bg-white border-b border-secondary-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Icon name={Icons.Group} size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">Teams</h1>
              <p className="text-sm text-secondary-50">Manage your teams and members</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Icon name={Icons.Add} size={20} />
            Create Team
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Teams List */}
        <div className="w-80 bg-white border-r border-secondary-10 flex flex-col">
          <div className="p-4 border-b border-secondary-10">
            <p className="text-sm font-medium text-secondary-50 uppercase tracking-wide">
              My Teams ({teams.length})
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            {loadingTeams ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent"></div>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-secondary-10 rounded-full flex items-center justify-center">
                  <Icon name={Icons.Group} size={24} className="text-secondary-50" />
                </div>
                <p className="text-sm text-secondary-50 mb-4">No teams yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-sm text-accent font-medium hover:underline"
                >
                  Create your first team
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => {
                  const isSelected = selectedTeam?.team_id === team.team_id;
                  const memberCount = team.members?.length ?? 0;
                  
                  return (
                    <button
                      key={team.team_id}
                      onClick={() => {
                        setSelectedTeam(team);
                        setEditMode(false);
                        setShowInvitePanel(false);
                        setActiveTab("members");
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-accent text-white shadow-md"
                          : "bg-secondary-5 hover:bg-secondary-10 text-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                        }`}>
                          {team.team_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{team.team_name}</p>
                          <p className={`text-xs ${isSelected ? "text-white/70" : "text-secondary-50"}`}>
                            {memberCount} {memberCount === 1 ? "member" : "members"}
                          </p>
                        </div>
                        {isCurrentUserCreator(team) && (
                          <span className={`text-xs ${isSelected ? "text-white/70" : "text-accent"}`}>
                            👑
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {selectedTeam ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Team Header */}
            <div className="bg-white border-b border-secondary-10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center font-bold text-accent">
                    {selectedTeam.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary">{selectedTeam.team_name}</h2>
                    <p className="text-sm text-secondary-50">
                      {selectedTeam.members?.length ?? 0} members • Created by {
                        isCurrentUserCreator(selectedTeam) 
                          ? "you" 
                          : (() => {
                              const creator = selectedTeam.members?.find(
                                m => m.user.user_id === selectedTeam.created_by_user_id
                              );
                              return creator ? getMemberDisplayName(creator) : "unknown";
                            })()
                      }
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {isCurrentUserAdmin(selectedTeam) && (
                    <button
                      onClick={() => setShowInvitePanel(!showInvitePanel)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        showInvitePanel
                          ? "bg-accent text-white"
                          : "bg-accent/10 text-accent hover:bg-accent/20"
                      }`}
                    >
                      <Icon name={Icons.Add} size={18} />
                      Invite
                    </button>
                  )}
                  {isCurrentUserCreator(selectedTeam) && (
                    <>
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                          editMode
                            ? "bg-secondary text-white"
                            : "bg-secondary-10 text-secondary hover:bg-secondary-25"
                        }`}
                      >
                        <Icon name={editMode ? Icons.Check : Icons.Edit} size={18} />
                        {editMode ? "Done" : "Edit"}
                      </button>
                      {editMode && (
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors"
                        >
                          <Icon name={Icons.Trash} size={18} />
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Invite Panel - Expandable */}
              {showInvitePanel && (
                <div className="mt-4 p-4 bg-secondary-5 rounded-xl">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <TextInput
                        label=""
                        placeholder="Enter email address to invite..."
                        value={inviteEmail}
                        setValue={setInviteEmail}
                      />
                    </div>
                    <button
                      onClick={onInvite}
                      disabled={sendingInvite || !inviteEmail.trim()}
                      className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[42px] self-end"
                    >
                      {sendingInvite ? "Sending..." : "Send Invite"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-secondary-10 px-6">
              <div className="flex gap-6">
                <button 
                  onClick={() => setActiveTab("members")}
                  className={`py-3 border-b-2 font-medium transition-colors ${
                    activeTab === "members"
                      ? "border-accent text-accent"
                      : "border-transparent text-secondary-50 hover:text-secondary"
                  }`}
                >
                  Members ({selectedTeam.members?.length ?? 0})
                </button>
                {isCurrentUserAdmin(selectedTeam) && (
                  <button 
                    onClick={() => setActiveTab("invitations")}
                    className={`py-3 border-b-2 font-medium transition-colors ${
                      activeTab === "invitations"
                        ? "border-accent text-accent"
                        : "border-transparent text-secondary-50 hover:text-secondary"
                    }`}
                  >
                    Invitations ({invitations.length})
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Members Tab */}
              {activeTab === "members" && (
                <>
                  {/* Members Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTeam.members?.map((member) => {
                      const displayName = getMemberDisplayName(member);
                      const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                      const isCurrentUser = member.user.user_id === user?.userId;
                      const isAdmin = member.role === "admin";
                      const isCreator = selectedTeam.created_by_user_id === member.user.user_id;
                      
                      return (
                        <div
                          key={member.user.user_id}
                          className="bg-white rounded-xl border border-secondary-10 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                isCreator ? "bg-gradient-to-br from-yellow-400 to-orange-500" :
                                isAdmin ? "bg-gradient-to-br from-accent to-blue-600" :
                                "bg-gradient-to-br from-secondary-50 to-secondary"
                              }`}>
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-secondary">
                                  {displayName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs font-normal text-secondary-50">(You)</span>
                                  )}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {isCreator ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                      👑 Owner
                                    </span>
                                  ) : isAdmin ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent">
                                      ⭐ Admin
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-10 text-secondary-50">
                                      Member
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Edit Actions */}
                            {editMode && !isCurrentUser && !isCreator && (
                              <div className="flex flex-col gap-1">
                                {!isAdmin ? (
                                  <button
                                    onClick={() => onPromoteToAdmin(member.user.user_id)}
                                    disabled={promotingMember === member.user.user_id}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                                  >
                                    {promotingMember === member.user.user_id ? "..." : "Promote"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onDemoteFromAdmin(member.user.user_id)}
                                    disabled={demotingMember === member.user.user_id}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary-10 text-secondary hover:bg-secondary-25 transition-colors disabled:opacity-50"
                                  >
                                    {demotingMember === member.user.user_id ? "..." : "Demote"}
                                  </button>
                                )}
                                <button
                                  onClick={() => onRemoveMember(member.user.user_id)}
                                  disabled={removingMember === member.user.user_id}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  {removingMember === member.user.user_id ? "..." : "Remove"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Empty state for members */}
                  {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
                        <Icon name={Icons.Group} size={32} className="text-secondary-50" />
                      </div>
                      <p className="text-lg font-medium text-secondary mb-2">No members yet</p>
                      <p className="text-secondary-50 mb-4">Start by inviting people to your team</p>
                      {isCurrentUserAdmin(selectedTeam) && (
                        <button
                          onClick={() => setShowInvitePanel(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                        >
                          <Icon name={Icons.Add} size={18} />
                          Invite Members
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Invitations Tab */}
              {activeTab === "invitations" && (
                <>
                  {invitations.length > 0 ? (
                    <div className="space-y-3">
                      {invitations.map((inv) => {
                        const isPending = inv.status === null;
                        
                        return (
                          <div
                            key={inv.invitation_id}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary-10 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary-10 flex items-center justify-center">
                                <Icon name={Icons.Mail} size={20} className="text-secondary-50" />
                              </div>
                              <div>
                                <p className="font-medium text-secondary">{inv.recipient_email}</p>
                                <p className="text-xs text-secondary-50">
                                  Sent {new Date(inv.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(inv.status)}
                              {isPending && (
                                <button
                                  onClick={() => onCancelInvitation(inv.invitation_id)}
                                  disabled={cancelingInvitation === inv.invitation_id}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  {cancelingInvitation === inv.invitation_id ? "..." : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
                        <Icon name={Icons.Mail} size={32} className="text-secondary-50" />
                      </div>
                      <p className="text-lg font-medium text-secondary mb-2">No invitations yet</p>
                      <p className="text-secondary-50 mb-4">Invite people to join your team</p>
                      {isCurrentUserAdmin(selectedTeam) && (
                        <button
                          onClick={() => {
                            setShowInvitePanel(true);
                            setActiveTab("members");
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                        >
                          <Icon name={Icons.Add} size={18} />
                          Invite Someone
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Empty State - No Team Selected */
          <div className="flex-1 flex items-center justify-center bg-secondary-5">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <Icon name={Icons.Group} size={40} className="text-secondary-25" />
              </div>
              <p className="text-xl font-semibold text-secondary mb-2">Select a team</p>
              <p className="text-secondary-50 mb-6">Choose a team from the sidebar to view details</p>
              {teams.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <Icon name={Icons.Add} size={20} />
                  Create Your First Team
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
