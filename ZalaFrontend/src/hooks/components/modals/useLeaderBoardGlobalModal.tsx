import { useEffect, useState } from "react";
import { useTeams } from "../../api";
import { useUsers } from "../../api/useUsers";
import type { ITeam, IUser } from "../../../interfaces";

export const useLeaderBoardGlobalModal = () => {
  const [compareTo, setCompareTo] = useState<"teams" | "users">("teams");

  const [allTeams, _setAllTeams, _getAllTeams, _allTeamsRef, allTeamsLoading] =
    useTeams({});
  const [allUsers, _setAllUsers, _getAllUsers, _allUsersRef, allUsersLoading] =
    useUsers({});

  const [sortedTeams, setSortedTeams] = useState<ITeam[]>([]);
  const [sortedUsers, setSortedUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (compareTo === "teams")
      setSortedTeams([...allTeams].sort((a, b) => b.xp - a.xp));
    if (compareTo === "users")
      setSortedUsers([...allUsers].sort((a, b) => b.xp - a.xp));
  }, [compareTo, allTeams.length, allUsers.length]);

  const onTeamsClick = () => setCompareTo("teams");
  const onUsersClick = () => setCompareTo("users");
  return {
    allTeams: sortedTeams,
    allUsers: sortedUsers,
    compareTo,

    allTeamsLoading,
    allUsersLoading,

    onTeamsClick,
    onUsersClick,
  };
};
