// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { config } from "dotenv";
import App from "./App.tsx";
import { enableMapSet } from "immer";

// config();
enableMapSet();

createRoot(document.getElementById("root")!).render(<App />);
