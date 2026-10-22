# Collaborative Storytelling Application (PERN Stack)

A production-grade, collaborative storytelling web platform where writers co-author, branch, and evolve stories in real time, built with Node.js, Express, PostgreSQL, React, TypeScript, and Redux Toolkit.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during Phase 1 interactive clarification:
> - **Database Backend**: Embedded PostgreSQL-compatible SQL engine initialized with seed data immediately inside this development environment, paired with turnkey migration scripts for production PostgreSQL deployment on Render.com.
> - **Collaborative Workflow**: Live collaborative editor with real-time contributor presence, simultaneous multi-cursor typing indicators, and chapter version control.
> - **Visual Aesthetics**: Cozy literary aesthetic with warm parchment light mode and midnight library dark mode, pairing editorial serif titles with clean readable body prose.

---

### 1. Overview & Core Concept

- **What It Does**: Enables writers and creative groups to draft, share, and collaborate on multi-chapter stories. Authors can invite contributors with granular permissions, write collaboratively with live typing presence, track version snapshots, comment on drafts, and publish to a community reader feed.
- **Target Audience / Persona**: Creative writers, writing circles, roleplay storytellers, fanfiction communities, and writing students working on group anthologies.
- **Key Value**: Eliminates version conflicts and messy shared documents through dedicated authorship governance (author-only deletion and permissions, contributor co-editing, public readership), paired with seamless token authentication and instant state synchronization.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Authentication & Session Persistence**:
   - Guests browse featured public stories or register/log in via modal or dedicated auth screen.
   - On login, an access token is kept in-memory in the Redux store (`authSlice`) while a refresh token cookie (`refreshToken`) enables silent session resumption without logging users out on reload.
2. **Story Discovery & Filtering (Homepage)**:
   - Bento-style story grid with clean unboxed metadata (author, word count, contributor count, last updated).
   - Filter segmented tabs: *All Stories*, *My Stories (Author)*, *Collaborations*, and *Drafts*.
3. **Creation & Contributor Governance**:
   - Author creates a new story with title, synopsis, genre, and initial chapter.
   - Author manages collaborators via the *Story Collaborators* modal (search users, assign contributor role, revoke access).
4. **Live Collaborative Studio**:
   - Split layout: Focused manuscript writing canvas on the left, live presence & chapter navigation / comments sidebar on the right.
   - Real-time indicator showing active co-authors currently writing in the room.
   - Version history drawer showing saved milestone snapshots with 1-click restore.

#### Visual Identity & Theme
- **Aesthetic Direction**: Cozy literary & editorial salon. Clean, distinguished book design meets modern writing tools.
- **Palette & Atmosphere**:
  - *Parchment Light Mode*: Canvas `#FDFBF7`, Card `#F7F3EB`, Hairline `#E6DFD3`, Accent `#854D0E` (warm amber/leather), Text `#1C1917` (rich espresso).
  - *Midnight Library Dark Mode*: Canvas `#0C0A09` (stone-950), Card `#1C1917` (stone-900), Hairline `#292524` (stone-800), Accent `#F59E0B` (burnished gold), Text `#FAFAF9`.
- **Typography & Scale**:
  - Display / Story Titles: Characterful editorial serif (`Fraunces` / `Playfair Display`), balanced line wrapping without trailing single words.
  - Body / Reading Canvas: Highly legible serif or bookish sans (`Source Serif 4` / `Plus Jakarta Sans`) with generous `1.65` line height and `65ch` max measure.
  - Telemetry & Counts: `font-mono tabular-nums` for word counts, timestamps, and version hashes.
- **Component Styling & Layout**:
  - Follows zero-pill discipline: metadata uses unboxed text separated by subtle middots (`·`).
  - Single-elevation depth: cards use subtle hairline dividers without bulky nested cards.
  - Top navigation bar complies with the 3-zone contract: Brand wordmark, 4 clean nav links, and single Primary CTA (`+ New Story` / `Profile`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Database Architecture (Embedded + Render Postgres)**
  - *Chosen Approach*: Implement a shared database abstraction layer that runs an in-memory embedded PostgreSQL engine locally in the dev server (providing instant zero-configuration local runs with seeded demo users and stories), while exposing standard connection pooling (`pg.Pool`) that seamlessly connects to `DATABASE_URL` in production.
  - *Why*: Eliminates local setup hurdles while guaranteeing 100% compliance with PostgreSQL syntax and easy 1-click deployment on Render.
  - *Alternatives Considered*: Pure SQLite (risks SQL dialect differences) or requiring manual cloud provisioning before testing (blocks instant preview).
- **Decision 2: Token Refresh & Request Replay Strategy**
  - *Chosen Approach*: Store access token in Redux memory (`state.auth.accessToken`). On any `401/403` expired token response, an Axios/Fetch interceptor calls `/api/auth/refresh` using the HTTP-only cookie, receives a fresh access token, updates Redux, and replays the original request transparently.
  - *Why*: Maximum security against XSS (no tokens in `localStorage`), seamless UX across tab reloads, and strict adherence to the project specification.
- **Decision 3: Author vs. Contributor Role-Based Access Control (RBAC)**
  - *Chosen Approach*: Express middleware checks story ownership (`author_id === req.user.id`) for DELETE and contributor management, while allowing either author OR listed contributors in `Contributors` table for PATCH editing.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19 + Vite)                      │
