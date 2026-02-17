import { useAuthStore } from "../../stores";
import { useAppNavigation, useSessionCookie } from "../utils";

export const useLogout = () => {
  const { toLoginPage } = useAppNavigation();
  const setUser = useAuthStore((state) => state.setUser);
  const [_getCookie, setCookie] = useSessionCookie();

  const onLogout = () => {
    setCookie("userId", "");
    window.localStorage.removeItem("userId");
    setUser(undefined);
    toLoginPage();
  };

  return onLogout;
};
