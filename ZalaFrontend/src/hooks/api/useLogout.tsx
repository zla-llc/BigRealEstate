import { useAuthStore } from "../../stores";
import { useAppNavigation, useSessionCookie } from "../utils";

export const useLogout = () => {
  const { toLoginPage } = useAppNavigation();
  const setUser = useAuthStore((state) => state.setUser);
  const [_getCookie, setCookie] = useSessionCookie();

  const onLogout = () => {
    setCookie("userId", "");
    window.sessionStorage.removeItem("userId");
    window.localStorage.removeItem("userId");
    window.sessionStorage.setItem("loggedOut", "true");
    setUser(undefined);
    toLoginPage();
  };

  return onLogout;
};
