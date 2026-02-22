import { useAuthStore } from "../../stores";
import { useApi } from "../api";
import { AUserToIUser, type IUser } from "../../interfaces";
import { useAppNavigation, useSessionCookie, useTimeoutEffect } from "../utils";
import { CookieKeys } from "../../interfaces/CookieKeys";

export const useAutoLogin = () => {
  const { user, setUser } = useAuthStore();

  const { toLoginPage } = useAppNavigation();
  const [getCookie, _setCookie, removeCookie] = useSessionCookie();

  const { getUser } = useApi();

  useTimeoutEffect(
    () => {
      autoLogin();
    },
    [],
    250,
  );

  const onUserFound = (user: IUser) => {
    setUser(user);
  };

  const onUserNotFound = () => {
    removeCookie(CookieKeys.UserId);
    toLoginPage();
  };

  const autoLogin = () => {
    const loggedOut = getCookie(CookieKeys.LoggedOut);
    if (loggedOut === "true") {
      return;
    }

    const userId = getCookie(CookieKeys.UserId);

    if (user) {
      return;
    }

    if (!userId || userId.length === 0) {
      return onUserNotFound();
    }

    (async () => {
      const user = await login(userId);
      if (!user) return onUserNotFound();
      onUserFound(user);
    })();
  };

  const login = async (userId: string) => {
    const userRes = await getUser(userId);

    if (userRes.err || !userRes.data) {
      console.log(`Internal error - Autologin: ${userRes.err}`);
      console.log(``);
      return;
    }

    const user = AUserToIUser(userRes.data);
    return user;
  };
};
