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
    const firstLogin = getCookie(CookieKeys.FirstLogin);
    console.log(`First login run`);
    if (firstLogin !== "True") {
      const addingXp = 50;
      await alterUserXP.addUserXp(addingXp, userId); // +50 points for login
      setCookie(CookieKeys.FirstLogin, "True");
      successMsg(`+${addingXp} XP - Login!`);
    }
  };

  const authUser = async (user: IUser) => {
    removeCookie(CookieKeys.LoggedOut);
    setCookie(CookieKeys.UserId, user.userId.toString());
    setUser(user);
    await firstLoginXp(user.userId);
  };
  return authUser;
};
