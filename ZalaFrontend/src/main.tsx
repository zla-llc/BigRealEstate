// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { config } from "dotenv";
import App from "./App.tsx";
import { enableMapSet } from "immer";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
// config();
enableMapSet();

// createRoot(document.getElementById("root")!).render(<App />);
createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/*" element={<App />}/>
        </Routes>
    </BrowserRouter>

);

