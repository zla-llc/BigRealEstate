import { useEffect } from "react";
import { useAuthStore } from "../../stores";
import { useApi } from "./useApi";

export const useAlterUserXp = (runInit: boolean = false) => {
  const { user, setUser } = useAuthStore();
  const api = useApi();

  useEffect(() => {
    if (!runInit) return;
    getUserXp();
  }, [runInit]);

  const getUserXp = async (userId?: number) => {
    if (!user && !userId) return;

    const res = await api.getUserXp(userId ?? user?.userId ?? -1);

    if (res.err || !res.data)
      return api.apiResponseError("getting user xp", res.err);

    if (user) setUser({ ...user, xp: res.data.xp });
  };

  const addUserXp = async (xp: number, userId?: number) => {
    if (!user && !userId) return;

    const res = await api.addUserXP(userId ?? user?.userId ?? -1, xp);

    if (res.err || !res.data)
      return api.apiResponseError("getting user xp", res.err);

    if (user) setUser({ ...user, xp: res.data.xp });
  };

  const resetUserXp = async (userId?: number) => {
    if (!user && !userId) return;

    const res = await api.restoreUserXp(userId ?? user?.userId ?? -1);

    if (res.err || !res.data)
      return api.apiResponseError("getting user xp", res.err);

    if (user) setUser({ ...user, xp: res.data.xp });
  };

  return {
    getUserXp,
    addUserXp,
    resetUserXp,
  };
};
