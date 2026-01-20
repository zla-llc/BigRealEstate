# README: Zala CRM – Frontend (Vite + React)

## 📘 Overview

This repository contains the **frontend user interface (UI)** for the **Zala CRM** application — a modern, responsive, and efficient customer relationship management platform designed for real estate professionals.

The frontend is built with **React** and **Vite**, leveraging **TypeScript**, **TailwindCSS**, and **Material UI (MUI)** to deliver a performant and polished user experience.

---

## 🚀 Getting Started

### 1. Navigate to the Project Directory

```bash
cd <path-to-zala-frontend-root>
```

### 2. Install Dependencies

Use `npm` to install all required packages defined in `package.json`.

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root directory and include the following variables:

```bash
# ─── API Endpoint ───────────────────────────────
VITE_API_URL=http://127.0.0.1:8000

# ─── Google Cloud API Configuration ─────────────
VITE_GOOGLE_MAPS_KEY=<your_google_maps_api_key>

# ─── Google OAuth 2.0 Authentication ────────────
VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
VITE_GOOGLE_REDIRECT_URI=postmessage
VITE_GOOGLE_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.send"
```

> **Note:**
>
> - Instructions for obtaining `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`, `VITE_GOOGLE_SCOPES`, and `VITE_GOOGLE_MAPS_KEY` can be found in the **Zala API README** under their respective environment variable setup sections.
> - Ensure that `VITE_API_URL` points to your locally running or deployed Zala API instance.

---

### 4. Run the Application

#### Development Mode

```bash
npm run dev
```

Access the UI at:

```
http://localhost:5173/
```

#### Production Build

```bash
npm run build
```

#### Preview Production Build

```bash
npm run preview
```

---

## ⚙️ Project Structure

```
ZalaFrontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level views
│   ├── store/            # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper and utility functions
│   ├── assets/           # Images, icons, and other static files
│   └── main.tsx          # React entry point
├── public/               # Static assets served at runtime
├── index.html            # HTML entry template
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # TailwindCSS configuration
└── vite.config.ts        # Vite build configuration
```

---

## 🧩 Tech Stack

| Category                   | Technology                         |
| -------------------------- | ---------------------------------- |
| **Frontend Framework**     | React (TypeScript)                 |
| **Build Tool**             | Vite                               |
| **Styling**                | TailwindCSS, Material UI, Emotion  |
| **State Management**       | Zustand                            |
| **Notifications**          | Notistack                          |
| **Mapping**                | Google Maps via `google-map-react` |
| **Icons**                  | Lucide React                       |
| **Animation**              | Motion                             |
| **Environment Management** | dotenv                             |
| **Routing**                | React Router v7                    |

---

## 🔧 Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Starts development server           |
| `npm run build`   | Builds project for production       |
| `npm run lint`    | Runs ESLint checks                  |
| `npm run preview` | Serves the production build locally |

---

## 🧠 Notes

- The **frontend** relies on the **Zala API** backend to function properly. Ensure the backend server is running and accessible at the URL set in `VITE_API_URL`.
- The `.env` file is **not version controlled** — you must create it manually before running the app.
- Any changes to environment variables require restarting the development server.

---

## 👥 Author

**Zala Development Team**
Niccolls Evsseef
Robert Huang
Andrew Moulton
Jonathan Zhu
Colin Tondreau

---

## 🪪 License

This project is licensed under the **MIT License**.
See the `LICENSE` file for more details.