│                                                                        │
│   ┌────────────────────────── Redux Store ─────────────────────────┐   │
│   │  authSlice (accessToken, user)  │  storySlice (activeStory)   │   │
│   │  presenceSlice (activeWriters)  │  uiSlice (theme, modals)    │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                 ▲                                      │
│                                 │ API Client (Interceptors + Refresh)  │
│                                 ▼                                      │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTP /api/* (Bearer Token + Cookies)
                                  │ Server-Sent Events / WebSockets
┌─────────────────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Express + Node.js)                        │
│                                                                        │
│   ┌─────────────────────────── Middlewares ────────────────────────┐   │
│   │  authenticateToken (JWT)  │  authorizeStory (Author/Contrib)   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                 │                                      │
│   ┌───────────────┬──────────────────────────┬─────────────────────┐   │
│   │  authRoutes   │      storyRoutes         │  contributorRoutes  │   │
│   │  (/register,  │  (CRUD, versions,        │  (add/remove co-    │   │
│   │   /login,     │   comments, live sync)   │   authors)          │   │
│   │   /refresh)   │                          │                     │   │
│   └───────────────┴──────────────────────────┴─────────────────────┘   │
│                                 │                                      │
│                                 ▼                                      │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             Database Layer (pg.Pool / Embedded Engine)         │   │
│   │             Tables: Users, Stories, Contributors,              │   │
│   │                     StoryVersions, Comments                    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Database Schema (PostgreSQL)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  synopsis TEXT,
  genre VARCHAR(50) DEFAULT 'General',
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contributors (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'contributor',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, user_id)
);

CREATE TABLE story_versions (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(255),
  edited_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints Contract
- **Auth**:
  - `POST /api/auth/register`: `{ username, email, password }` -> returns `{ message, accessToken, user }` + sets HTTP-only `refreshToken` cookie.
  - `POST /api/auth/login`: `{ email, password }` -> returns `{ accessToken, user }` + sets HTTP-only cookie.
  - `POST /api/auth/refresh`: checks `req.cookies.refreshToken` -> returns `{ accessToken }`.
  - `POST /api/auth/logout`: clears cookie.
  - `GET /api/auth/me`: returns authenticated user profile.
- **Stories**:
  - `GET /api/stories`: query filters (`author_id`, `search`, `genre`).
  - `GET /api/stories/:id`: fetches story with author info, contributors, and comments.
  - `POST /api/stories`: author creates story.
  - `PATCH /api/stories/:id`: updates story (author or authorized contributor only).
  - `DELETE /api/stories/:id`: deletes story (author only).
  - `GET /api/stories/:id/versions`: lists version snapshots.
  - `POST /api/stories/:id/versions`: creates explicit milestone snapshot.
- **Contributors**:
  - `POST /api/contributors`: adds contributor `{ story_id, user_id }` (author only).
  - `GET /api/contributors/:story_id`: fetches all contributors for a story.
  - `DELETE /api/contributors/:id`: removes contributor (author only).
- **Collaboration & Presence**:
  - `GET /api/stories/:id/presence`: real-time active collaborator stream/heartbeat.
  - `POST /api/stories/:id/presence`: broadcasts editor heartbeat and active cursor position.

#### Redux Toolkit State Hierarchy
```typescript
interface RootState {
  auth: {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  stories: {
    items: Story[];
    currentStory: StoryDetail | null;
    filter: 'all' | 'mine' | 'collaborations';
    searchQuery: string;
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
  collaboration: {
    activeWriters: { id: number; username: string; color: string; lastSeen: number }[];
    versions: StoryVersion[];
  };
  ui: {
    theme: 'parchment' | 'midnight';
    isAuthModalOpen: boolean;
    isContributorModalOpen: boolean;
  };
}
```

---

### 5. Deployment & Documentation (Render.com Guide)

- **Root Monorepo Setup**:
  - Unified `package.json` with build scripts: `"build": "npm run build:client && npm run build:server"`.
  - Full-stack runtime entry in `server.ts` mounting Express API routes `/api/*` and serving static Vite bundle in production.
- **Render.com Deployment Instructions**:
  - Full step-by-step guide included in `README.md` covering Backend Web Service, Frontend Static Site / Unified Service, and internal PostgreSQL provisioning on Render.
