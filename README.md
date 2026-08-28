# Tech Titans Official Website

Welcome to the official repository for the **Tech Titans Official Website**. This project serves as the digital headquarters for the Tech Titans student collective, built with a modern dual-architecture approach combining a vanilla HTML/JS 3D physics landing page with a robust React Single-Page Application (SPA).

## Project Overview

The website is designed to provide a highly interactive, performance-conscious, and premium user experience:
1. **3D Physics Landing Page (`index.html`)**: The initial entry point. It features an interactive "Tech Core Assembly" scene powered by Three.js and Cannon.js. When the user clicks "Enter Home Page," the 3D scene gracefully tears down, and the React application takes over.
2. **React SPA (`src/App.jsx`)**: The core application built with React, Vite, and Tailwind CSS. It handles all routing, data rendering, authentication, and administrative functions.

## Page Architecture & Planned Connections

Below is a detailed breakdown of every page within the React application, its current content, and how it connects (or is planned to connect) to the Supabase backend. This serves as a blueprint for upcoming integration phases.

### 1. Home Page (`src/pages/Home.jsx`)
- **Content:** The main dashboard featuring a stylized hero section (`titans_init.py` terminal typing effect), a "Project Highlight" showcase, and a footer with a "Contact Us" form.
- **Connections:** 
  - The "Contact Us" feedback form currently writes directly to the Supabase `feedback` table. This is active and working.
  - *Planned:* Dynamic project highlights could eventually be pulled from the `projects` table.

### 2. About Us (`src/pages/About.jsx`)
- **Content:** Information about the Tech Titans club, its mission ("Our Story & Purpose"), and details regarding the specific specialized domains (Development, Cybersecurity, IoT & Robotics, AI & Data).
- **Connections:** Primarily static content. No database connections planned.

### 3. Events (`src/pages/Events.jsx`)
- **Content:** Dedicated to event promotion and management. Currently highlights the "Inauguration Day & Tech Games", lists various game formats, and provides an event registration form. Also includes an "Archived Events" section.
- **Connections:** 
  - *Planned:* The event registration form currently redirects to authentication. It should eventually connect to an `event_registrations` table or similar backend logic to track participants.
  - *Planned:* Event details should be pulled dynamically from an `events` table rather than being hardcoded.

### 4. Members / The Roster (`src/pages/Members.jsx` & `MemberDetail.jsx`)
- **Content:** A directory of all official club members grouped by their specialized domains (Core Leadership, Development, Media, etc.). Clicking a member opens a detailed modal profile (`MemberDetail.jsx`) showing their bio, course, year, and social links.
- **Connections:**
  - *Current Status:* Uses static mock data imported from `src/data/members.js`.
  - *Planned Integration (Phase 2):* Will be migrated to fetch live data from the Supabase `profiles` table using `@tanstack/react-query`. Member avatars will also be wired up to Supabase Storage (`avatars` bucket).

### 5. Quest Board (`src/pages/Quests.jsx`)
- **Content:** A gamified challenge area where members can view active technical bounties/quests and a leaderboard ranking top contributors.
- **Connections:**
  - *Current Status:* Uses static mock data imported from `src/data/quests.js`.
  - *Planned Integration (Phase 2):* Will fetch live challenges from the Supabase `quests` table and live rankings from the `leaderboard` table.

### 6. Authentication Portal (`src/pages/Auth.jsx`) 🔒 FROZEN
- **Content:** The login and registration forms for club members.
- **Connections:**
  - Integrates heavily with `AuthContext.jsx` and Supabase Auth.
  - Requires a specific "Club Code" for registration, which is verified via a Supabase Edge Function (`verify-club-code`).
  - *Note:* This section is currently **FROZEN** for launch and should not be modified to ensure stability during the security review.

### 7. Admin Dashboard (`src/pages/Admin.jsx`)
- **Content:** A restricted-access portal for users with `admin` or `head` roles to manage internal club operations.
- **Connections:**
  - Connects to the Supabase `projects` table (to manage ongoing project statuses) and the `documents` table (for secure, classified club files).

## Database Schema (Supabase)
The application relies on PostgreSQL via Supabase. The core tables include:
- `profiles`: Stores extended user data (role, team, bio, avatar) and links directly to Supabase Auth (`auth.users`).
- `feedback`: Stores submissions from the Home page contact form.
- `projects` & `documents`: Used by the Admin dashboard for club management.
- `quests` & `leaderboard`: To be implemented for the gamified quest system.

## Current Project Status
- **Phase 1 (Pre-Launch Cleanup):** Complete. The monolithic component structure has been refactored, routing is standardized via React Router, and the 3D landing page memory leak has been resolved.
- **Phase 2 (Database Integrations):** Pending. The next step is to create the SQL migration scripts, seed the database, and connect the `Members.jsx` and `Quests.jsx` pages to live Supabase data.

## Setup & Installation

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x or yarn ≥ 1.22
- Git
- A Supabase project

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tech-titans-website.git
   cd tech-titans-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ADMIN_ACCESS_CODE=your_admin_access_code_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run Oxlint
>>>>>>> ffe24b0 (feat: initial commit with techtitansite code)
