# ScribeSpace — Collaborative Storytelling Platform (PERN Stack)

A full-stack collaborative storytelling application built with **PostgreSQL, Express, React, Node.js, TypeScript, and Redux Toolkit**. Writers can co-author manuscripts, track milestone revisions, manage contributors with role-based permissions, and comment on chapters in real time.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Redux Toolkit (`@reduxjs/toolkit`, `react-redux`).
- **Backend**: Node.js, Express, PostgreSQL driver (`pg`), bcryptjs, JSON Web Tokens (`jsonwebtoken`), cookie-parser, cors.
- **State Management**: Redux store with slices for authentication, story library, real-time writer presence, and UI themes.
- **Security & Auth**:
  - JWT Access Tokens (15m expiry) stored **in-memory** in the Redux store (never in localStorage to prevent XSS).
  - JWT Refresh Tokens (7d expiry) transmitted exclusively via **HTTP-only, Secure SameSite cookies**.
  - Automatic silent refresh interceptor that seamlessly re-authenticates and replays failed requests.
- **Database**:
  - PostgreSQL schema (`src/backend/db/schema.sql`) for production deployment (Render.com, Neon, Supabase).
  - Embedded SQL database adapter with pre-seeded demo authors and stories for instant local testing.

---

## 🚀 Getting Started Locally

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `JWT_SECRET`: Secret key for signing short-lived access tokens.
- `REFRESH_SECRET`: Secret key for signing HTTP-only refresh cookies.
- `DATABASE_URL`: (Optional locally, required in production) PostgreSQL connection string.

### 3. Run Development Server
```bash
npm run dev
```
Starts the full-stack server on `http://localhost:3000` with Express handling API endpoints at `/api/*` and mounting the Vite client in development.

---

## 🚢 Render.com Deployment Guide

### Step 1: Provision Render PostgreSQL
1. In the **Render Dashboard**, select **New +** → **PostgreSQL**.
2. Name the database `scribespace-db` and select the Free tier.
3. Once created, copy the **Internal Database URL** (e.g., `postgres://...render.internal:5432/...`).
4. In the database shell, run the DDL migration from `src/backend/db/schema.sql`.

### Step 2: Deploy Full-Stack Web Service
1. In Render, select **New +** → **Web Service** and link your Git repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Render internal PostgreSQL connection string.
   - `JWT_SECRET`: A high-entropy production secret.
   - `REFRESH_SECRET`: A high-entropy production refresh secret.
   - `NODE_ENV`: `production`
4. Click **Deploy Web Service**. Render will build the Vite frontend, bundle the backend, and deploy automatically on every push!

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user (`username`, `email`, `password`). Returns access token and sets HTTP-only cookie.
- `POST /api/auth/login` — Login with credentials. Returns access token and sets cookie.
- `POST /api/auth/refresh` — Generates a new access token using the HTTP-only refresh cookie.
- `POST /api/auth/logout` — Clears the refresh token cookie.
- `GET /api/auth/me` — Retrieves authenticated user profile.
- `GET /api/users` — List registered users for collaborator search.

### Stories (CRUD)
- `GET /api/stories` — List all stories with filters (`author_id`, `genre`, `search`).
- `GET /api/stories/:id` — Retrieve full story manuscript, contributors, comments, and versions.
- `POST /api/stories` — Create a new story (authenticated author).
- `PATCH /api/stories/:id` — Update story title, content, synopsis, genre (author or invited contributor only).
- `DELETE /api/stories/:id` — Delete a story (lead author only).

### Contributors (Co-Authorship)
- `POST /api/contributors` — Add a co-author (`story_id`, `user_id`, `role`). Author only.
- `GET /api/contributors/:story_id` — List all contributors for a story.
- `DELETE /api/contributors/:id` — Remove a contributor. Author only.

### Real-Time Presence & Versions
- `GET /api/stories/:id/presence` — Query active writers currently editing the manuscript.
- `POST /api/stories/:id/presence` — Broadcast editor heartbeat and cursor position.
- `GET /api/stories/:id/versions` — List revision snapshots.
- `POST /api/stories/:id/versions` — Create an explicit milestone checkpoint.
