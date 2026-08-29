# Tech Titans Official Website (`techtitansite`)
## Complete Technical Architecture & System Documentation

> **Document Version:** 2.0.0  
> **Last Updated:** August 30, 2026  
> **Maintainers:** Tech Titans Engineering & Architecture Team  
> **Status:** Production-Ready / Deployed  
> **Target Framework:** React 19 (SPA) + Vite 8 + Three.js / Cannon-es + Supabase (PostgreSQL / Edge Functions)

---

## 📑 Table of Contents

1. [Executive System Overview](#1-executive-system-overview)
2. [Technology Stack Matrix](#2-technology-stack-matrix)
3. [System Architecture & Directory Structure](#3-system-architecture--directory-structure)
4. [Interactive 3D WebGL Physics Engine](#4-interactive-3d-webgl-physics-engine)
5. [Global Design System & UI/UX Engine](#5-global-design-system--uiux-engine)
6. [Master Database Schema & Data Models](#6-master-database-schema--data-models)
7. [Security Architecture, RLS & Access Control](#7-security-architecture-rls--access-control)
8. [Authentication & State Management Lifecycle](#8-authentication--state-management-lifecycle)
9. [Services & Data Access Layer Reference](#9-services--data-access-layer-reference)
10. [Comprehensive Page-by-Page Reference](#10-comprehensive-page-by-page-reference)
11. [Build Pipeline, Chunking & Performance Optimization](#11-build-pipeline-chunking--performance-optimization)
12. [Environment Configuration & Secrets Management](#12-environment-configuration--secrets-management)
13. [Installation, Setup & Database Seeding](#13-installation-setup--database-seeding)
14. [CI/CD Automation & Deployment Guide](#14-cicd-automation--deployment-guide)
15. [Troubleshooting & Operational Runbook](#15-troubleshooting--operational-runbook)
16. [Changelog & Architecture Evolution](#16-changelog--architecture-evolution)

---

## 1. Executive System Overview

The **Tech Titans Official Website** (`techtitansite`) serves as the official digital headquarters, gamified operative platform, and event operations hub for the Tech Titans student collective across **Computer Science**, **Data Science**, and **Information Technology**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TECH TITANS PLATFORM                                    │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼                                                           ▼
 ┌───────────────────────────┐                               ┌───────────────────────────┐
 │   Interactive 3D WebGL    │                               │     React 19 SPA Core     │
 │   Physics Core Engine     │                               │   Single Page Application │
 │  (Three.js + Cannon-es)   │                               │    (React Router DOM v7)  │
 └───────────────────────────┘                               └─────────────┬─────────────┘
                                                                           │
                                             ┌─────────────────────────────┴─────────────┐
                                             ▼                                           ▼
                               ┌───────────────────────────┐               ┌───────────────────────────┐
                               │   Supabase Cloud BaaS     │               │   Storage & Functions     │
                               │  - PostgreSQL Engine      │               │  - event_images Bucket    │
                               │  - Row Level Security     │               │  - Deno grant-admin API   │
                               │  - JWT Session Auth       │               │  - verify_admin_code RPC  │
                               └───────────────────────────┘               └───────────────────────────┘
```

### 1.1 Core Strategic Objectives

- **Immersive 3D Experience**: Deliver an ambient, cyber-themed WebGL hero simulation (`/landing`) modeling rigid-body physics, orbital rings, and dynamic particle fields without degrading client device performance.
- **Operational Event Management**: Streamline event discovery, rulebook breakdown, and live attendee registrations with state-preserving authentication redirections.
- **Gamified Operative Bounties**: Foster student problem-solving through a live bounty board (`/quests`) featuring tiered XP payouts, difficulty ratings, and automated real-time leaderboard aggregation.
- **Role-Gated Security Clearance**: Implement strict administrative governance (`/admin`) allowing authorized organizers (`head` or `admin`) to monitor telemetry, review registrations, publish bounties, and deploy event assets.
- **Zero-Compromise Security**: Enforce complete PostgreSQL Row-Level Security (RLS) across all tables, protect client bundles from secret leaks, and isolate administrative promotions behind server-side stored procedures and edge functions.

---

## 2. Technology Stack Matrix

The platform is constructed with modern, enterprise-grade open-source technologies:

| Layer | Package / Tool | Version | Architectural Responsibility |
|---|---|---|---|
| **Core UI Library** | `react` | `^19.2.8` | Declarative component tree, concurrency, and reactive state management |
| **DOM Renderer** | `react-dom` | `^19.2.8` | Client-side DOM hydration and reconciliation |
| **Client Routing** | `react-router-dom` | `^7.18.2` | SPA route matching, programmatic transitions, and route guards |
| **Build Engine** | `vite` | `^8.2.2` | Rolldown-based asset compilation, chunk splitting, and HMR server |
| **React Compiler Plugin**| `@vitejs/plugin-react` | `^6.1.0` | Fast Refresh and JSX transformation |
| **Styling & Design** | `tailwindcss` | `^3.4.19` | Cyberpunk theme tokens, glassmorphism utilities, and responsive breakpoints |
| **CSS Preprocessing**| `postcss` / `autoprefixer` | `^8.5.26` / `^10.5.4` | CSS vendor prefix generation and stylesheet optimization |
| **3D Graphics Engine** | `three` | `^0.185.1` | WebGL scene graph, perspective camera, mesh geometries, and lighting |
| **Physics Simulation** | `cannon-es` | `^0.20.0` | Rigid body physics simulation, orbital constraints, and velocity updates |
| **Iconography** | `lucide-react` | `^1.34.0` | Clean vector iconography across all dashboard views |
| **Cloud BaaS Client** | `@supabase/supabase-js` | `^2.112.4` | PostgreSQL client, JWT session handling, and Storage API integration |
| **Database Driver** | `pg` | `^8.23.0` | Node.js PostgreSQL driver for local bootstrapping seeder (`initDB.js`) |
| **Environment Loader**| `dotenv` | `^17.4.2` | Environment variable parsing for Node administrative scripts |
| **Static Linter** | `oxlint` | `^1.79.0` | Rust-accelerated linting and static analysis tool |

---

## 3. System Architecture & Directory Structure

### 3.1 Routing & Layout Hierarchy

The application runs as a modern, unified Single Page Application. Standard routes are rendered inside `MainLayout`, which mounts `<BackgroundEffects />` (ambient particle grid + glowing anchor nodes) and the sticky `<Navbar />`. The heavy 3D landing page (`TechTitansLanding.jsx`) and the administrative dashboard (`Admin.jsx`) are lazy-loaded via `React.lazy()` for optimal initial load times.

```
App.jsx (Router & AuthProvider)
│
├── Route: /landing ──────────▶ <Suspense><TechTitansLanding /></Suspense> (Standalone full-screen 3D)
│
└── Route: MainLayout ────────▶ <BackgroundEffects /> + <Navbar /> + <Outlet />
    ├── Route: / or /home ────▶ <Home />
    ├── Route: /about ────────▶ <About />
    ├── Route: /events ───────▶ <Events />
    ├── Route: /members ──────▶ <Members />
    ├── Route: /auth ─────────▶ <Auth />
    ├── Route: /quests ───────▶ <PrivateRoute><Quests /></PrivateRoute>
    ├── Route: /profile ──────▶ <PrivateRoute><Profile /></PrivateRoute>
    ├── Route: /admin ────────▶ <PrivateRoute><Suspense><Admin /></Suspense></PrivateRoute>
    └── Route: * ─────────────▶ <Navigate to="/" replace />
```

### 3.2 Deep File Map

```
techtitansweb26-main/
├── 📁 .github/
│   └── workflows/
│       └── ci-cd.yml             # 3-Stage Pipeline: Oxlint Lint ➔ Vite Build ➔ GitHub Pages Deploy
├── 📁 .vscode/                   # Clean editor configurations & file nesting rules
│   ├── extensions.json
│   └── settings.json
├── 📁 docs/                      # Technical manuals & architecture specs
│   └── TECH_TITANS_DOCUMENTATION.md
├── 📁 public/                    # Static root distribution assets
│   ├── 404.html                  # SPA route redirection script for GitHub Pages
│   ├── favicon.svg               # Browser icon
│   ├── icons.svg                 # SVG sprite dictionary
│   └── logo.jpg                  # Official Tech Titans emblem
├── 📁 scripts/                   # Database maintenance and automation scripts
│   └── initDB.js                 # Automated PostgreSQL table seeder & bootstrap script
├── 📁 src/                       # Application source root
│   ├── 📁 assets/                # Bundled vectors and images
│   ├── 📁 components/            # Reusable UI & background effect components
│   │   ├── BackgroundEffects.jsx # Canvas particle grid + animated CSS radial anchors
│   │   └── Navbar.jsx            # Sticky blurred glassmorphism navigation bar
│   ├── 📁 contexts/              # Global application state management
│   │   ├── AuthContext.jsx       # Supabase authentication session & profile synchronization
│   │   └── AuthContextDefinition.js # AuthContext singleton definition
│   ├── 📁 data/                  # Static roster and reference data
│   │   └── members.js            # Curated member roster array with bio and links
│   ├── 📁 hooks/                 # Custom reusable React hooks
│   │   ├── useAuth.js            # Global auth context consumption hook
│   │   └── useRevealOnScroll.js  # IntersectionObserver hook for scroll-triggered reveals
│   ├── 📁 lib/                   # Client instances
│   │   └── supabase.js           # Supabase client instantiation with environment guards
│   ├── 📁 pages/                 # Page components & page-scoped stylesheets
│   │   ├── About.jsx             # Club mission, pillars, and technical domain breakdown
│   │   ├── Admin.jsx             # Root security admin dashboard, telemetry, and form controls
│   │   ├── Auth.jsx              # Sign-in & member registration portal with state preservation
│   │   ├── Events.jsx            # Event deployment schedule, game formats, and registration form
│   │   ├── Home.css              # Cyber-theme styling, glassmorphism utilities, and keycaps
│   │   ├── Home.jsx              # Hero dashboard with typewriter effect, tickers, and contact modal
│   │   ├── Members.jsx           # Team-filtered member roster and detail modals
│   │   ├── Profile.jsx           # Operative profile hub, XP totals, and quest history logs
│   │   ├── Quests.jsx            # Active bounty board and real-time global leaderboard
│   │   ├── TechTitansLanding.css # 3D landing page overlay controls and HUD styling
│   │   └── TechTitansLanding.jsx # Full-screen 3D Three.js + Cannon-es physics core simulation
│   ├── 📁 services/              # Data services and backend query abstractions
│   │   ├── eventService.js       # Event CRUD operations & storage image uploads
│   │   └── questService.js       # Quest, history, leaderboard, & profile database queries
│   ├── App.css                   # Minimal global shell styling & custom scrollbars
│   ├── App.jsx                   # Master router, lazy boundaries, and route guards
│   ├── index.css                 # Tailwind directives, color variables, and font bindings
│   └── main.jsx                  # React application hydration entry point
├── 📁 supabase/                  # Database schemas, migrations & Deno functions
│   ├── 📁 functions/
│   │   └── 📁 grant-admin/
│   │       └── index.ts          # Deno Edge Function for secure administrative promotion
│   ├── 📁 migrations/            # Incremental schema evolution history
│   │   ├── migration_2026_08_28.sql
│   │   └── migration_pivot.sql
│   ├── schema.sql                # Master database schema with triggers & RLS policies
│   └── setup.sql                 # Comprehensive database bootstrap script
├── .env.example                  # Environment variable reference template
├── .gitignore                    # Version control exclusions
├── .oxlintrc.json                # Oxlint rules configuration
├── index.html                    # HTML entry point with preconnected Google Fonts
├── LICENSE                       # MIT License
├── package.json                  # Dependencies, metadata, and npm scripts
├── postcss.config.js             # PostCSS plugins configuration
├── README.md                     # Project overview and quickstart guide
├── tailwind.config.js            # Theme tokens, font families, and color palette
└── vite.config.js                # Vite build options, code splitting, and chunk configuration
```

---

## 4. Interactive 3D WebGL Physics Engine

The 3D Hero simulation (`src/pages/TechTitansLanding.jsx`) provides an interactive cybernetic experience modeling a **Tech Core Assembly**.

```
                               ┌────────────────────────────────┐
                               │   TechTitansLanding Component  │
                               └───────────────┬────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │     Three.js Renderer     │                   │     Cannon-es Physics     │
         │  - Perspective Camera     │                   │  - Discrete Physics Step  │
         │  - Directional / Point    │◄─────────────────▶│  - Sphere & Box Bodies    │
         │  - Core Mesh / Wireframes │  Sync Position    │  - Orbital Damping        │
         │  - 1,000 Particle Field   │   & Quaternion    │  - Restitution/Friction   │
         └───────────────────────────┘                   └───────────────────────────┘
```

### 4.1 Rendering & Physics Architecture

1. **Scene Initialization**:
   - Creates a `THREE.WebGLRenderer` with `antialias: true` and power-preference optimization.
   - Sets pixel ratio to `Math.min(window.devicePixelRatio, 2)` to avoid performance bottlenecks on Ultra-HD/Retina screens.
   - Configures a `THREE.PerspectiveCamera` (FOV 60, near plane 0.1, far plane 1000).
2. **Physics World Integration**:
   - Instantiates a `CANNON.World` with a custom gravity vector.
   - Synchronizes rigid bodies (spheres, boxes, compound bodies) with Three.js meshes inside the main `requestAnimationFrame` render loop (`world.step(1/60, delta, 3)`).
3. **Particle Stardust Field**:
   - Generates 1,000+ points across a 3D spherical volume using `THREE.BufferGeometry` and `THREE.PointsMaterial` with additive blending.
4. **Interactive Controls & Audio**:
   - Tracks cursor coordinates (`pointerX`, `pointerY`) with lerped damping to produce smooth camera parallax.
   - Audio synthesized on user interaction with frequency modulation.
5. **Memory & Context Cleanup**:
   - Upon component unmount, `TechTitansLanding.jsx` executes comprehensive teardown:
     - Cancels the `requestAnimationFrame` loop.
     - Disposes all geometries, materials, and textures.
     - Destroys Cannon.js bodies and constraints.
     - Disposes the WebGL context (`renderer.dispose()`) and detaches the canvas element from the DOM.

---

## 5. Global Design System & UI/UX Engine

### 5.1 Color Palette & Theme Tokens

The application employs a curated cyber-dark aesthetic configured in `tailwind.config.js`:

```javascript
colors: {
  accent: "#ae97d6",       // Titan Lavender / Soft Neon Violet
  background: "#1a1b22",   // Deep Cyber Carbon
  card: "#21222b",         // Elevated Dark Grey Panel
  border: "#31333e",       // Subtle Structural Border
  cyan: "#00f3ff",         // Tech Cyan / Neon Glow
  pink: "#ff007f",         // Titan Energy Pink
}
```

### 5.2 Typography System

- **`Orbitron` / `Outfit`**: Applied to primary titles, headings, and key operative callouts.
- **`JetBrains Mono`**: Applied to operative IDs, telemetry data, XP values, codes, and badges.
- **`Space Grotesk`**: Applied to body copy, summaries, and narrative sections.

### 5.3 Background Effects & Scroll Reveals

- **`<BackgroundEffects />` (`src/components/BackgroundEffects.jsx`)**:
  - Automatically mounted across all standard pages.
  - Renders an interactive canvas particle grid with subtle particle velocity and distance-based line rendering.
  - Generates glowing CSS radial anchors in the top-left and bottom-right viewport corners.
- **`useRevealOnScroll` Hook (`src/hooks/useRevealOnScroll.js`)**:
  - Leverages a singleton `IntersectionObserver` observing all elements with the `.reveal` class.
  - Adds `.in-view` when elements cross the 10% viewport threshold, triggering smooth CSS transforms and opacity transitions.

---

## 6. Master Database Schema & Data Models

The complete database schema is maintained in `supabase/schema.sql` and `supabase/setup.sql`.

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   POSTGRESQL DATABASE                                   │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
 ┌───────────────┐                    ┌───────────────┐                    ┌───────────────┐
 │   profiles    │                    │    events     │                    │    quests     │
 ├───────────────┤                    ├───────────────┤                    ├───────────────┤
 │ id (UUID, PK) │                    │ id (UUID, PK) │                    │ id (UUID, PK) │
 │ username      │                    │ title         │                    │ title         │
 │ full_name     │                    │ description   │                    │ description   │
 │ email         │                    │ event_date    │                    │ base_xp       │
 │ avatar_url    │                    │ status        │                    │ bonus_xp      │
 │ team          │                    │ image_url     │                    │ rewards       │
 │ role          │                    │ created_at    │                    │ active_week   │
 │ xp            │                    └───────────────┘                    │ difficulty    │
 │ created_at    │                                                         │ status        │
 └───────┬───────┘                                                         │ created_at    │
         │                                                                 └───────┬───────┘
         │ 1:N                                                                     │ 1:N
         └────────────────────────────────────┬────────────────────────────────────┘
                                              ▼
                                ┌───────────────────────────┐
                                │    user_quest_history     │
                                ├───────────────────────────┤
                                │ id (UUID, PK)             │
                                │ user_id (UUID, FK)        │
                                │ quest_id (UUID, FK)       │
                                │ status                    │
                                │ xp_awarded                │
                                │ created_at                │
                                └─────────────┬─────────────┘
                                              ▼
                                ┌───────────────────────────┐
                                │     VIEW: leaderboard     │
                                ├───────────────────────────┤
                                │ id, full_name, avatar_url │
                                │ total_points (= xp + sum) │
                                └───────────────────────────┘
```

### 6.1 Table Definitions (DDL)

#### 1. `public.profiles`
Stores club operative profiles, synchronized 1:1 with `auth.users`.

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    team TEXT DEFAULT 'General Members',
    role TEXT CHECK (role IN ('member', 'head', 'admin')) DEFAULT 'member' NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 2. `public.events`
Stores scheduled deployments, tech games, and workshops.

```sql
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 3. `public.quests`
Stores operative bounties and algorithmic challenges.

```sql
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    base_xp INTEGER DEFAULT 100 NOT NULL,
    bonus_xp INTEGER DEFAULT 50 NOT NULL,
    rewards TEXT DEFAULT 'Digital Certificate',
    active_week INTEGER DEFAULT 1,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'easy', 'medium', 'hard')) DEFAULT 'Beginner' NOT NULL,
    status TEXT CHECK (status IN ('Active', 'Upcoming', 'Closed')) DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 4. `public.user_quest_history`
Tracks individual user participation, outcomes, and XP awarded per quest.

```sql
CREATE TABLE IF NOT EXISTS public.user_quest_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('participated', 'won', 'lost')) DEFAULT 'participated' NOT NULL,
    xp_awarded INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, quest_id)
);
```

#### 5. `public.feedback`
Stores public transmission messages sent from the Home page contact modal.

```sql
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.2 Views & Storage Buckets

#### SQL View: `public.leaderboard`
Aggregates profile XP with awarded quest XP for live global rankings.

```sql
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    COALESCE(p.xp, 0) + COALESCE(SUM(h.xp_awarded), 0) AS total_points
FROM public.profiles p
LEFT JOIN public.user_quest_history h ON h.user_id = p.id
GROUP BY p.id, p.full_name, p.avatar_url, p.xp
ORDER BY total_points DESC;
```

#### Storage Bucket: `event_images`
Public storage bucket for uploading event promotional assets and thumbnails.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('event_images', 'event_images', true)
ON CONFLICT (id) DO NOTHING;
```

### 6.3 Automated Profile Synchronization Trigger

A PostgreSQL trigger automatically generates or updates a `profiles` row upon any user registration in Supabase Auth:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, xp)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'TITAN OPERATIVE'),
        NEW.email,
        'member',
        0
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 7. Security Architecture, RLS & Access Control

### 7.1 Row Level Security (RLS) Policies

All public tables enforce strict RLS rules:

| Table | Operation | Target Role | Policy Condition |
|---|---|---|---|
| `profiles` | `SELECT` | Public / Anon | `true` (Viewable by everyone) |
| `profiles` | `UPDATE` | Authenticated | `auth.uid() = id` (Users update own profile only) |
| `events` | `SELECT` | Public / Anon | `true` (Publicly viewable) |
| `events` | `ALL` | Authenticated | `true` (Authenticated admin management) |
| `quests` | `SELECT` | Public / Anon | `true` (Publicly viewable) |
| `quests` | `ALL` | Authenticated | `true` (Authenticated admin management) |
| `user_quest_history` | `SELECT` | Authenticated | `true` (Authenticated users view history) |
| `user_quest_history` | `INSERT` | Authenticated | `auth.uid() = user_id` (Users register self) |
| `user_quest_history` | `UPDATE` | Authenticated | `true` (Admin XP updates) |
| `feedback` | `INSERT` | Public / Anon | `true` (Anyone can submit transmissions) |
| `feedback` | `SELECT` | Authenticated | `true` (Admins inspect incoming feedback) |
| `storage.objects` | `SELECT` | Public / Anon | `bucket_id = 'event_images'` |
| `storage.objects` | `INSERT` | Authenticated | `bucket_id = 'event_images'` |

### 7.2 Administrative Privilege Elevation

Administrative privileges (`role = 'admin'`) are granted exclusively through secure server-side logic:

#### Method A: Stored Procedure (`verify_admin_code`)
Executes directly on PostgreSQL with `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION public.verify_admin_code(code text)
RETURNS jsonb AS $$
DECLARE
    current_user_id uuid;
    correct_code text := '001122'; -- Secret admin access code
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated. Please log in first.');
    END IF;

    IF trim(code) = correct_code THEN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = current_user_id;
        
        RETURN jsonb_build_object('success', true, 'message', 'Admin privileges successfully granted!');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid access code');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Method B: Deno Edge Function (`supabase/functions/grant-admin/index.ts`)
Validates caller JWT, matches input code against server secret `ADMIN_ACCESS_CODE`, and elevates user role using the Supabase Service Role client.

---

## 8. Authentication & State Management Lifecycle

### 8.1 AuthContext Architecture (`src/contexts/AuthContext.jsx`)

The authentication layer manages global user state and exposes methods through `useAuth()`:

- **State Managed**:
  - `user`: Current Supabase Auth user object (`id`, `email`, `user_metadata`).
  - `profile`: Synchronized record from `public.profiles` (`role`, `full_name`, `team`, `xp`).
  - `loading`: Boolean flag indicating initial session resolution.
- **Methods Exposed**:
  - `signIn(email, password)`: Authenticates credentials with `supabase.auth.signInWithPassword`.
  - `signUp(email, password, metadata)`: Registers operative with `supabase.auth.signUp`.
  - `signOut()`: Terminates session via `supabase.auth.signOut`.
  - `fetchProfile(userId)`: Queries and caches user profile record.
- **Session Observer**:
  - Attaches `supabase.auth.onAuthStateChange` to continuously synchronize session state and profile records across tab switches and network reconnections.

### 8.2 Route Guarding (`PrivateRoute`)

Defined in `src/App.jsx`, `<PrivateRoute />` intercepts navigation to protected routes (`/quests`, `/profile`, `/admin`):
- Displays a themed loading screen while `loading === true`.
- If `!user`, redirects to `/auth` with current location preserved in `state.from` and a descriptive notice message.
- Renders protected children once authentication is confirmed.

---

## 9. Services & Data Access Layer Reference

### 9.1 `eventService` (`src/services/eventService.js`)

| Method | Parameters | Description |
|---|---|---|
| `fetchEvents()` | — | Queries all events ordered ascending by `event_date`. |
| `insertEvent(eventData)` | `eventData: Object` | Inserts a new event record into `public.events`. |
| `updateEvent(id, eventData)` | `id: string, eventData: Object` | Updates fields on an existing event record. |
| `deleteEvent(id)` | `id: string` | Deletes an event record by UUID. |
| `uploadImage(file)` | `file: File` | Generates a unique UUID filename, uploads to `event_images` storage bucket, and returns public CDN URL. |

### 9.2 `questService` (`src/services/questService.js`)

| Method | Parameters | Description |
|---|---|---|
| `fetchActiveQuests()` | — | Queries quests where status is `'Active'` or `'Upcoming'`. |
| `fetchUserHistory(userId)` | `userId: string` | Fetches quest deployment history and nested quest details for a given user. |
| `fetchLeaderboard()` | — | Queries the top 5 operative records from `public.leaderboard`. |
| `registerForQuest(userId, questId)`| `userId: string, questId: string` | Inserts a `'participated'` status record into `public.user_quest_history`. |
| `fetchAllProfiles()` | — | Queries all registered profiles for admin telemetry. |
| `fetchAllQuestHistory()` | — | Queries global quest participation history joined with quests and profiles. |
| `insertQuest(questData)` | `questData: Object` | Inserts a new bounty record into `public.quests`. |

---

## 10. Comprehensive Page-by-Page Reference

### 10.1 `Home.jsx` (Landing Dashboard)
- **Header Section**: Features an interactive typewriter headline cycling through `"Welcome_Titans"`, `"Think"`, `"Build"`, and `"Innovate"`.
- **Live News Tickers**: Dynamically queries the latest event and quest from Supabase and presents interactive shortcut cards.
- **Pillars & Focus**: Displays interactive cards detailing technical domains.
- **Transmission Modal**: Allows operatives and visitors to transmit messages directly to the `feedback` table with live word-count validation (60 words max).

### 10.2 `About.jsx` (Club Narrative & Pillars)
- **Club Mission**: Narrative outlining the collective's goals in bridging academic foundations with industry engineering practices.
- **Domain Focus Cards**: Interactive glassmorphic breakdown of Development (Full-stack), Cybersecurity (Network analysis & ethical hacking), and IoT & Robotics (Sensors & embedded automation).

### 10.3 `Events.jsx` (Active Deployments & Registration)
- **Active Deployment Card**: Detailed highlight for flagship events (e.g. Inauguration Day & Tech Games).
- **Game Formats Grid**: Breakdowns of competitive formats (*Prompt Counter*, *Fastest Finger First*, *AI vs Human*, *Tech Pictionary*, *Generic Creation Quiz*).
- **Event Registration Form**: Collects full name, academic course, and preferred activity, redirecting unauthenticated users to `/auth` with form state preserved.

### 10.4 `Members.jsx` (Operative Directory)
- **Search & Filters**: Search operatives by name/role and filter across teams (*Core Leads*, *Development*, *Cybersecurity*, *IoT & Robotics*, *Media & Design*).
- **Member Detail Modal**: Clickable cards open an expanded modal displaying the operative's bio, skills, GitHub link, and LinkedIn profile.

### 10.5 `Quests.jsx` (Operative Bounty Board & Leaderboard)
- **Available Bounties**: Lists active challenges with difficulty badges, active week markers, reward descriptions, and XP values (base + win bonus).
- **Live Leaderboard**: Displays the top ranking operatives dynamically calculated from profile XP and quest victory points.

### 10.6 `Profile.jsx` (Operative Profile Hub)
- **Identity Header**: Displays operative avatar, full name, role badge, unique ID, total XP tally, and quests won count.
- **Quest History Feed**: Chronological log of participated, won, and lost quest deployments with color-coded status badges and XP breakdown.
- **Secure Logout**: Terminates active Supabase session.

### 10.7 `Auth.jsx` (Authentication Portal)
- **Dual Mode**: Toggles between Sign In and Member Registration.
- **State Preservation**: Detects pending event registrations passed via navigation state and automatically populates form fields.

### 10.8 `Admin.jsx` (Root Security Clearances)
- **Access Verification Gate**: Renders password-protected clearance gate requiring the secret admin access code if the user does not possess `admin` or `head` role.
- **Telemetry Console**: Real-time inspection of member records and global quest submission activity.
- **Management Forms**:
  - **Setup New Quest**: Form for configuring title, description, difficulty, base XP, and rewards.
  - **Events Management**: Form for publishing event title, schedule, status, and uploading promotional cover images to Supabase Storage.

### 10.9 `TechTitansLanding.jsx` (3D Hero Experience)
- **Interactive 3D WebGL Canvas**: Full-screen Three.js + Cannon-es rigid body physics simulation.
- **HUD Overlays**: Sound toggling, motion preference detection, status indicators, and direct navigation links to the main portal (`/home`).

---

## 11. Build Pipeline, Chunking & Performance Optimization

### 11.1 Manual Chunk Splitting (`vite.config.js`)

To ensure lightning-fast first contentful paint (FCP) and optimal caching, vendor packages are cleanly divided into isolated chunks:

```javascript
// vite.config.js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
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

### 11.2 Route-Level Code Splitting

Heavy and role-restricted routes are lazy-loaded via `React.lazy()`:

```javascript
const Admin = lazy(() => import('./pages/Admin'));
const TechTitansLanding = lazy(() => import('./pages/TechTitansLanding'));
```

### 11.3 Static Quality Assurance (Oxlint)

The codebase is linted using **Oxlint** configured in `.oxlintrc.json` to ensure clean syntax, correct React hook dependency declarations, and zero unused symbols.

---

## 12. Environment Configuration & Secrets Management

Create a `.env` file in the repository root:

```env
# Client-Side Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Node Script Configuration (Optional - for local initDB.js execution)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### 🔒 Security Rules

1. **Never prefix secrets with `VITE_`**: Any variable starting with `VITE_` is baked into the public client JavaScript bundle.
2. **Admin Access Code**: Stored as a secret on the Supabase Edge Function environment or evaluated via the `verify_admin_code` SQL procedure.
3. **Anon Key Safety**: The `VITE_SUPABASE_ANON_KEY` is public by design; all security guarantees are enforced by PostgreSQL Row Level Security (RLS).

---

## 13. Installation, Setup & Database Seeding

### 13.1 Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/techtitansweb26-main.git
cd techtitansweb26-main

# 2. Install all dependencies
npm install

# 3. Create environment configuration
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start local development server
npm run dev
```

### 13.2 Database Initialization

Execute the SQL script in [`supabase/schema.sql`](./supabase/schema.sql) inside your Supabase Dashboard SQL Editor, or run:

```bash
node scripts/initDB.js
```

---

## 14. CI/CD Automation & Deployment Guide

### 14.1 GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

The repository includes a 3-stage GitHub Actions workflow triggered on pushes to `main`/`master`:

1. **Stage 1: Lint**: Executes `npm run lint` with Oxlint.
2. **Stage 2: Build**: Runs `npm run build` to generate the production `dist/` bundle.
3. **Stage 3: Deploy**: Deploys the verified artifact directly to **GitHub Pages**.

### 14.2 SPA Route Preservation (`public/404.html`)

To prevent 404 errors when visitors refresh or directly bookmark deep routes (e.g. `/quests`, `/profile`, `/events`) on static hosts like GitHub Pages, [`public/404.html`](./public/404.html) catches missing routes and rewrites them into query parameters for `index.html` to consume and navigate client-side.

---

## 15. Troubleshooting & Operational Runbook

| Symptom | Probable Cause | Diagnostic & Resolution Steps |
|---|---|---|
| **Admin Access Code rejected** | Incorrect code entered or RPC procedure missing | Verify code (`001122` or custom secret). Ensure `verify_admin_code` RPC is executed in Supabase SQL editor. |
| **Bounties/Leaderboard empty** | Database tables uninitialized or RLS misconfigured | Run `supabase/schema.sql` in Supabase SQL editor to create `quests`, `user_quest_history`, and `leaderboard` view. |
| **Event image upload fails** | Storage bucket `event_images` missing or private | Ensure the bucket `event_images` is created in Supabase Dashboard → Storage, and marked as public. |
| **New user profile not appearing** | `on_auth_user_created` trigger not active | Execute the trigger definition in `supabase/schema.sql` to link `auth.users` to `public.profiles`. |
| **Page refresh gives 404 on GitHub Pages** | Missing `404.html` SPA redirect | Verify `public/404.html` is present in the build output (`dist/404.html`). |

---

## 16. Changelog & Architecture Evolution

### Version 2.0.0 (August 2026)
- **Refactored Routing Architecture**: Transitioned all core views (`Home`, `About`, `Events`, `Members`, `Quests`, `Profile`, `Admin`, `Auth`) to clean React Router v7 routes under `MainLayout`.
- **Integrated 3D Hero in React**: Refactored the Three.js + Cannon-es 3D simulation into `<TechTitansLanding />` (`/landing`) with complete resource disposal and motion preference handling.
- **Enhanced Security & Storage**: Added `event_images` bucket integration in `eventService.js` and server-side admin elevation via `verify_admin_code` RPC / `grant-admin` Edge Function.
- **Optimized Production Bundling**: Implemented Rolldown-compatible manual chunk splitting in `vite.config.js` and lazy-loaded heavy routes.
- **Consolidated Database Architecture**: Unified `schema.sql`, `setup.sql`, and `scripts/initDB.js` to ensure consistent data structures and RLS policies.

---

<div align="center">
  <sub>Tech Titans Engineering Documentation • Maintained by the Tech Titans Development Team</sub>
</div>
