import { CookieKeys } from "../../interfaces/CookieKeys";

const isBrowser = typeof window !== "undefined";

const getStoredValue = (key: CookieKeys) => {
  if (!isBrowser) {
    return undefined;
  }

  const value =
    window.sessionStorage.getItem(key) ??
    window.localStorage.getItem(key) ??
    undefined;

  return value;
};

const setStoredValue = (key: CookieKeys, value: string) => {
  if (!isBrowser) {
    return undefined;
  }

  window.sessionStorage.setItem(key, value);
  window.localStorage.setItem(key, value);

  return value;
};

const removeStoredValue = (key: CookieKeys) => {
  if (!isBrowser) return;

  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);

  return;
};

export const useSessionCookie = (): [
  (cookieName?: CookieKeys) => string | undefined,
  (cookieName: CookieKeys, value: string) => string | undefined,
  (cookieName: CookieKeys) => void,
] => {
  const getCookie = (cookieName: CookieKeys = CookieKeys.UserId) =>
    getStoredValue(cookieName);

  const setCookie = (cookieName: CookieKeys, value: string) =>
    setStoredValue(cookieName, value);

  return [getCookie, setCookie, removeStoredValue];
};
