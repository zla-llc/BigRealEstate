import { CookieKeys } from "../../interfaces/CookieKeys";
import { useAuthStore } from "../../stores";
import { useAppNavigation, useSessionCookie } from "../utils";

export const useLogout = () => {
  const { toLoginPage } = useAppNavigation();
  const setUser = useAuthStore((state) => state.setUser);
  const [_getCookie, setCookie, removeCookie] = useSessionCookie();

  const onLogout = () => {
    removeCookie(CookieKeys.UserId);
    setCookie(CookieKeys.LoggedOut, "true");

    setUser(undefined);

    toLoginPage();
  };

  return onLogout;
};
