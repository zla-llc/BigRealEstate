// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { config } from "dotenv";
import App from "./App.tsx";
import { enableMapSet } from "immer";
import { BrowserRouter, Routes, Route } from "react-router";
import { IMAGES } from "./assets/Images.ts";
// config();
enableMapSet();

// createRoot(document.getElementById("root")!).render(<App />);
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>,
);

document.getElementById("tab-img")?.setAttribute("href", IMAGES.ZalaTabLogo);
