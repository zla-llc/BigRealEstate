import { useState, useEffect, useRef } from "react";
import { TextInput, Button, IconButton } from "../../components";
import { Icons, Icon } from "../../components/icons";
import { IconButtonVariant } from "../../components/buttons";
import { useApi } from "../../hooks";
import { useSnack } from "../../hooks/utils";
import { useAuthStore } from "../../stores";
import { CONFIG } from "../../config";
import type {
  TeamWithMembers,
  TeamInvitation,
} from "../../hooks/api/types";

export const TeamInviteTestPage = () => {
  const api = useApi();
  const [successMsg, errorMsg] = useSnack();
  const user = useAuthStore((state) => state.user);
  
  // Ref to prevent infinite fetching
  const hasFetchedTeams = useRef(false);

  // State
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  
  // Separate loading states
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removingMember, setRemovingMember] = useState<number | null>(null);

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

  // Refresh team members
  const refreshTeamMembers = async (team: TeamWithMembers) => {
    const response = await api.getTeamMembers(team.team_id);
    if (response.data) {
      setSelectedTeam(response.data);
      setTeams((prev) =>
        prev.map((t) =>
          t.team_id === response.data!.team_id ? response.data! : t
        )
      );
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
          
          // If accepted, refresh team members
          if (updatedInvitation.status === true) {
            api.getTeamMembers(currentTeamId).then((response) => {
              if (response.data) {
                setSelectedTeam(response.data);
                setTeams((prev) =>
                  prev.map((t) =>
                    t.team_id === response.data!.team_id ? response.data! : t
                  )
                );
              }
            });
          }
        }

        if (message.type === "member_joined") {
          console.log("[TeamWS] Member joined, refreshing...");
          api.getTeamMembers(currentTeamId).then((response) => {
            if (response.data) {
              setSelectedTeam(response.data);
              setTeams((prev) =>
                prev.map((t) =>
                  t.team_id === response.data!.team_id ? response.data! : t
                )
              );
            }
          });
        }

        if (message.type === "member_removed") {
          console.log("[TeamWS] Member removed, refreshing...");
          api.getTeamMembers(currentTeamId).then((response) => {
            if (response.data) {
              setSelectedTeam(response.data);
              setTeams((prev) =>
                prev.map((t) =>
                  t.team_id === response.data!.team_id ? response.data! : t
                )
              );
            }
          });
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
    refreshTeamMembers(selectedTeam);
  };

  // Helper to get display name for member (handles nested user structure from backend)
  const getMemberDisplayName = (member: TeamWithMembers["members"][0]) => {
    // Backend returns { role, user: { user_id, username, profile_pic } }
    return member.user?.username || `User #${member.user?.user_id ?? "unknown"}`;
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
            <p className="text-xl font-bold text-secondary">
              Team Members - {selectedTeam.team_name}
            </p>
            {selectedTeam.members?.length === 0 ? (
              <p className="text-secondary-50 text-sm">No members yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedTeam.members?.map((member) => {
                  const displayName = getMemberDisplayName(member);
                  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                  
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
                          <p className="font-medium text-secondary">{displayName}</p>
                          <p className="text-xs text-secondary-50">
                            {member.role === "admin" ? "👑 Admin" : "Member"}
                          </p>
                        </div>
                      </div>
                      {member.role !== "admin" && removingMember !== member.user.user_id && (
                        <IconButton
                          name={Icons.Trash}
                          onClick={() => onRemoveMember(member.user.user_id)}
                          variant={IconButtonVariant.Destructive}
                        />
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
        {/* Invite to Team Card */}
        {selectedTeam && (
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
