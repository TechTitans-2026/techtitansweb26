# Tech Titans Official Website
## Complete Technical Documentation

> **Version:** 1.2  
> **Last Updated:** August 28, 2026  
> **Maintainers:** Tech Titans Development Team  
> **Launch Date:** Imminent  
> **Status:** Pre-launch fixes applied — see §15 Changelog

---

> ⚠️ **UPDATE — AUTH FREEZE LIFTED BY TECH LEAD (Aug 28, 2026)**
>
> The original §7/§8 freeze on authentication code has been **overridden by the tech lead** to ship email verification before launch. `AuthContext.jsx` and `Auth.jsx` were modified — see §8 and §15 for what changed and why. The edge function / club-code verification logic itself was **not** touched and remains as originally implemented; only the post-signup verification step was added.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [The 3D Landing Page (index.html)](#4-the-3d-landing-page-indexhtml)
5. [Database Schema](#5-database-schema)
6. [API & Services](#6-api--services)
7. [Component Reference](#7-component-reference)
8. [Authentication Flow](#8-authentication-flow)
9. [Setup & Installation](#9-setup--installation)
10. [Environment Configuration](#10-environment-configuration)
11. [Known Issues & Fixes](#11-known-issues--fixes)
12. [Performance Optimization Guide](#12-performance-optimization-guide)
13. [Deployment Guide](#13-deployment-guide)
14. [Contributing Guidelines](#14-contributing-guidelines)
15. [Changelog — Pre-Launch Fixes (Aug 28, 2026)](#15-changelog--pre-launch-fixes-aug-28-2026)

---

## 1. Overview

The Tech Titans Official Website is a **dual-architecture application**:

1. **A vanilla HTML/CSS/JS 3D physics landing page** (`index.html`) — the user's first point of contact. Built with Three.js and Cannon.js, it renders an interactive "Tech Core Assembly" scene.
2. **A React single-page application (SPA)** — mounted on demand when the user clicks "Enter Home Page". Handles all functional pages: Home, Auth, Admin, Quests, and Members.

### Key Features
- **3D Physics Landing** — Interactive Three.js + Cannon.js scene in pure HTML
- **Event Management** — Registration, scheduling, and tracking via the Home page
- **Member Directory** — Roster with team assignments, roles, and bios
- **Quest Board** — Gamified bounties/challenges with leaderboard
- **Administrative Dashboard** — Protected area for project and document management
- **Feedback System** — Contact form integrated with Supabase

### Key Design Principles
- **Mobile-first responsive design** using Tailwind CSS
- **Real-time data** via Supabase backend
- **Modular component architecture** for maintainability
- **Performance-conscious** with lazy loading and code splitting

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | v18 | UI library |
| **Build Tool** | Vite | Latest | Bundling & dev server |
| **Styling** | Tailwind CSS | v3+ | Utility-first CSS |
| **Routing** | React Router DOM | v7 | Client-side navigation |
| **Backend/Auth** | Supabase | Latest | Database, Auth, Storage |
| **State Management** | React Context | — | Global auth state |
| **Icons** | Lucide React, FontAwesome | — | Iconography |
| **3D/Physics (Landing)** | Three.js + Cannon.js | — | Vanilla HTML 3D scene |
| **3D/Physics (React)** | Three.js (via Scene.jsx) | — | React wrapper for 3D |
| **Linting** | Oxlint | — | Code quality (`oxlintrc.json`) |
| **Language** | JavaScript (ES2022+) | — | Primary language |

---

## 3. Project Architecture

### 3.1 Dual-Architecture Flow

```
User visits /
       │
       ▼
┌─────────────────────────────┐
│  index.html                 │
│  ├─ Vanilla HTML/CSS        │
│  ├─ Three.js 3D Scene       │
│  ├─ Cannon.js Physics       │
│  └─ "Enter Home Page" button │
└─────────────────────────────┘
       │
       │ Click "Enter Home Page"
       ▼
┌─────────────────────────────┐
│  JS Timeout triggers:       │
│  1. Hide 3D scene elements  │
│  2. Show <div id="root">    │
│  3. Set overflow: auto      │
│  4. pushState('/home')      │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  React SPA mounts           │
│  ├─ main.jsx                │
│  ├─ App.jsx (Router)        │
│  └─ Pages & Components      │
└─────────────────────────────┘
```

### 3.2 Directory Structure

```
tech-titans-website/
├── public/
│   └── (static assets served by Vite)
│
├── src/
│   ├── pages/
│   │   ├── Home.jsx           # Main dashboard (/?tab=home|about|events|members)
│   │   ├── Home.css           # Page-specific custom CSS
│   │   ├── Auth.jsx           # Login & Registration portal
│   │   ├── Admin.jsx          # Protected admin dashboard
│   │   ├── Quests.jsx         # Quest board & leaderboard
│   │   ├── Members.jsx        # Member listing page
│   │   ├── MemberDetail.jsx   # Individual member profile view
│   │   ├── Landing.jsx        # ⚠️ LEGACY — pre-3D landing component
│   │   └── Landing.css        # ⚠️ LEGACY — associated styles
│   │
│   ├── components/
│   │   ├── Navbar.jsx         # Global responsive navigation
│   │   └── Scene.jsx          # React wrapper for 3D elements
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx    # Global auth state & Supabase session
│   │
│   ├── data/
│   │   ├── members.js         # STATIC MOCK — member roster array
│   │   └── quests.js          # STATIC MOCK — quests & leaderboard arrays
│   │
│   ├── lib/
│   │   └── supabase.js        # Supabase client initialization
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── App.jsx                # Master router + protected routes
│   ├── App.css                # Global styles
│   ├── index.css              # Tailwind directives + global resets
│   └── main.jsx               # React entry point
│
├── index.html                 # 3D landing page + React mount point
├── index_old.html             # ⚠️ LEGACY — older landing iterations
├── main_old.html              # ⚠️ LEGACY — older landing iterations
│
├── configuration/
│   ├── vite.config.js         # Vite build config
│   ├── tailwind.config.js     # Tailwind theme & colors
│   ├── postcss.config.js      # PostCSS plugins
│   ├── .oxlintrc.json         # Oxlint linter rules
│   ├── .env.example           # Environment variable template
│   └── .gitignore             # Version control exclusions
│
├── package.json
├── package-lock.json
└── README.md
```

### 3.3 Data Flow Architecture (React SPA)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI Components │────▶│  AuthContext /  │────▶│   Supabase API  │
│  (React Pages)  │◀────│  Local State    │◀────│  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Static Data    │
│ (members.js,    │
│  quests.js)     │
└─────────────────┘
```

---

## 4. The 3D Landing Page (index.html)

### 4.1 Architecture

The `index.html` file is **not** a standard Vite entry point. It is a self-contained, vanilla JavaScript 3D experience that runs independently of React.

**What it contains:**
- A full Three.js scene with Cannon.js physics ("Tech Core Assembly")
- Custom CSS for the 3D canvas and overlay UI
- An "Enter Home Page" button that triggers the React app bootstrap

**React Mount Point:**
```html
<div id="root" style="display: none;"></div>
<script type="module" src="/src/main.jsx"></script>
```

The `#root` div is hidden by default. The 3D scene occupies the full viewport.

### 4.2 Transition Mechanism

When the user clicks **"Enter Home Page"**:

```javascript
// Pseudocode of the transition logic in index.html
function enterHomePage() {
  // 1. Hide the 3D scene container
  document.getElementById('scene-container').style.display = 'none';

  // 2. Reveal the React mount point
  document.getElementById('root').style.display = 'block';

  // 3. Restore page scrolling
  document.body.style.overflow = 'auto';

  // 4. Update browser history without reload
  window.history.pushState({}, '', '/home');

  // 5. React Router detects /home and renders the Home component
}
```

**Important:** The React app does not handle the `/` route for the landing page. The landing page is pure HTML. React only takes over from `/home` onwards.

### 4.3 Scene.jsx vs index.html 3D Scene

| Aspect | `index.html` Scene | `Scene.jsx` |
|--------|-------------------|-------------|
| **Purpose** | Landing page hero | Internal React component 3D elements |
| **Tech** | Vanilla Three.js + Cannon.js | Likely react-three-fiber or basic Three.js |
| **Mount** | Direct DOM manipulation | React component lifecycle |
| **Cleanup** | Must be handled manually | React useEffect cleanup |

### 4.4 Known Issue: No Cleanup on Transition

**Problem:** When transitioning from the 3D landing page to React, the Three.js renderer and Cannon.js physics world continue running in the background. This causes:
- Memory leaks
- Unnecessary CPU/GPU usage
- Potential conflicts if Scene.jsx also initializes WebGL

**Fix (Post-Launch):**
```javascript
// In index.html, before hiding the scene:
function destroyLandingScene() {
  // Stop the animation loop
  cancelAnimationFrame(animationId);

  // Dispose Three.js resources
  renderer.dispose();
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });

  // Remove Cannon.js bodies
  world.bodies.forEach(body => world.removeBody(body));

  // Remove the canvas from DOM
  canvas.parentNode.removeChild(canvas);
}
```

---

## 5. Database Schema

> ⚠️ **This section was rewritten Aug 28, 2026 to match the actual schema in `supabase/schema.sql`.**
> The previous version of this doc described a schema (`documents.restricted`, `feedback` shape, etc.) that never matched the real tables — anyone provisioning from the old doc would have gotten a broken database. Always treat `supabase/schema.sql` as the source of truth; this section is a description of it, not the other way around.

All tables live in `supabase/schema.sql`. Run that file once against a fresh Supabase project, or run `supabase/migration_2026_08_28.sql` against the existing live project (idempotent — safe to re-run, does not drop data).

### 5.1 Enums

```sql
CREATE TYPE user_role AS ENUM ('member', 'head', 'admin');
CREATE TYPE project_status AS ENUM ('current', 'past');
CREATE TYPE doc_type AS ENUM ('script', 'paper', 'doc');
```

### 5.2 Tables

#### `profiles`
The core identity table, one row per authenticated user.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role DEFAULT 'member'::user_role NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  team TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

`full_name`, `team`, and `avatar_url` were added in the Aug 28, 2026 migration — the frontend (`Admin.jsx`, `Profile.jsx`) reads these fields but the original schema never defined them, so those pages were rendering `undefined` before the fix.

#### `members`
Extended profile info (course/year/socials), one-to-one with `profiles`.

```sql
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  field TEXT,
  year INT,
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `projects`, `project_members`, `documents`
Project registry, a join table linking members to projects, and classified documents scoped per project.

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'current'::project_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, member_id)
);

CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type doc_type NOT NULL,
  content_url TEXT NOT NULL,
  restricted BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `quests`, `user_quests`
Quest board and completion tracking. Note: `src/services/questService.js` actually queries a *different* set of tables (`user_quest_history`, `leaderboard`) which are created separately by `scripts/initDB.js` — see the warning box in §6.2.

```sql
CREATE TABLE quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_quests (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, quest_id)
);
```

#### `club_codes`
Registration invite codes, checked by the `verify-club-code` edge function using the service role key.

```sql
CREATE TABLE club_codes (
  code TEXT PRIMARY KEY,
  is_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### `feedback`
Contact form submissions from `Home.jsx`.

```sql
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 5.3 Row Level Security

RLS is enabled on every table. Full policy list lives in `schema.sql`; summarized:

| Table | Read access | Write access |
|-------|-------------|--------------|
| `profiles` | Own row; `head`/`admin` see all | Own row only |
| `members` | All authenticated users | Own row; `head`/`admin` manage all |
| `projects` | All authenticated users | `head`/`admin` only |
| `project_members` | All authenticated users | `head`/`admin` only |
| `documents` | Unrestricted docs public; restricted docs visible to project members and `head`/`admin` | `head`/`admin` only |
| `quests`, `user_quests` | All authenticated users | `head`/`admin` only |
| `club_codes` | Service role only (edge functions) | Service role only |
| `feedback` | `head`/`admin` only | Anyone can insert |

A `get_user_role()` SQL function (`SECURITY DEFINER`) backs most of the role checks above so policies don't have to repeat the subquery.

### 5.4 Auth Trigger — CRITICAL FIX (Aug 28, 2026)

> 🔴 **This was the root cause of the app being non-functional.** The original schema had a trigger that fired *after a row was inserted into `profiles`* — but nothing ever inserted that row in the first place. Every registration produced a Supabase Auth user with **no corresponding `profiles` row**: `AuthContext.fetchProfile()` silently failed, `profile` stayed `null`, every role check (`AdminRoute`, navbar admin link, `/admin` access) was permanently false, and the member directory had nothing to show.

The fix adds a trigger directly on `auth.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, email, role)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', base_username),
    NEW.email,
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();
```

It also handles the `username` `UNIQUE` constraint by appending a numeric suffix on collision, so a duplicate-username signup no longer crashes silently at the DB layer.

The pre-existing `members`-row trigger (fires after a `profiles` insert) was left in place and still runs correctly now that `profiles` actually gets populated.

**Action required:** run `supabase/migration_2026_08_28.sql` against the live project. It includes a backfill step that retroactively creates `profiles` rows for any account that registered before this fix, so existing test accounts aren't left permanently broken.

---

## 6. API & Services

### 6.1 Supabase Client

**`src/lib/supabase.js`**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 6.2 Service Layer Pattern

All Supabase interactions should eventually go through dedicated service files.

#### `src/services/authService.js` (Conceptual — maps to AuthContext.jsx)
```javascript
import { supabase } from '../lib/supabase';

export const authService = {
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // e.g., { full_name: 'John Doe' }
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async verifyClubCode(code) {
    // Current implementation (FROZEN)
    // Calls Supabase Edge Function: verify-club-code
    const { data, error } = await supabase.functions.invoke('verify-club-code', {
      body: { code },
    });
    if (error) throw error;
    return data.valid;
  },
};
```

#### `src/services/memberService.js`
```javascript
import { supabase } from '../lib/supabase';

export const memberService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getByTeam(team) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('team', team)
      .order('full_name');
    if (error) throw error;
    return data;
  },
};
```

#### `src/services/questService.js`
```javascript
import { supabase } from '../lib/supabase';

export const questService = {
  async getAll() {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getLeaderboard() {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .order('total_points', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },
};
```

---

## 7. Component Reference

### 7.1 `App.jsx` — Master Router

**Routes defined:**
| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/home` | Home | Public |
| `/auth` | Auth | Public |
| `/admin` | Admin | Protected (`admin` or `head` role) |
| `/quests` | Quests | Public |

**Protected Route Wrappers:**
- `AdminRoute` — Intercepts navigation to `/admin`, checks `profile.role`
- `PrivateRoute` — Generic auth guard (used if other protected routes are added)

```jsx
// Conceptual implementation
function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  if (!['admin', 'head'].includes(profile?.role)) return <Navigate to="/" />;

  return children;
}
```

### 7.2 `Navbar.jsx`

**Responsibilities:**
- Global responsive navigation bar
- Links: Home, Quests, Members
- Conditional rendering based on auth state:
  - Logged out: "Login" link → `/auth`
  - Logged in: User menu, "Admin" link (if role is `admin`/`head`)
- Logout handler

**Known Issue:** Contact scroll behavior uses a fragile `setTimeout` pattern (see §11.4).

### 7.3 `Scene.jsx`

**Purpose:** React wrapper for 3D elements used **inside** the React app context.

**Note:** This is **NOT** the main landing page 3D scene. The landing page scene lives entirely in `index.html`. `Scene.jsx` is for any 3D elements rendered within React pages (e.g., a decorative 3D element on the Home or Quests page).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `paused` | `Boolean` | No | Pause the render loop |

**Critical:** Must implement `useEffect` cleanup to dispose renderer, geometries, and materials.

### 7.4 `Home.jsx` & `Home.css`

**Responsibilities:**
- Main functional dashboard loaded at `/` and `/home`
- **Dynamic view filtering** via `useSearchParams` and `?tab=` query parameter:
  - `?tab=home` — Hero section, highlights
  - `?tab=about` — About the club
  - `?tab=events` — Event listings and registration
  - `?tab=members` — Member roster grid
- **Member selection state:** `setSelectedMember` for modal/detail view
- **Feedback form:** `feedbackData` state, submits to Supabase `feedback` table
- **Reveal animations:** Uses `IntersectionObserver` to toggle `.reveal.in-view` CSS class on scroll

**Known Issue:** The file is monolithic (handles 4 distinct views). All DOM elements exist within one component tree, causing performance issues (see §11.1).

### 7.5 `Auth.jsx`

**Modes:** `login` | `register` | `pendingVerification` *(new)*

**State managed:**
- `email`
- `password`
- `username`
- `clubCode` (required for registration)
- `pendingVerification` *(new)* — toggles the UI to the 6-digit code entry screen
- `otpCode` *(new)*
- `resendCooldown` *(new)* — 30s countdown gating the resend button

**Registration Flow (updated Aug 28, 2026):**
1. User fills email, password, username, and club code
2. On submit, credentials + club code are passed to `AuthContext.signUp()`
3. `AuthContext` verifies the club code (via edge function or dev override) — unchanged
4. Supabase Auth creates the user; if "Confirm email" is on, no session is returned yet
5. `signUp()` returns `{ needsEmailVerification: true }` and `Auth.jsx` switches to the OTP screen instead of showing an alert
6. User enters the code from their email; `handleVerifyOtp` calls `AuthContext.verifySignupOtp`
7. On success, the user is signed in and the `on_auth_user_created` DB trigger creates their `profiles` row (see §5.4)
8. User is navigated to `/profile`

### 7.6 `Admin.jsx`

**Access:** `AdminRoute` protected — requires `profile.role` of `admin` or `head`.

**Responsibilities:**
- Fetches data from Supabase `projects` table
- Fetches nested `documents` for each project
- Displays administrative overview of projects and their associated documents
- Updates local state with fetched data

### 7.7 `Quests.jsx`

**Responsibilities:**
- Displays gamified quest board
- Imports static data from `src/data/quests.js` (`questsData`)
- Displays leaderboard from `src/data/quests.js` (`leaderboardData`)
- Uses `lucide-react` icons: `Trophy`, `Star`, `Shield`

**Known Issue:** Uses static mock data instead of live Supabase queries (see §11.2).

### 7.8 `Members.jsx` & `MemberDetail.jsx`

**Responsibilities:**
- `Members.jsx` — Lists all club members (currently from `members.js` mock data)
- `MemberDetail.jsx` — Displays detailed profile of an individual member

**Note:** These are **active pages**, not orphaned files. They are routed in `App.jsx`.

---

## 8. Authentication Flow

> ⚠️ **Freeze lifted Aug 28, 2026 by tech lead override.** The club-code verification logic (edge function / `VITE_DEV_CLUB_CODE` fallback) was **not modified**. What changed: a mandatory email verification step was inserted between signup and first login, using Supabase's built-in OTP (`supabase.auth.verifyOtp`), not a custom email system.

### 8.1 Sequence Diagram (current)

```
User ──▶ Auth.jsx ──▶ AuthContext.signUp(email, password, username, clubCode)
                           │
                           ▼
                    verifyClubCode(clubCode)        [UNCHANGED]
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      Edge Function              VITE_DEV_CLUB_CODE
      (Production)               (Development Fallback)
              │                         │
              └────────────┬────────────┘
                           ▼
                    supabase.auth.signUp()
                    (Confirm email must be ON
                     in Supabase Auth settings)
                           │
                           ▼
                    Supabase emails a 6-digit code
                    ({{ .Token }} in the confirm
                     signup email template)
                           │
                           ▼
              Auth.jsx shows OTP entry screen
              (pendingVerification = true)
                           │
                           ▼
              AuthContext.verifySignupOtp(email, token)
              → supabase.auth.verifyOtp({ type: 'signup' })
              → signs the user in on success
                           │
                           ▼
                    auth.users row inserted
                           │
                           ▼
                    DB Trigger: on_auth_user_created   [NEW — see §5.4]
                    (creates the profiles row —
                     this never happened before Aug 28)
                           │
                           ▼
                    AuthContext.jsx
                    (onAuthStateChange fires, fetches profile)
                           │
                           ▼
                    App.jsx AdminRoute
                    (role-based routing)
```

**Resend flow:** `AuthContext.resendSignupOtp(email)` wraps `supabase.auth.resend({ type: 'signup', email })`. The UI (`Auth.jsx`) gates this behind a 30-second cooldown to avoid spamming Supabase's email rate limits.

### 8.2 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `member` | View public pages, submit feedback, view quests, view members |
| `admin` | All member permissions + view feedback, manage projects/documents |
| `head` | All admin permissions + full system access |

### 8.3 AuthContext.jsx Responsibilities (current)

- **Session listening:** Subscribes to Supabase auth state changes
- **`signIn`:** Authenticates via email/password, then fetches profile
- **`signUp`:** Registers new user, verifies club code, returns `{ needsEmailVerification }` so `Auth.jsx` can branch to the OTP screen instead of assuming success
- **`verifySignupOtp(email, token)`:** *(new)* Confirms the 6-digit code, signs the user in on success
- **`resendSignupOtp(email)`:** *(new)* Re-triggers Supabase's confirmation email
- **`signOut`:** Clears session and global state
- **Profile fetching:** Retrieves `role`, `full_name`, `team`, and other metadata from `profiles` table
- **State provision:** Exposes `{ user, profile, loading, signIn, signUp, verifySignupOtp, resendSignupOtp, signOut }` to all children

### 8.4 Required Supabase Dashboard Configuration

Code changes alone don't turn on email verification — two dashboard settings are required:

1. **Authentication → Providers → Email → "Confirm email"** must be turned ON. If it's off, `signUp()` returns a session immediately and the OTP screen never appears (registration still works, just without the verification step).
2. **Authentication → Email Templates → Confirm signup** must include `{{ .Token }}` somewhere in the body. Supabase's default template only has `{{ .ConfirmationURL }}` (a magic link) — without adding the token variable, no code is ever emailed and users will be stuck on the OTP screen with nothing to enter.

---


## 9. Setup & Installation

### 9.1 Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x or yarn ≥ 1.22
- Git
- A Supabase project (free tier sufficient)

### 9.2 Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/tech-titans-website.git
cd tech-titans-website

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials (see §10)

# 4. Run database migrations
# Execute SQL files via Supabase Dashboard SQL Editor
# (see §5 for all required tables and triggers)

# 5. Start development server
npm run dev
```

### 9.3 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint |

---

## 10. Environment Configuration

Create `.env` in the project root:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development Override (Optional)
# Used for admin dashboard access
VITE_ADMIN_ACCESS_CODE=your_admin_access_code_here
```

**Security Notes:**
- Never commit `.env` to version control
- `VITE_ADMIN_ACCESS_CODE` is used for accessing privileged functionalities
- Rotate the admin access code regularly if shared among team members
- The anon key is safe for client-side use (RLS protects your data)

---

## 11. Known Issues & Fixes

### 11.1 Monolithic Home.jsx (CRITICAL)

**Problem:** `Home.jsx` handles 4 distinct views (Home, About, Events, Members) via `useSearchParams` and `?tab=...`. The file is massive. All view DOM elements exist within one component tree, causing:
- Slow initial render
- Unnecessary re-renders on any state change
- Difficult maintenance
- Impossible to code-split per view

**Fix:** Split into proper routed pages or at minimum into sub-components.

```jsx
// App.jsx — REFACTORED
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Members from './pages/Members';
import Quests from './pages/Quests';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/members" element={<Members />} />
      <Route path="/quests" element={<Quests />} />
      <Route path="/auth" element={<Auth />} />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } 
      />
    </Routes>
  );
}
```

**Action:** Create `About.jsx`, `Events.jsx`, and a dedicated `MembersPage.jsx`. Remove `?tab=` logic from `Home.jsx`. Keep `Home.jsx` for the hero/dashboard only.

---

### 11.2 Static Mock Data (`members.js`, `quests.js`)

**Problem:** Frontend contains hardcoded arrays. Quest board, leaderboard, and member roster don't reflect live data.

> 🔴 **Resolved (partially), Aug 28, 2026 — this was actually a privacy incident, not just a data-freshness issue.** `members.js` shipped 30 real students' full names *and personal phone numbers* in plaintext inside the public JS bundle, served to any visitor of `/members` with zero authentication. The `contact` field has been stripped from the data file and the member-detail modal no longer references it. **This is a stopgap, not the real fix** — the underlying problem (member data belongs in the DB with proper RLS, not in a client-shipped file) is still open. Do not re-add phone numbers or other PII to `members.js` under any circumstances; if contact info is needed, it must go through an RLS-gated `members` table read only by authenticated users, or better, a mediated "request contact" flow.

**Fix:** Migrate to database + TanStack Query.

```bash
npm install @tanstack/react-query
```

```jsx
// hooks/useMembers.js
import { useQuery } from '@tanstack/react-query';
import { memberService } from '../services/memberService';

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => memberService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

```jsx
// Members.jsx — USAGE
import { useMembers } from '../hooks/useMembers';

export default function Members() {
  const { data: members, isLoading, error } = useMembers();

  if (isLoading) return <MembersSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {members.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
```

---

### 11.3 Authentication Edge Function Dependency

> ⚠️ **Status update, Aug 28, 2026:** The freeze on this section was lifted by the tech lead. However, **the edge function / club-code verification logic described below was NOT changed** — only the post-signup email verification step was added (see §8). Everything below is still an accurate description of `verifyClubCode`'s current behavior and still-open risk.

**Current Status (Working, unchanged):** Registration uses the `verify-club-code` Supabase Edge Function. A development fallback via `VITE_DEV_CLUB_CODE` is available in `.env`.

**Known Risk (still open):** Registration fails if the edge function is not deployed and no `VITE_DEV_CLUB_CODE` is set. Also note: `VITE_DEV_CLUB_CODE` must never be set in the production environment (Vercel/Netlify) — see §13.4.

**Post-Launch Fix (not yet implemented):** Add a graceful fallback in the verification logic.

```javascript
// POST-LAUNCH REFACTOR — not yet applied
async verifyClubCode(code) {
  try {
    const { data, error } = await supabase.functions.invoke('verify-club-code', {
      body: { code },
    });
    if (error) throw error;
    return data.valid;
  } catch (err) {
    // Fallback for development or edge function downtime
    const devCode = import.meta.env.VITE_DEV_CLUB_CODE;
    return devCode ? code === devCode : false;
  }
}
```

**Post-Launch Alternative (not yet implemented):** Replace the edge function with an `invites` table in Supabase — note this project already has an equivalent `club_codes` table (see §5.2) that isn't yet wired up to this path.

```sql
create table public.invites (
  code text primary key,
  used boolean default false,
  created_at timestamptz default now()
);
```

```javascript
// POST-LAUNCH REFACTOR — not yet applied
async verifyClubCode(code) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code)
    .eq('used', false)
    .single();
  return !!data;
}
```

---

### 11.4 Navbar Contact Scroll Failure

**Problem:** `Navbar.jsx` uses a programmatic route change + `setTimeout` for scrolling to the contact section. If `Home.jsx` takes too long to render, the scroll target (`#contact-footer` or similar) doesn't exist yet, and the scroll fails silently.

**Fix:** Use React refs + `scrollIntoView`.

```jsx
// Home.jsx
import { useRef, useCallback } from 'react';

const contactRef = useRef(null);

export const scrollToContact = () => {
  contactRef.current?.scrollIntoView({ behavior: 'smooth' });
};

// In the JSX
<section ref={contactRef} id="contact-footer">
  {/* Contact form */}
</section>
```

```jsx
// Navbar.jsx
import { scrollToContact } from '../pages/Home';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleContactClick = () => {
    if (location.pathname !== '/' && location.pathname !== '/home') {
      navigate('/home');
      // Small delay to allow Home.jsx to mount
      setTimeout(scrollToContact, 100);
    } else {
      scrollToContact();
    }
  };

  return (
    <button onClick={handleContactClick}>Contact Us</button>
  );
};
```

---

### 11.5 3D Landing Page Memory Leak (index.html)

> ✅ **Already resolved in the actual codebase** — verified Aug 28, 2026. This was true of an earlier version of `index.html`; the current file already implements full teardown (cancels the animation frame, disposes Three.js geometries/materials/textures, removes Cannon.js bodies and constraints, removes the canvas from the DOM) inside the "Enter Home Page" transition handler before showing the React root. No action needed. Left here for reference in case of regression.

**Problem (historical):** When the user clicks "Enter Home Page", the Three.js renderer and Cannon.js physics world in `index.html` continue running in the background. The canvas is only hidden (`display: none`), not destroyed. This causes:
- Memory leaks (geometries, materials, textures retained)
- Cannon.js bodies still simulating physics
- Potential WebGL context limit issues if the user navigates back

**Fix (already applied):** Proper teardown before transitioning to React.

```javascript
// In index.html, inside the "Enter Home Page" handler:
function enterHomePage() {
  // 1. STOP the animation loop
  cancelAnimationFrame(animationId);

  // 2. DISPOSE Three.js resources
  renderer.dispose();
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(m => m.dispose());
      } else {
        object.material.dispose();
      }
    }
    if (object.texture) object.texture.dispose();
  });

  // 3. CLEANUP Cannon.js world
  world.bodies.forEach(body => world.removeBody(body));
  world.constraints.forEach(constraint => world.removeConstraint(constraint));

  // 4. REMOVE canvas from DOM (releases WebGL context)
  const canvas = document.querySelector('canvas');
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  // 5. NOW transition to React
  document.getElementById('scene-container').style.display = 'none';
  document.getElementById('root').style.display = 'block';
  document.body.style.overflow = 'auto';
  window.history.pushState({}, '', '/home');
}
```

---

### 11.6 Scene.jsx Cleanup (React 3D Wrapper)

**Problem:** `Scene.jsx` initializes a Three.js scene but may not properly dispose resources on unmount.

**Fix:** Comprehensive cleanup in `useEffect`.

```jsx
useEffect(() => {
  const canvas = canvasRef.current;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, 
    canvas.clientWidth / canvas.clientHeight, 
    0.1, 
    1000
  );

  // ... setup scene objects ...

  let animationId;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);

    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
      if (object.texture) object.texture.dispose();
    });

    renderer.dispose();
  };
}, []);
```

**Recommendation:** Consider migrating to `@react-three/fiber` and `@react-three/drei` for automatic lifecycle management.

---

### 11.7 Orphaned / Legacy Files

> ✅ **Already resolved** — verified Aug 28, 2026. `Landing.jsx`, `Landing.css`, `index_old.html`, and `main_old.html` are not present in the current codebase; this cleanup already happened before this doc revision.

**Files that ARE used (do NOT delete):**
- `src/pages/Members.jsx` — Active member listing page
- `src/pages/MemberDetail.jsx` — Active member detail page

---

### 11.8 Missing Avatar Infrastructure

**Problem:** Member modals and cards use Lucide icons as fallbacks. No actual avatar upload system exists. Social media links in `members.js` are `#` placeholders.

**Fix:** Implement avatar upload flow.

```jsx
// components/AvatarUpload.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AvatarUpload({ userId, currentUrl, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    onUpload(publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <img 
        src={currentUrl || '/default-avatar.png'} 
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover"
        onError={(e) => { e.target.src = '/default-avatar.png'; }}
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
```

---

## 12. Performance Optimization Guide

### 12.1 Code Splitting & Lazy Loading

```jsx
// App.jsx
import { lazy, Suspense } from 'react';

const Quests = lazy(() => import('./pages/Quests'));
const Admin = lazy(() => import('./pages/Admin'));
const Scene = lazy(() => import('./components/Scene'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/quests" element={<Quests />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
```

### 12.2 Memoization Strategy

```jsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive member cards
const MemberCard = memo(function MemberCard({ member, onSelect }) {
  return (
    <div onClick={() => onSelect(member.id)}>
      <img 
        src={member.avatar_url} 
        alt={member.full_name} 
        loading="lazy"
        onError={(e) => { e.target.src = '/default-avatar.png'; }}
      />
      <h3>{member.full_name}</h3>
      <span>{member.team}</span>
    </div>
  );
});

// In parent
const handleSelect = useCallback((id) => {
  setSelectedId(id);
}, []);

const sortedMembers = useMemo(() => {
  return members.sort((a, b) => a.full_name.localeCompare(b.full_name));
}, [members]);
```

### 12.3 Image Optimization

| Technique | Implementation |
|-----------|---------------|
| Lazy loading | `loading="lazy"` on all images below the fold |
| Error fallback | `onError` handler to swap broken images to default |
| Format optimization | Serve WebP/AVIF with PNG fallback |
| CDN delivery | Use Supabase Storage CDN URLs |
| Placeholder | Skeleton loading state while fetching |

### 12.4 IntersectionObserver for Animations

`Home.jsx` already uses `IntersectionObserver` for reveal animations. Ensure the observer is properly disconnected on unmount:

```jsx
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  return () => observer.disconnect(); // Cleanup
}, []);
```

### 12.5 Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
});
```

### 12.6 Virtual Scrolling (for large lists)

If member roster exceeds 100 entries:

```bash
npm install react-window
```

```jsx
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={members.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <MemberCard member={members[index]} style={style} />
  )}
</List>
```

---

## 13. Deployment Guide

### 13.1 Build Configuration

> This section previously showed a config that didn't match the real `vite.config.js` (it had `sourcemap: true`, which would have shipped readable source to production). Below is the actual current file.

```javascript
// vite.config.js (actual, as of Aug 28, 2026)
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    // Explicit: never ship readable source maps in the production bundle.
    sourcemap: false,
    rollupOptions: {
      output: {
        // NOTE: this project's Vite (v8, Rolldown-based) requires manualChunks
        // as a FUNCTION, not an object literal — the object form used in
        // older Vite/Rollup docs throws a build error here.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('cannon-es')) return 'three';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor';
          }
        },
      },
    },
  },
})
```

`Admin.jsx` is also lazy-loaded via `React.lazy()` in `App.jsx` (wrapped in a `Suspense` boundary on the `/admin` route), so its code is no longer part of the main bundle every visitor downloads. Verified with `npm run build`: main bundle went from a single 509 KB chunk to properly split `vendor`/`supabase`/`three`/`icons`/`Admin` chunks.

### 13.2 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Required Environment Variables in Vercel Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- ⚠️ Do **not** set `VITE_DEV_CLUB_CODE` here — see checklist below.
- ⚠️ Do **not** set `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_URL` here — those are only for `scripts/initDB.js`, run locally/CI, never bundled or needed at runtime by the deployed site.

**Vercel `vercel.json` (if needed for SPA routing):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 13.3 Netlify Deployment

```bash
# Build locally
npm run build

# Deploy via Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Netlify `_redirects` file:**
```
/*    /index.html   200
```

### 13.4 Supabase Production Checklist

- [x] Enable RLS on all tables — confirmed present in `schema.sql` for every table
- [x] `on_auth_user_created` trigger deployed — **must run `supabase/migration_2026_08_28.sql`**, see §5.4
- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` and DB password — real values were found committed in `.env.example` before Aug 28 fix; rotation must happen regardless of whether the old repo push is confirmed leaked
- [ ] Enable "Confirm email" under Authentication → Providers → Email — required for the new OTP verification step, see §8.4
- [ ] Add `{{ .Token }}` to the "Confirm signup" email template — see §8.4
- [ ] Configure proper storage bucket policies
- [ ] Set up database backups
- [ ] Configure custom SMTP for auth emails (optional — Supabase's default email works but has low send limits; recommended before real launch traffic)
- [ ] Enable rate limiting on auth endpoints
- [ ] Review and tighten CORS settings
- [ ] Verify `verify-club-code` edge function is deployed
- [ ] Confirm `VITE_DEV_CLUB_CODE` is **not** set in the production environment (Vercel/Netlify dashboard) — it is fine in local `.env` only
- [ ] Confirm `.env` was never committed to git; if the project's earlier smaller version was ever pushed to a remote, treat all keys from that period as compromised regardless of rotation status

---

## 14. Contributing Guidelines

### 14.1 Branch Naming

```
feature/member-avatars
fix/navbar-scroll-bug
refactor/split-home-page
docs/api-reference
```

### 14.2 Commit Convention

```
feat: add avatar upload component
fix: resolve contact scroll timing issue
docs: update database schema documentation
refactor: split Home.jsx into separate pages
perf: implement React.memo on MemberCard
```

### 14.3 Pull Request Checklist

- [ ] Code follows existing style (Oxlint passes)
- [ ] New components have PropTypes or JSDoc
- [ ] Database changes include migration files
- [ ] No console.log statements in production code
- [ ] Responsive design tested on mobile viewport
- [ ] Authentication flows tested (login/register/logout)
- [ ] 3D landing page transition tested (Enter Home Page button)

### 14.4 Code Review Focus Areas

1. **Performance:** Are new components memoized? Is data fetching cached?
2. **Security:** Are Supabase queries protected by RLS? Is user input sanitized?
3. **Accessibility:** Do images have alt text? Are interactive elements keyboard-navigable?
4. **Cleanup:** Are useEffect subscriptions, observers, and timers properly disposed?
5. **3D Resources:** Are Three.js/Cannon.js resources cleaned up on unmount/transition?

---

## Appendix A: Migration Roadmap

| Phase | Task | Effort | Priority | Status |
|-------|------|--------|----------|--------|
| **1** | Split `Home.jsx` into routed pages | Medium | 🔴 Critical | Pre-launch |
| **1** | Remove orphaned files (Landing.jsx, Landing.css, *_old.html) | Low | 🟡 High | Pre-launch |
| **1** | Fix 3D landing page memory leak (index.html cleanup) | Low | 🔴 Critical | Pre-launch |
| **2** | Create SQL migrations & seed data | Medium | 🔴 Critical | Pre-launch |
| **2** | Migrate `members.js` → `profiles` table | Medium | 🔴 Critical | Pre-launch |
| **2** | Migrate `quests.js` → `quests` table | Medium | 🔴 Critical | Pre-launch |
| **3** | Add TanStack Query + service layer | Medium | 🟡 High | Post-launch |
| **3** | Implement avatar upload system | Medium | 🟡 High | Post-launch |
| **4** | Fix Scene.jsx cleanup | Low | 🟡 High | Post-launch |
| **4** | Add lazy loading for heavy routes | Low | 🟢 Medium | Post-launch |
| **—** | ~~Refactor auth flow / remove edge function~~ | — | 🔒 **FROZEN** | Post-launch only |
| **5** | Implement virtual scrolling for large lists | Low | 🟢 Medium | Post-launch |
| **5** | Add bundle analysis & optimization | Low | 🟢 Medium | Post-launch |

---

## Appendix B: Troubleshooting

### Issue: "Invalid club invite code" on registration
**Cause:** Edge function not deployed or `VITE_DEV_CLUB_CODE` not set.  
**Fix:** Set `VITE_DEV_CLUB_CODE` in `.env` for local dev. For production, ensure the `verify-club-code` edge function is deployed in Supabase.

### Issue: Member roster shows empty
**Cause:** `profiles` table doesn't exist or has no data.  
**Fix:** Run the SQL migration for `profiles` table and ensure the `on_auth_user_created` trigger is active.

### Issue: Admin dashboard shows "Access Denied"
**Cause:** User's `profiles.role` is not 'admin' or 'head'.  
**Fix:** Manually update the role in Supabase Dashboard SQL Editor:
```sql
update profiles set role = 'admin' where id = 'user-uuid';
```

### Issue: 3D scene causes browser to lag after entering home page
**Cause:** The landing page Three.js/Cannon.js scene is not destroyed on transition — it continues running in the background.  
**Fix:** Implement the teardown logic in `index.html` (see §11.5).

### Issue: Images not loading in production
**Cause:** Supabase Storage bucket not public or CORS misconfigured.  
**Fix:** Set the `avatars` bucket to public in Supabase Dashboard → Storage → Buckets → avatars → Make public.

### Issue: React app doesn't load after clicking "Enter Home Page"
**Cause:** `main.jsx` or `App.jsx` has a runtime error, or the `/home` route is not defined.  
**Fix:** Check browser console for errors. Verify `App.jsx` has a route for `/home`. Ensure `index.html` correctly shows `#root` div before pushing state.

### Issue: Scroll animations not triggering on Home page
**Cause:** `IntersectionObserver` not set up or `.reveal` elements not in DOM.  
**Fix:** Verify the observer is initialized in `Home.jsx` useEffect and that elements have the `reveal` CSS class.

### Issue: New registrations complete but the user is never signed in / role is always `member` / "Access Denied" on Admin even for a real admin
**Cause:** `supabase/migration_2026_08_28.sql` has not been run against this project yet — the `on_auth_user_created` trigger doesn't exist, so `profiles` rows are never created.  
**Fix:** Run the migration in the Supabase Dashboard SQL Editor. See §5.4.

### Issue: User registers but never receives a verification code / OTP screen shows but code never arrives
**Cause:** Either "Confirm email" is off (Authentication → Providers → Email), or the "Confirm signup" email template doesn't include `{{ .Token }}`.  
**Fix:** See §8.4. Check spam folder as well — Supabase's default email sender has a higher chance of landing in spam than a custom SMTP domain.

---

## 15. Changelog — Pre-Launch Fixes (Aug 28, 2026)

Applied by the tech lead (freeze override) with AI-assisted review, in response to a pre-security-handoff audit. Full details are inline in the relevant sections above; this is a flat summary for the handover.

| Area | Change | Section |
|------|--------|---------|
| 🔴 Critical | Added missing `on_auth_user_created` DB trigger — previously **no code anywhere created a `profiles` row on signup**, meaning every registered account was silently broken (no role, no directory listing, no admin access, ever) | §5.4 |
| 🔴 Critical | Removed 30 real students' phone numbers from `src/data/members.js`, which shipped them in plaintext to every visitor of the public `/members` page with no authentication | §11.2 |
| 🔴 Critical | Real Supabase credentials (including the `service_role` key and DB password, which bypass RLS entirely) were found committed in `.env.example`. Rotation is a manual dashboard step, not fixable in code — tracked in §13.4 checklist | §13.4 |
| 🟠 Security | `.gitignore` did not exclude `.env` at all (only `*.local`) — fixed | — |
| 🟠 Security | `.env.example` replaced with placeholder values | — |
| 🟠 Security | `vite.config.js` now explicitly sets `sourcemap: false` for production builds | §13.1 |
| 🟢 Feature | Email verification via 6-digit OTP code added to the signup flow, using Supabase's built-in `verifyOtp`/`resend` — not a custom SMTP system. Auth-freeze on this code was explicitly overridden by the tech lead for this change only | §8 |
| 🟢 Feature | `AuthContext` now exposes `verifySignupOtp` and `resendSignupOtp` | §8.3 |
| 🟡 Performance | Production bundle code-split: `vendor`/`supabase`/`three`/`icons` chunks, plus `Admin.jsx` lazy-loaded behind `React.lazy`/`Suspense`. Verified with `npm run build`: went from one 509 KB chunk to properly split chunks | §13.1 |
| 🟡 Data model | `profiles` table gained `full_name`, `team`, `avatar_url` columns — the UI (`Admin.jsx`, `Profile.jsx`) was already reading these fields but they never existed in the schema | §5.2 |
| ⚪ Docs | §5 Database Schema rewritten to match the actual `supabase/schema.sql` — the previous version described tables/fields that never existed in the real project | §5 |
| ⚪ Docs | Confirmed already resolved, no action needed: 3D landing page memory leak cleanup (§11.5), orphaned legacy files (§11.7) — both were already fixed/absent in the delivered codebase | §11.5, §11.7 |

**Still open / not done in this pass** (do not assume complete):
- Migrating `src/data/members.js` off static client-side data entirely onto an RLS-gated DB table (the phone-number removal was a stopgap, not the full fix — see §11.2)
- `questService.js` targets `user_quest_history`/`leaderboard` tables that are created by `scripts/initDB.js`, a separate path from `schema.sql`'s `quests`/`user_quests` — these two systems have not been reconciled
- `Home.jsx` monolith split (§11.1) — not attempted, out of scope for this pass
- Edge function graceful-fallback refactor (§11.3) — explicitly still deferred, not done
- Confirming RLS policies match `schema.sql` on the actual live Supabase project (only the file contents were reviewed, not the live dashboard state)

---

*End of Documentation — Tech Titans Development Team*
