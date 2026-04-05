type IConfig = {
  api: string;
  ws: string;
  env: string;
  keys: {
    google: {
      maps: string;
      oauth: string;
      redirectUri: string;
      scopes: string;
    };
  };
  maxBoardItemCards: number;
};

export const CONFIG: IConfig = {
  api: import.meta.env.VITE_API_URL,
  ws: import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL,
  env: import.meta.env.VITE_ENV,
  keys: {
    google: {
      maps: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
      oauth: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || "postmessage",
      scopes:
        import.meta.env.VITE_GOOGLE_SCOPES ||
        "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic",
    },
  },
  maxBoardItemCards: 4,
};
