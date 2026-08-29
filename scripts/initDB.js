import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. Skipping database initialization.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function initDB() {
  console.log("Initializing database...");
  
  if (!SUPABASE_DB_URL) {
    console.warn("⚠️ SUPABASE_DB_URL is missing in .env. Run supabase/setup.sql manually in Supabase Dashboard.");
  } else {
    const { Client } = pg;
    const client = new Client({ connectionString: SUPABASE_DB_URL });
    try {
      await client.connect();
      console.log("Connected to PostgreSQL for schema initialization.");

      const schemaSQL = `
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

        CREATE TABLE IF NOT EXISTS public.events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          event_date TIMESTAMPTZ,
          status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming' NOT NULL,
          image_url TEXT,
          created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
        );

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

        CREATE TABLE IF NOT EXISTS public.user_quest_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
          status TEXT CHECK (status IN ('participated', 'won', 'lost')) DEFAULT 'participated' NOT NULL,
          xp_awarded INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id, quest_id)
        );

        CREATE TABLE IF NOT EXISTS public.feedback (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
        );

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
      `;

      await client.query(schemaSQL);
      console.log("✅ Database schema initialized successfully.");
    } catch (err) {
      console.error("❌ Error initializing schema via pg:", err);
    } finally {
      await client.end();
    }
  }

  // Seed Quests Data if table is empty
  console.log("Checking for seed data...");
  const { data: existingQuests, error: fetchError } = await supabase.from('quests').select('id').limit(1);
  
  if (fetchError) {
    if (fetchError.code === '42P01') {
      console.warn("⚠️ Quests table does not exist. Run supabase/setup.sql in Supabase Dashboard.");
    } else {
      console.error("Error fetching quests:", fetchError);
    }
  } else if (existingQuests && existingQuests.length === 0) {
    console.log("No quests found. Seeding initial quests...");
    
    const questsToInsert = [
      {
        title: "Intro to React",
        description: "Build a simple counter application using React hooks.",
        base_xp: 50,
        bonus_xp: 50,
        rewards: "Digital Certificate",
        active_week: 1,
        difficulty: "Beginner",
        status: "Active"
      },
      {
        title: "API Integration",
        description: "Fetch and display data from a public API.",
        base_xp: 75,
        bonus_xp: 75,
        rewards: "Digital Certificate",
        active_week: 1,
        difficulty: "Intermediate",
        status: "Active"
      },
      {
        title: "Cyber Capture the Flag",
        description: "Find the hidden vulnerability in the provided smart contract.",
        base_xp: 150,
        bonus_xp: 150,
        rewards: "Exclusive Badge, Merch",
        active_week: 1,
        difficulty: "Advanced",
        status: "Upcoming"
      },
      {
        title: "UI/UX Redesign",
        description: "Redesign the club's landing page using Figma.",
        base_xp: 100,
        bonus_xp: 100,
        rewards: "Exclusive Badge, Merch",
        active_week: 1,
        difficulty: "Intermediate",
        status: "Active"
      }
    ];

    const { error: insertError } = await supabase.from('quests').insert(questsToInsert);
    if (insertError) {
      console.error("❌ Failed to seed quests:", insertError);
    } else {
      console.log("✅ Seeded initial quests successfully.");
    }
  } else {
    console.log("✅ Data already seeded.");
  }
}

initDB().catch(console.error);
