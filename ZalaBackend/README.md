# Zala Backend (FastAPI)

Backend service for the **Zala** project, built with [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), and [Pydantic v2](https://docs.pydantic.dev/).

---

## Requirements

- **Python 3.13 or higher** (tested with Python 3.13)
- **pip** for dependency management

---

## Project Structure

```text
ZalaBackend/
├── app/
│   ├── db/
│   │   ├── crud/                          # CRUD helpers (addresses, leads, campaigns, etc.)
│   │   ├── schema.sql                     # Core PostgreSQL schema
│   │   ├── data.sql                       # Seed data used during development
│   │   └── session.py                     # SQLAlchemy session configuration
│   ├── external_api/                      # Client wrappers for Google Places, RapidAPI, ToLeads
│   ├── models/                            # SQLAlchemy ORM models
│   ├── routes/                            # FastAPI routers (users, leads, campaigns, …)
│   ├── schemas/                           # Pydantic request/response models
│   ├── utils/                             # Utility helpers (e.g. geocoding)
│   └── main.py                            # FastAPI application entry point
├── scripts/                               # Helper scripts (data loading, tooling)
├── tests/                                 # Unit and integration tests
├── API_ROUTES_README.md                   # Endpoint documentation for frontend consumers
├── requirements.txt                       # Python dependencies
├── package.json / package-lock.json       # Frontend tooling configuration (if needed)
├── .env                                   # Local environment variables (not tracked)
├── __init__.py                            # Allows running `python -m app`
└── README.md                              # This guide
```

For a detailed endpoint catalogue, see `API_ROUTES_README.md`.

---

## Project Overview

The backend handles core application logic for Zala, including:

- User management and authentication
- Lead, property, and campaign handling
- Integration with external APIs (Google Maps, OAuth, etc.)
- RESTful endpoints consumed by the Zala frontend

For detailed API documentation, see `API_ROUTES_README.md`.

---

## Virtual Environment Setup

Creating a virtual environment ensures dependencies are isolated to this project.

### 🖥️ macOS / Linux

1. Navigate to the project root and create a virtual environment:

   ```
   cd ZalaBackend
   python3 -m venv venv
   ```

2. Activate the virtual environment:

   ```
   source venv/bin/activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Run the application:

   ```
   uvicorn app.main:app --reload
   ```

### 🪟 Windows (PowerShell)

1. Navigate to the project root and create a virtual environment:

   ```
   cd ZalaBackend
   py -m venv venv
   ```

2. Activate the virtual environment:

   ```
   .\venv\Scripts\activate
   ```

3. Install dependencies:

   ```
   py -m pip install -r requirements.txt
   ```

4. Run the application:

   ```
   py -m uvicorn app.main:app --reload
   ```

💡 Use `deactivate` to exit the virtual environment when finished.

---

## Running the API

From the project root (`ZalaBackend/`):

```
uvicorn app.main:app --reload
```

- **API Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Docs:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

If running from the `app/` directory, use:

```
uvicorn main:app --reload
```

Use `--reload` in development to automatically restart on file changes.

---

## Environment Variables

All environment variables are defined in a single `.env` file located in the project root (`ZalaBackend/`).

```
# ─── Database Configuration ─────────────────────────────
SQL_UNAME=<your_postgres_username>
SQL_PASSWORD=<your_postgres_password>
SQL_HOST=localhost
SQL_PORT=5432
SQL_DBNAME=zala_db

# ─── Google Cloud API Configuration (Maps / Geocoding) ─
GOOGLE_API_KEY=<your_google_maps_api_key>

# ─── Google OAuth 2.0 Authentication ────────────────────
GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<your_google_oauth_client_secret>
GOOGLE_REDIRECT_URI=postmessage
GOOGLE_TOKEN_ENCRYPTION_KEY=<your_fernet_key_for_token_storage>

# ─── Lead Generation API Keys ────────────────────

RAPIDAPI_KEY=<your_rapid_api_key>
OPENAI_API_KEY=<your_open_ai_api_key>
BRAVE_API_KEY=<your_brave_api_key>

# ─── Frontend OAuth Integration (for React/Vite) ────────
VITE_GOOGLE_CLIENT_ID=<same_as_GOOGLE_CLIENT_ID_or_OAuth_client_id>
VITE_GOOGLE_REDIRECT_URI=postmessage
VITE_GOOGLE_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.send"
```

### How to Get These Values

#### 🗺️ Google API Key (for Maps and Geocoding)

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select an existing project.
3. Enable the **Gmail API**, **Geocoding API**, **Geolocation API**, **Places API**, **Places API (new)**, and **Maps JavaScript API**.
4. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
5. Copy the key and add it to your `.env` file:

   ```
   GOOGLE_API_KEY=<your_api_key>
   ```

#### 🔐 Google OAuth Client (for Sign-In)

1. In **Google Cloud Console**, open **APIs & Services → OAuth consent screen** and configure your app.
2. Go to **Credentials → Create Credentials → OAuth client ID → Web application**.
3. Add development origins:

   ```
   http://localhost:3000
   http://127.0.0.1:3000
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:8000
   ```

4. Add redirect URIs:

   ```
   http://localhost:3000/auth/google/callback
   http://localhost:8000/docs/oauth2-redirect
   ```

5. Copy the generated Client ID and Secret into `.env`:

   ```
   GOOGLE_CLIENT_ID=<your_client_id>
   GOOGLE_CLIENT_SECRET=<your_client_secret>
   ```

6. Add the same Client ID to your frontend `.env`:

   ```
   VITE_GOOGLE_CLIENT_ID=<your_client_id>
   ```

7. Use the Google Identity Services `postmessage` redirect for the popup/PKCE flow:

   ```
   GOOGLE_REDIRECT_URI=postmessage
   VITE_GOOGLE_REDIRECT_URI=postmessage
   ```

8. Request the Gmail send scope so users can authorize email sending:

   ```
   VITE_GOOGLE_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.send"
   ```

9. Generate a Fernet key and set `GOOGLE_TOKEN_ENCRYPTION_KEY` (see the **Gmail send flow** section) so refresh tokens are stored encrypted.

#### 🧠 Lead Generation API Keys (RapidAPI, OpenAI, Brave Search)

These keys are used for intelligent lead generation, AI processing, and web data enrichment features.
Each service requires a developer account to generate and manage API credentials.

##### ⚡ RapidAPI Key

1. Visit [RapidAPI](https://rapidapi.com) and log in or create an account.
2. Navigate to the **"My Apps"** section from your dashboard.
3. Select an existing application or create a new one.
4. Open the search menu and subscribe to "zillow.com Realtime Scraper"
5. Go to console and find the zillow API. Copy your personal API key.
6. Add it to your `.env` file as:

   ```
   RAPIDAPI_KEY=<your_rapid_api_key>
   ```

##### 🤖 OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys).
2. Sign in with your OpenAI account.
3. Click **“Create new secret key.”** on the API keys page.
4. Copy the key immediately (it won’t be shown again).
5. Add it to your `.env` file as:

   ```
   OPENAI_API_KEY=<your_open_ai_api_key>
   ```

##### 🦁 Brave Search API Key

1. Visit [Brave Search API](https://api.search.brave.com).
2. Sign up or log in with your Brave account.
3. Go to your **Developer Dashboard**.
4. Locate your **Brave Search API key** under API credentials.
5. Add it to your `.env` file as:

   ```
   BRAVE_API_KEY=<your_brave_api_key>
   ```

#### 🧩 Database Variables

Use your PostgreSQL credentials to connect to your local or hosted database.

Example:

```
SQL_UNAME=postgres
SQL_PASSWORD=admin
SQL_HOST=localhost
SQL_PORT=5432
SQL_DBNAME=zala
```

⚠️ Do not commit your `.env` file or share credentials publicly.

---

## Fixing Database Structure

Go to Pgadmin and right click your database ex. zala and go to query tool.
Run the following commands to delete db:

(**MAKE SURE NAMING OF UNAME AND DBNAME MATCHES YOUR CONFIG**)
-- 1. Drop everything in the schema (irreversible)
DROP SCHEMA IF EXISTS public CASCADE;

-- 2. Recreate the schema owned by your app role
CREATE SCHEMA public AUTHORIZATION postgresadmin;

-- 3. Ensure the role keeps access
GRANT ALL ON SCHEMA public TO postgresadmin;

-- 4. Make sure new sessions see the schema automatically
ALTER ROLE postgresadmin IN DATABASE zala SET search_path TO public;
ALTER DATABASE zala SET search_path TO public;

-- 5. Apply the setting for the current session
SET search_path TO public;

Rerun initalize_db.py to create tables

## Testing

1. Ensure the server is running:

   ```
   uvicorn app.main:app --reload
   ```

2. Access documentation and test endpoints:

   - **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc UI:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

3. You can also test endpoints with:

   - [Postman](https://www.postman.com/)
   - [HTTPie](https://httpie.io/)
   - `curl` commands

---

## Development Notes

- Store sensitive configuration only in `.env`.
- The `/api` prefix is automatically applied to all routers in `app/main.py`.
- Use dedicated link/unlink endpoints for entity relationships instead of embedding IDs in create requests.
- Keep `API_ROUTES_README.md` updated with endpoint changes for frontend synchronization.
- Restart your FastAPI server after modifying `.env`.

### Search-lead pipeline & API usage

- `/api/searchLeads` always executes the **DB search first**. If that query already has nearby data, the endpoint returns immediately and refreshes each configured external source in the background. If the DB has _no_ matches for the requested location, Google Places and RapidAPI run inline, persist their results, and the DB search is repeated so the user still gets fresh leads before the response is returned.
- Clients no longer pass a `sources` array. The backend automatically schedules Google Places, RapidAPI, and GPT (with DB caching as the authoritative surface) and decides which ones should block vs. run in the background based on whether the DB already has nearby leads.
- Google Places & RapidAPI now skip re-geocoding when latitude/longitude already come back from the provider. Only results that lack coordinates are geocoded, and those calls run through a thread pool to keep the map provider from being hammered sequentially.
- Database filtering now uses a bounding box query to fetch just the nearby leads/properties before running the precise Haversine calculation in Python. That keeps the DB workload tiny even as the table grows.
- GPT + Brave fetches are dispatched as a FastAPI background task. The API response returns immediately with `external_persistence["gpt"] = {"status": "queued"}` while the background job calls the LLM, normalizes the leads, and writes them to the DB. Those leads show up on the next request that includes the `db` source—no separate polling needed.
- `external_persistence` now contains either `{inserted, duplicates, failed}` for blocking sources or `{status: "queued"}` if a background job is still running. This gives the frontend a single place to show async progress.
- Because more work happens in parallel, provider quotas are consumed faster. Keep `app/external_api/api_usage.json` (and the vendor dashboards) updated so you know when to throttle tests.

Google Places

1. Create or select a project at https://console.cloud.google.com/.
2. Enable the **Geocoding API** (and any other required services).
3. Generate an API key under **APIs & Services → Credentials**.
4. Add the key to `.env` as `GOOGLE_API_KEY=...`.

OpenAI

1. Create an API key for OpenAI at https://platform.openai.com/api-keys
2. Add funds to your OpenAI account at https://platform.openai.com/settings/organization/billing/overview
3. Add the API key to `.env` as `OPENAI_API_KEY=...`.

Brave

1. Create a Brave account at https://brave.com/search/api/
2. Subscribe to the Free AI plan at https://api-dashboard.search.brave.com/app/subscriptions/subscribe?tab=ai
3. Create an API key at https://api-dashboard.search.brave.com/app/keys
4. Add the API key to `.env` as `BRAVE_API_KEY=...`.

Restart the server after updating `.env` so changes take effect.

## Gmail send flow

The Gmail integration now requires full OAuth consent with the `https://www.googleapis.com/auth/gmail.send` scope. Make sure the Google client configured in `.env` is the same one your frontend uses.

1. Generate an encryption key and set `GOOGLE_TOKEN_ENCRYPTION_KEY` in `.env`:

   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

   This key is used to encrypt Google access and refresh tokens at rest.

2. Go to OAuth Consent Screen and select Data Access. Update it to include Gmail scopes and allow the `postmessage` redirect URI.

3. Sign in via Google from the login/signup pages on the application. The server exchanges the authorization code, stores encrypted refresh tokens, and the returned `UserPublic` now exposes a `gmail_connected` flag so the UI can reflect status.

4. Open `/email-test` in the frontend to send a sample email. The page calls `POST /api/google-mail/send`, which relays the message through Gmail with the stored credentials.

If Gmail stops working for a user, have them re-run Google sign-in so a new refresh token is issued. If the email fails to send due to an authentication scope error, go back to the APIs page and click on the Gmail API, then check if there's a service account under the credentials tab and if so disable or delete it.

> **Note:** The Gmail API must be enabled for the same Google Cloud project that owns your OAuth client. Visit https://console.cloud.google.com/apis/api/gmail.googleapis.com/overview?project=<your_project_id> and click **Enable** (or re-enable) before testing email sends, otherwise Google will return `SERVICE_DISABLED / accessNotConfigured`.
> **Account linking rule:** Connecting Gmail to an existing Zala account requires using the exact same email address during Google sign-in. If the emails do not match, the backend will reject the link so the wrong Google account cannot be attached.

### Adding Google test users (required while the app is in Testing mode)

1. Visit the OAuth consent screen in Google Cloud Console: https://console.cloud.google.com/apis/credentials/consent
2. Switch to the **Audience** tab.
3. In the **Test users** panel, click **Add users**, enter each Gmail address that should be able to sign in/send email, then save. You can remove testers from the same panel when access is no longer needed.
