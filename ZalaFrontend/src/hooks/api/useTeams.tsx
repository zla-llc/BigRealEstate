import { useEffect, useRef, useState } from "react";
import { stringify } from "../../utils";
import { useApi } from "./useApi";
import type { ITeam } from "../../interfaces";

export const useTeams = ({
  teamIds = [],
  deps = [],
}: {
  teamIds?: number[];
  deps?: unknown[];
}): [
  ITeam[],
  React.Dispatch<React.SetStateAction<ITeam[]>>,
  (userId: number) => Promise<void>,
  React.RefObject<ITeam[]>,
  boolean,
] => {
  const api = useApi();

  const teamsRef = useRef<ITeam[]>([]); // For bug encountered accessing state from openAddTeamTeamsModal
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getTeams();
  }, [stringify(teamIds), ...deps]);

  const getTeams = async () => {
    setLoading(true);
    const res = await api.getTeams();
    setLoading(false);

    if (res.data) {
      const props = res.data
        // .map(APropertyToIProperty)
        .filter((team) =>
          teamIds.length === 0 ? true : teamIds.includes(team.team_id),
        );
      setTeams(props);
      teamsRef.current = props;
    }
  };

  return [teams, setTeams, getTeams, teamsRef, loading];
};
