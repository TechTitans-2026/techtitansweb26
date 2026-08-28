import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL; // Required for DDL

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. Skipping database initialization.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function initDB() {
  console.log("Initializing database...");
  
  if (!SUPABASE_DB_URL) {
    console.warn("⚠️ SUPABASE_DB_URL is missing in .env. We cannot run DDL (CREATE TABLE) commands via the standard REST API.");
    console.warn("Please add SUPABASE_DB_URL (the Postgres connection string) to your .env file to enable self-creating tables.");
    console.warn("Alternatively, run the SQL manually in your Supabase dashboard.");
    
    // We can at least try to seed quests if they don't exist, assuming tables are there.
  } else {
    const { Client } = pg;
    const client = new Client({ connectionString: SUPABASE_DB_URL });
    try {
      await client.connect();
      console.log("Connected to PostgreSQL for schema initialization.");

      const schemaSQL = `
        -- 1. Create quests table
        CREATE TABLE IF NOT EXISTS public.quests (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          title text NOT NULL,
          description text,
          base_xp integer DEFAULT 0,
          bonus_xp integer DEFAULT 0,
          rewards text,
          active_week integer DEFAULT 1,
          difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard', 'Beginner', 'Intermediate', 'Advanced')) DEFAULT 'medium',
          status text CHECK (status IN ('Active', 'Upcoming', 'Closed')) DEFAULT 'Active',
          created_at timestamptz DEFAULT now()
        );

        -- 2. Create user_quest_history table
        CREATE TABLE IF NOT EXISTS public.user_quest_history (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES auth.users ON DELETE CASCADE,
          quest_id uuid REFERENCES public.quests ON DELETE CASCADE,
          status text CHECK (status IN ('participated', 'won', 'lost')) DEFAULT 'participated',
          xp_awarded integer DEFAULT 0,
          created_at timestamptz DEFAULT now(),
          UNIQUE(user_id, quest_id)
        );

        -- 3. Create leaderboard table
        CREATE TABLE IF NOT EXISTS public.leaderboard (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
          total_points integer DEFAULT 0,
          updated_at timestamptz DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_quest_history ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for quests (Read-only for all)
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Quests are viewable by everyone'
            ) THEN
                CREATE POLICY "Quests are viewable by everyone" ON public.quests FOR SELECT USING (true);
            END IF;
        END $$;

        -- RLS Policies for user_quest_history (Users can only see/insert their own)
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'user_quest_history' AND policyname = 'Users can view their own history'
            ) THEN
                CREATE POLICY "Users can view their own history" ON public.user_quest_history FOR SELECT USING (auth.uid() = user_id);
                CREATE POLICY "Users can insert their own history" ON public.user_quest_history FOR INSERT WITH CHECK (auth.uid() = user_id);
                CREATE POLICY "Users can update their own history" ON public.user_quest_history FOR UPDATE USING (auth.uid() = user_id);
            END IF;
        END $$;

        -- RLS Policies for leaderboard (Viewable by everyone)
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'Leaderboard viewable by everyone'
            ) THEN
                CREATE POLICY "Leaderboard viewable by everyone" ON public.leaderboard FOR SELECT USING (true);
            END IF;
        END $$;
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
      console.warn("⚠️ Quests table does not exist. Ensure SUPABASE_DB_URL is set or manually create tables.");
    } else {
      console.error("Error fetching quests:", fetchError);
    }
  } else if (existingQuests && existingQuests.length === 0) {
    console.log("No quests found. Seeding initial quests...");
    
    // We will simulate the static data here, or read it if we can.
    // Instead of importing, we'll just hardcode the seed data from what we know to avoid module import issues.
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
    console.log("✅ Data already seeded. Bypassing initialization.");
  }
}

initDB().catch(console.error);
