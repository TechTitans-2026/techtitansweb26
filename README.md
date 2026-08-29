# Tech Titans Official Website (`techtitansite`)

<div align="center">

![Tech Titans Shield](https://img.shields.io/badge/Tech_Titans-Digital_HQ-8B5CF6?style=for-the-badge&logo=shield&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Oxlint](https://img.shields.io/badge/Oxlint-Passing-success?style=for-the-badge&logo=oxc&logoColor=white)

<p align="center">
  <strong>The Digital Headquarters and Operative Platform for the Tech Titans Student Collective</strong><br />
  Bridging academic exploration with industry-grade software engineering, cybersecurity, data science, and robotics.
</p>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Quickstart \& Setup](#-quickstart--setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone \& Install](#1-clone--install)
  - [2. Configure Environment](#2-configure-environment)
  - [3. Database Provisioning](#3-database-provisioning)
  - [4. Run Local Development Server](#4-run-local-development-server)
- [Database Schema \& Security](#-database-schema--security)
  - [Entity Relationship Overview](#entity-relationship-overview)
  - [Row-Level Security (RLS) \& RBAC](#row-level-security-rls--rbac)
  - [Admin Privilege Elevation Protocol](#admin-privilege-elevation-protocol)
- [Application Pages \& Routing](#-application-pages--routing)
- [Available Scripts](#-available-scripts)
- [CI/CD \& Deployment](#-cicd--deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌌 Overview

The **Tech Titans Official Website** (`techtitansite`) is a high-performance, dark-themed, cyber-aesthetic single-page web application (SPA). Designed for the Tech Titans student collective, it provides an immersive digital presence combining real-time database capabilities, gamified bounties, event scheduling, dynamic member rosters, and an interactive 3D WebGL physics core simulation.

```
                  ┌──────────────────────────────────────────────┐
                  │          TECH TITANS WEB PLATFORM            │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │     Interactive 3D        │                   │     React 19 SPA Core     │
   │  WebGL Physics Landing    │                   │   Client-Side Application │
   │  (Three.js + Cannon-es)   │                   │    (React Router DOM v7)  │
   └───────────────────────────┘                   └─────────────┬─────────────┘
                                                                 │
                                         ┌───────────────────────┴───────────────────────┐
                                         ▼                                               ▼
                           ┌───────────────────────────┐                   ┌───────────────────────────┐
                           │      Supabase BaaS        │                   │     Storage & Functions   │
                           │  - PostgreSQL + RLS       │                   │  - Event Media Bucket     │
                           │  - Auth (JWT / Session)   │                   │  - Deno grant-admin API   │
                           │  - Leaderboard SQL View   │                   │  - verify_admin_code RPC  │
                           └───────────────────────────┘                   └───────────────────────────┘
```

---

## ✨ Core Features

- **🪐 3D WebGL Physics Hero (`/landing`)**:
  - Real-time simulation built with **Three.js** and **Cannon-es** physics engine.
  - Interactive "Tech Core Assembly" featuring dynamic orbital rings, floating wireframe satellites, particle stardust fields, directional lighting, and mouse-tracked camera parallax.
  - Respects user accessibility via `prefers-reduced-motion` detection.
- **⚡ Reactive Single-Page Application (`/`, `/home`, `/about`, `/events`, `/members`)**:
  - Full client-side routing powered by **React Router DOM v7**.
  - Ambient particle canvas and dynamic glowing anchors via `<BackgroundEffects />`.
  - Reusable scroll-driven entrance animations powered by custom `useRevealOnScroll` hook (`IntersectionObserver`).
  - Terminal-style typewriter hero announcements and live event/quest tickers.
- **🎯 Gamified Quest Board & Leaderboard (`/quests`)**:
  - Operative bounties categorized by difficulty (*Beginner*, *Intermediate*, *Advanced*) and active week.
  - XP payout calculation including base rewards and win bonuses.
  - Real-time global operative leaderboard aggregating XP from database views.
- **👤 Operative Profile Hub (`/profile`)**:
  - Protected operative card displaying role, Operative ID, total earned XP, and won quest statistics.
  - Synchronized personal quest deployment history feed.
- **📅 Active Deployments & Event Engine (`/events`)**:
  - Highlighting flagship events (such as Inauguration Day & Tech Games).
  - Integrated registration form that preserves state when redirecting new users through the authentication flow.
- **🛡️ Root Security Clearance / Admin Control (`/admin`)**:
  - Protected admin dashboard requiring `admin` or `head` role clearance.
  - Secure privilege elevation interface supporting both direct PostgreSQL RPC (`verify_admin_code`) and Deno Edge Function (`grant-admin`).
  - Real-time telemetry monitoring: member roster inspection and global quest activity stream.
  - Administrative creation forms for publishing new quests and scheduling events with direct cover image uploads to Supabase Storage.
- **📡 Transmission & Feedback Module**:
  - Interactive transmission modal on the Home page supporting live word-count validation (max 60 words) and direct recording to Supabase `feedback`.

---

## 🛠️ Technology Stack

| Layer | Technologies | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | [React](https://react.dev/) | `^19.2.8` | Component-based user interface architecture |
| **DOM Renderer** | [React DOM](https://react.dev/) | `^19.2.8` | React DOM hydration and lifecycle management |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^7.18.2` | Declarative client-side routing & route guards |
| **Build & Dev Tool** | [Vite](https://vite.dev/) | `^8.2.2` | Rolldown-accelerated build tool & HMR dev server |
| **Styling & CSS** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.19` | Utility-first responsive design & theme tokens |
| **PostCSS** | [PostCSS](https://postcss.org/) / [Autoprefixer](https://github.com/postcss/autoprefixer) | `^8.5.26` / `^10.5.4` | CSS transformation and vendor prefixing |
| **3D Graphics Engine** | [Three.js](https://threejs.org/) | `^0.185.1` | WebGL scene graph, camera, lighting, and meshes |
| **Physics Simulation** | [Cannon-es](https://pmndrs.github.io/cannon-es/) | `^0.20.0` | Rigid body physics simulation for 3D hero scene |
| **Icons** | [Lucide React](https://lucide.dev/) / FontAwesome | `^1.34.0` / `6.4.0` | High-fidelity vector iconography |
| **Backend & Auth** | [@supabase/supabase-js](https://supabase.com/) | `^2.112.4` | PostgreSQL database, JWT authentication, & Storage |
| **Database Driver** | [pg](https://node-postgres.com/) | `^8.23.0` | Node PostgreSQL client for database seeding scripts |
| **Linter & Code Quality**| [Oxlint](https://oxc.rs/) | `^1.79.0` | High-speed Rust-based JavaScript/React linter |

---

## 📁 Repository Structure

```
techtitansweb26-main/
├── 📁 .github/
│   └── workflows/
│       └── ci-cd.yml             # 3-Stage CI/CD: Oxlint ➔ Vite Build ➔ GitHub Pages Deploy
├── 📁 .vscode/                   # Recommended workspace settings & file nesting rules
│   ├── extensions.json
│   └── settings.json
├── 📁 docs/                      # In-depth architectural & technical documentation
│   └── TECH_TITANS_DOCUMENTATION.md
├── 📁 public/                    # Static root assets
│   ├── 404.html                  # SPA route preservation fallback for static hosts
│   ├── favicon.svg               # Web browser tab icon
│   ├── icons.svg                 # SVG sprite symbol dictionary
│   └── logo.jpg                  # Official Tech Titans club logo
├── 📁 scripts/                   # Database operations & bootstrap seeders
│   └── initDB.js                 # Automated PostgreSQL / Supabase table initialiser
├── 📁 src/                       # Application source code
│   ├── 📁 assets/                # Static image assets
│   ├── 📁 components/            # Reusable UI & ambient background components
│   │   ├── BackgroundEffects.jsx # Particle grid & ambient glow anchor effects
│   │   └── Navbar.jsx            # Sticky responsive navigation bar with auth triggers
│   ├── 📁 contexts/              # Global state management
│   │   ├── AuthContext.jsx       # Supabase auth session & profile synchronization
│   │   └── AuthContextDefinition.js # Context definitions
│   ├── 📁 data/                  # Static roster and reference data
│   │   └── members.js            # Initial club operative directory data
│   ├── 📁 hooks/                 # Reusable custom React hooks
│   │   ├── useAuth.js            # Hook exposing user credentials and auth methods
│   │   └── useRevealOnScroll.js  # IntersectionObserver hook for reveal animations
│   ├── 📁 lib/                   # Third-party client singletons
│   │   └── supabase.js           # Supabase client instantiation
│   ├── 📁 pages/                 # Routed page views & page-scoped stylesheets
│   │   ├── About.jsx             # Club vision, mission, and technical pillars
│   │   ├── Admin.jsx             # Root security admin dashboard & management forms
│   │   ├── Auth.jsx              # Sign-in & member registration portal
│   │   ├── Events.jsx            # Active deployments & event registration
│   │   ├── Home.css              # Cyber-theme styling, glassmorphism, animations
│   │   ├── Home.jsx              # Main dashboard with live tickers & contact modal
│   │   ├── Members.jsx           # Filterable member roster & detail modals
│   │   ├── Profile.jsx           # Operative profile hub & personal quest logs
│   │   ├── Quests.jsx            # Gamified bounty board & global leaderboard
│   │   ├── TechTitansLanding.css # 3D landing page styling & overlay controls
│   │   └── TechTitansLanding.jsx # Full-screen 3D Three.js + Cannon-es physics scene
│   ├── 📁 services/              # API and data querying services
│   │   ├── eventService.js       # Event CRUD operations & storage image upload
│   │   └── questService.js       # Quest, history, leaderboard, & profile queries
│   ├── App.css                   # Global reset, scrollbars, and keycap utilities
│   ├── App.jsx                   # Root application router and route guards
│   ├── index.css                 # Tailwind layers and font definitions
│   └── main.jsx                  # React application hydration entry point
├── 📁 supabase/                  # Database definitions, migrations & edge functions
│   ├── 📁 functions/
│   │   └── 📁 grant-admin/
│   │       └── index.ts          # Deno Edge Function for secure admin promotion
│   ├── 📁 migrations/            # Incremental schema migrations
│   │   ├── migration_2026_08_28.sql
│   │   └── migration_pivot.sql
│   ├── schema.sql                # Complete master database schema with RLS policies
│   └── setup.sql                 # Database setup and bootstrap script
├── .env.example                  # Environment variables template
├── .gitignore                    # Git exclusions
├── .oxlintrc.json                # Oxlint linter rules
├── index.html                    # Single-page HTML entry point with font preconnects
├── LICENSE                       # MIT License
├── package.json                  # Dependencies & npm scripts
├── postcss.config.js             # PostCSS plugin configurations
├── README.md                     # Project overview and quickstart guide
├── tailwind.config.js            # Tailwind theme tokens, colors, & typography
└── vite.config.js                # Vite build config with manual chunk splitting
```

---

## 🚀 Quickstart & Setup

### Prerequisites

- **Node.js**: `≥ 18.x` (v20 recommended)
- **npm**: `≥ 9.x`
- **Supabase Account**: A free or paid Supabase project with PostgreSQL access

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/techtitansweb26-main.git
cd techtitansweb26-main

# Install dependencies
npm install
```

---

### 2. Configure Environment

Create a `.env` file in the root directory by copying the sample template:

```bash
cp .env.example .env
```

Populate the `.env` file with your project's credentials:

```env
# Required for client-side Supabase connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Optional: Only needed if running the local initDB.js script
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres
```

> ⚠️ **Security Notice:**  
> Never prefix sensitive admin keys or passwords with `VITE_`. In accordance with security best practices, the admin elevation code is validated server-side via the `verify_admin_code` SQL procedure or stored as a Supabase Edge Function secret:
> ```bash
> supabase secrets set ADMIN_ACCESS_CODE=your-secret-code
> ```

---

### 3. Database Provisioning

You can initialize the Supabase database using either of the following approaches:

#### Option A: Supabase SQL Editor (Recommended)
1. Open your [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to the **SQL Editor**.
3. Copy and execute the contents of [`supabase/schema.sql`](./supabase/schema.sql) (or [`supabase/setup.sql`](./supabase/setup.sql)).

#### Option B: Automated Seeder Script
If you have configured `SUPABASE_DB_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`:
```bash
node scripts/initDB.js
```

---

### 4. Run Local Development Server

```bash
npm run dev
```

The application will start locally at **`http://localhost:5173/`**.

---

## 🔒 Database Schema & Security

### Entity Relationship Overview

The platform uses a PostgreSQL relational database with the following core entities:

```
 ┌──────────────────────┐            ┌──────────────────────────┐
 │     auth.users       │            │         feedback         │
 └──────────┬───────────┘            ├──────────────────────────┤
            │ (1:1 Trigger)          │ id: UUID (PK)            │
            ▼                        │ name: TEXT               │
 ┌──────────────────────┐            │ email: TEXT              │
 │   public.profiles    │            │ message: TEXT            │
 ├──────────────────────┤            │ created_at: TIMESTAMPTZ  │
 │ id: UUID (PK, FK)    │            └──────────────────────────┘
 │ username: TEXT (UQ)  │
 │ full_name: TEXT      │            ┌──────────────────────────┐
 │ email: TEXT          │            │          events          │
 │ avatar_url: TEXT     │            ├──────────────────────────┤
 │ team: TEXT           │            │ id: UUID (PK)            │
 │ role: TEXT (Enum)    │            │ title: TEXT              │
 │ xp: INTEGER          │            │ description: TEXT        │
 │ created_at: TIMESTAMPTZ           │ event_date: TIMESTAMPTZ  │
 └──────────┬───────────┘            │ status: TEXT             │
            │                        │ image_url: TEXT          │
            │ 1:N                    │ created_at: TIMESTAMPTZ  │
            ▼                        └──────────────────────────┘
 ┌──────────────────────────────┐
 │     user_quest_history       │    ┌──────────────────────────┐
 ├──────────────────────────────┤    │          quests          │
 │ id: UUID (PK)                │    ├──────────────────────────┤
 │ user_id: UUID (FK)           │◄───┤ id: UUID (PK)            │
 │ quest_id: UUID (FK)          │N:1 │ title: TEXT              │
 │ status: TEXT (participated,  │    │ description: TEXT        │
 │               won, lost)     │    │ base_xp: INTEGER         │
 │ xp_awarded: INTEGER          │    │ bonus_xp: INTEGER        │
 │ created_at: TIMESTAMPTZ      │    │ rewards: TEXT            │
 └──────────────┬───────────────┘    │ active_week: INTEGER     │
                │                    │ difficulty: TEXT         │
                ▼                    │ status: TEXT             │
 ┌──────────────────────────────┐    │ created_at: TIMESTAMPTZ  │
 │       VIEW: leaderboard      │    └──────────────────────────┘
 ├──────────────────────────────┤
 │ id, full_name, avatar_url,   │
 │ total_points (= xp + sum_xp) │
 └──────────────────────────────┘
```

---

### Row-Level Security (RLS) & RBAC

Every table enforces Row-Level Security:
- **`profiles`**: Public read access; users can only update their own profile row.
- **`events`**: Public read access; creation, modification, and deletion require authenticated admin credentials.
- **`quests`**: Public read access for active/upcoming bounties; mutations restricted to administrators.
- **`user_quest_history`**: Authenticated users can register for quests and view history; status and XP awards managed by administrators.
- **`feedback`**: Public write (anyone can transmit transmissions); read access restricted to authenticated administrators.
- **Storage Bucket (`event_images`)**: Public read; authenticated write.

---

### Admin Privilege Elevation Protocol

To maintain high security without exposing secrets in frontend bundles:
1. Authenticated users navigate to `/admin`.
2. The user enters the secret administrative access code.
3. The application executes the PostgreSQL `verify_admin_code(code text)` procedure (`SECURITY DEFINER`), or falls back to the `grant-admin` Supabase Edge Function.
4. Upon successful validation, the user's role is updated to `'admin'`, unlocking administrative operations.

---

## 🗺️ Application Pages & Routing

| Route | Component | Access Level | Description |
|---|---|---|---|
| `/` or `/home` | `Home.jsx` | Public | Main landing portal, typewriter headline, live news tickers, core focus areas, and transmission contact modal. |
| `/landing` | `TechTitansLanding.jsx` | Public | Full-screen interactive 3D WebGL physics simulation with camera controls, lighting, and entry links. |
| `/about` | `About.jsx` | Public | Comprehensive club overview, mission statement, and domain breakdown (Development, Cybersecurity, IoT/Robotics). |
| `/events` | `Events.jsx` | Public | Deployment schedule, game format breakdowns, and event registration form with automatic auth redirect preserving form data. |
| `/members` | `Members.jsx` | Public | Searchable and filterable directory of club operatives categorized by team, featuring detailed member modals. |
| `/quests` | `Quests.jsx` | Authenticated (`PrivateRoute`) | Operative bounty board displaying active challenges, difficulty indicators, XP rewards, and live global leaderboard. |
| `/profile` | `Profile.jsx` | Authenticated (`PrivateRoute`) | Operative profile card, total accumulated XP, quests won counter, and chronological quest deployment history. |
| `/auth` | `Auth.jsx` | Public | Unified sign-in and member registration portal supporting state preservation from event registrations. |
| `/admin` | `Admin.jsx` | Authenticated + Root (`PrivateRoute`) | Lazy-loaded root clearance console for member telemetry, global activity tracking, quest publishing, and event management. |

---

## 📜 Available Scripts

In the project directory, you can run:

```bash
# Start Vite development server with Hot Module Replacement (HMR)
npm run dev

# Run fast Rust-based Oxlint code quality checks
npm run lint

# Compile production-ready bundle to dist/
npm run build

# Preview the local production build
npm run preview
```

---

## 🚀 CI/CD & Deployment

### GitHub Actions Pipeline (`.github/workflows/ci-cd.yml`)

The repository includes a comprehensive 3-stage automated pipeline:
1. **Lint**: Validates codebase against `oxlint`.
2. **Build**: Executes `vite build` with manual chunk splitting.
3. **Deploy**: Automatically deploys the production `dist/` bundle to **GitHub Pages** on commits to `main`/`master`.

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────────┐
│ 1. Oxlint    │ ──▶ │ 2. Build     │ ──▶ │ 3. GitHub Pages       │
│    Linting   │     │    Artifacts │     │    Production Deploy  │
└──────────────┘     └──────────────┘     └───────────────────────┘
```

### Static Hosting Routing (SPA 404 Fallback)
For single-page routing on GitHub Pages or custom static hosting, [`public/404.html`](./public/404.html) ensures that direct navigation to subpaths (e.g. `/events`, `/quests`) is gracefully redirected to the client-side router without server 404 errors.

---

## 📖 Documentation

For full architectural deep-dives, entity models, API references, performance optimization blueprints, and component lifecycle details, see:
- 📘 [**Tech Titans Complete Technical Documentation** (`docs/TECH_TITANS_DOCUMENTATION.md`)](./docs/TECH_TITANS_DOCUMENTATION.md)

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m "feat: implement amazing feature"`.
4. Verify code quality: `npm run lint` and `npm run build`.
5. Push to the branch: `git push origin feature/amazing-feature`.
6. Open a Pull Request.

---

## 📄 License

This project is open source and available under the terms of the [MIT License](./LICENSE).

<div align="center">
  <sub>Built with 💜 by the Tech Titans Development Team</sub>
</div>
