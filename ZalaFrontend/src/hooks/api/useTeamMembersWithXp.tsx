import React, { useEffect, useState } from "react";
import type { TeamMember, TeamMemberWithXP } from "../../interfaces";
import { useApi } from "./useApi";

export const useTeamMembersWithXp = ({
  teamId,
  teamMembers = [],
}: {
  teamId: number;
  teamMembers?: TeamMember[];
}): [
  TeamMemberWithXP[],
  React.Dispatch<React.SetStateAction<TeamMemberWithXP[]>>,
  () => Promise<void>,
] => {
  const [teamMembersWithXp, setTeamMembersWithXp] = useState<
    TeamMemberWithXP[]
  >([]);
  const api = useApi();

  useEffect(() => {
    if (teamId === -1) return;
    (async () => await getTeamMembersByXp())();
  }, [teamId]);

  const getTeamMembersByXp = async () => {
    const res = await api.getTeamMembersByXp(teamId);
    if (res.data) {
      setTeamMembersWithXp(
        res.data
          .map((member) => ({
            ...member,
            teamMember: teamMembers.find(
              (tm) => tm.user.user_id === member.user_id,
            ),
          }))
          .sort((a, b) => {
            if (a.xp === b.xp) {
              const aIsAdmin = a.teamMember?.role === "admin";
              const bIsAdmin = b.teamMember?.role === "admin";

              const compareAlphabetically =
                (!aIsAdmin && !bIsAdmin) || (aIsAdmin && bIsAdmin);

              if (compareAlphabetically)
                return a.username.localeCompare(b.username);

              return aIsAdmin ? 1 : -1;
            }

            return a.xp - b.xp;
          }),
      );
    }
  };

  return [teamMembersWithXp, setTeamMembersWithXp, getTeamMembersByXp];
};
