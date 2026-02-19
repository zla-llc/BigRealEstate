type CookieNames = "userId";

const isBrowser = typeof window !== "undefined";

const getStoredValue = (key: CookieNames) => {
  if (!isBrowser) {
    return undefined;
  }

  return window.sessionStorage?.getItem(key) ?? undefined;
};

const setStoredValue = (key: CookieNames, value: string) => {
  if (!isBrowser) {
    return undefined;
  }

  window.sessionStorage?.setItem(key, value);
  return value;
};

export const useSessionCookie = (): [
  (cookieName?: "userId") => string | undefined,
  (cookieName: "userId", value: string) => string | undefined
] => {
  const getCookie = (cookieName: CookieNames = "userId") =>
    getStoredValue(cookieName);

  const setCookie = (cookieName: CookieNames, value: string) =>
    setStoredValue(cookieName, value);

  return [getCookie, setCookie];
};
