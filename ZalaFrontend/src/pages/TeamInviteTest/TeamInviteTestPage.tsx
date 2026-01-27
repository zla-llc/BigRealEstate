import { useState, useEffect, useRef } from "react";
import { TextInput, Button, IconButton } from "../../components";
import { Icons, Icon } from "../../components/icons";
import { IconButtonVariant } from "../../components/buttons";
import { useApi } from "../../hooks";
import { useSnack } from "../../hooks/utils";
import { useAuthStore, useTeamsStore } from "../../stores";
import { CONFIG } from "../../config";
import type {
  TeamWithMembers,
  TeamInvitation,
} from "../../hooks/api/types";

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
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

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
          const { user_id, username, profile_pic, role } = message.data;
          
          const newMember = {
            role: role || "member",
            user: {
              user_id,
              username: username || `User #${user_id}`,
              profile_pic: profile_pic || undefined,
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
    loadTeams();
  };

  // Invite handler
  const onInvite = async () => {
    if (!user || !selectedTeam || !inviteEmail.trim()) {
      errorMsg("Please select a team and enter an email");
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
    // Backend returns { role, user: { user_id, username, profile_pic } }
    return member.user?.username || `User #${member.user?.user_id ?? "unknown"}`;
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
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the team "${selectedTeam.team_name}"? This action cannot be undone.`)) {
      return;
    }

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
        <p className="text-secondary-50">Please log in to test team features.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 p-6 gap-6 overflow-y-auto">
      {/* Left Column - Teams & Members */}
      <div className="flex flex-col w-1/2 gap-6">
        {/* Create Team Card */}
        <div className="card-base box-shadow p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Icon name={Icons.Group} className="text-accent" />
            <p className="text-xl font-bold text-secondary">Create Team</p>
          </div>
          <TextInput
            label="Team Name"
            placeholder="Enter team name"
            value={newTeamName}
            setValue={setNewTeamName}
          />
          <Button
            text={creatingTeam ? "Creating..." : "Create Team"}
            onClick={onCreateTeam}
            disabled={creatingTeam || !newTeamName.trim()}
          />
        </div>

        {/* My Teams Card */}
        <div className="card-base box-shadow p-6 space-y-4 flex-1">
          <p className="text-xl font-bold text-secondary">My Teams</p>
          {loadingTeams ? (
            <p className="text-secondary-50 text-sm">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-secondary-50 text-sm">No teams yet. Create one above!</p>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <div
                  key={team.team_id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTeam?.team_id === team.team_id
                      ? "bg-accent/10 border-2 border-accent"
                      : "bg-secondary-10 hover:bg-secondary-25"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-secondary">{team.team_name}</p>
                    <span className="text-xs text-secondary-50">
                      {team.members?.length ?? 0} member(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members Card */}
        {selectedTeam && (
          <div className="card-base box-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-secondary">
                Team Members - {selectedTeam.team_name}
              </p>
              <div className="flex items-center gap-2">
                {editMode && isCurrentUserCreator(selectedTeam) && (
                  <Button
                    text={deletingTeam ? "Deleting..." : "Delete Team"}
                    onClick={onDeleteTeam}
                    disabled={deletingTeam}
                  />
                )}
                {/* Only the creator can access Edit mode */}
                {isCurrentUserCreator(selectedTeam) && (
                  <Button
                    text={editMode ? "Done" : "Edit"}
                    onClick={() => setEditMode(!editMode)}
                  />
                )}
              </div>
            </div>
            {selectedTeam.members?.length === 0 ? (
              <p className="text-secondary-50 text-sm">No members yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedTeam.members?.map((member) => {
                  const displayName = getMemberDisplayName(member);
                  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                  const isCurrentUser = member.user.user_id === user?.userId;
                  const isAdmin = member.role === "admin";
                  
                  return (
                    <div
                      key={member.user.user_id}
                      className="flex items-center justify-between p-3 bg-secondary-10 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-secondary">
                            {displayName}
                            {isCurrentUser && <span className="text-xs text-secondary-50 ml-2">(You)</span>}
                          </p>
                          <p className="text-xs text-secondary-50">
                            {isAdmin ? "👑 Admin" : "Member"}
                          </p>
                        </div>
                      </div>
                      {editMode && !isCurrentUser && (
                        <div className="flex items-center gap-2">
                          {!isAdmin && (
                            <Button
                              text={promotingMember === member.user.user_id ? "..." : "Make Admin"}
                              onClick={() => onPromoteToAdmin(member.user.user_id)}
                              disabled={promotingMember === member.user.user_id}
                            />
                          )}
                          {isAdmin && (
                            <Button
                              text={demotingMember === member.user.user_id ? "..." : "Demote"}
                              onClick={() => onDemoteFromAdmin(member.user.user_id)}
                              disabled={demotingMember === member.user.user_id}
                            />
                          )}
                          {removingMember !== member.user.user_id && (
                            <IconButton
                              name={Icons.Trash}
                              onClick={() => onRemoveMember(member.user.user_id)}
                              variant={IconButtonVariant.Destructive}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Invitations */}
      <div className="flex flex-col w-1/2 gap-6">
        {/* Invite to Team Card - Only visible to admins */}
        {selectedTeam && isCurrentUserAdmin(selectedTeam) && (
          <div className="card-base box-shadow p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name={Icons.Mail} className="text-accent" />
              <p className="text-xl font-bold text-secondary">
                Invite to {selectedTeam.team_name}
              </p>
            </div>
            <TextInput
              label="Email Address"
              placeholder="user@example.com"
              value={inviteEmail}
              setValue={setInviteEmail}
            />
            <Button
              text={sendingInvite ? "Sending..." : "Send Invitation"}
              onClick={onInvite}
              disabled={sendingInvite || !inviteEmail.trim()}
            />
          </div>
        )}

        {/* Team Invitations Card */}
        {selectedTeam && (
          <div className="card-base box-shadow p-6 space-y-4 flex-1">
            <p className="text-xl font-bold text-secondary">Team Invitations</p>
            {invitations.length === 0 ? (
              <p className="text-secondary-50 text-sm">No invitations sent yet.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {invitations.map((inv) => (
                  <div
                    key={inv.invitation_id}
                    className="flex items-center justify-between p-3 bg-secondary-10 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-secondary">{inv.recipient_email}</p>
                      <p className="text-xs text-secondary-50">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(inv.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
