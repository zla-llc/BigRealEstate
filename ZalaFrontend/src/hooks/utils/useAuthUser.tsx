import moment from "moment";
import type { IUser } from "../../interfaces";
import { CookieKeys } from "../../interfaces/CookieKeys";
import { useAuthStore } from "../../stores";
import { useAlterUserXp } from "../api";
import { useSessionCookie } from "./useSessionCookie";
import { useSnack } from "./useSnack";

export const useAuthUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [successMsg, _errorMsg] = useSnack();
  const [getCookie, setCookie, removeCookie] = useSessionCookie();

  const alterUserXP = useAlterUserXp();

  const firstLoginXp = async (userId: number) => {
    const loginTimesVal = getCookie(CookieKeys.LoginTimes);
    const loginTimes = loginTimesVal ? JSON.parse(loginTimesVal) : {};
    const lastLoginTime = loginTimes[userId.toString()] as string | undefined;

    const ADDING_XP = 50;
    const now = moment();

    if (lastLoginTime) {
      const lastLoginDate = moment(new Date(lastLoginTime));
      const difference = lastLoginDate.diff(now, "days");

      if (difference >= 0) return;
    }

    loginTimes[userId.toString()] = now.toDate().toLocaleDateString();
    await alterUserXP.addUserXp(ADDING_XP, userId);
    successMsg(`+${ADDING_XP} XP - First login of the day!`);
    setCookie(CookieKeys.LoginTimes, JSON.stringify(loginTimes));
  };

  const authUser = async (user: IUser) => {
    removeCookie(CookieKeys.LoggedOut);
    setCookie(CookieKeys.UserId, user.userId.toString());
    setUser(user);
    await firstLoginXp(user.userId);
  };
  return authUser;
};
