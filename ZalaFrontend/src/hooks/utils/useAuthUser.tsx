import type { IUser } from "../../interfaces";
import { useAuthStore } from "../../stores";
import { useSessionCookie } from "./useSessionCookie";

export const useAuthUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [_getCookie, setCookie] = useSessionCookie();
  const authUser = (user: IUser) => {
    window.sessionStorage.removeItem("loggedOut");
    setCookie("userId", user.userId.toString());
    setUser(user);
  };
  return authUser;
};
