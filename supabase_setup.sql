-- ==========================================
-- TECH TITANS SUPABASE SETUP SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor.
-- This sets up your profiles, quests, and user history tables.

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Allow users to update their own profile (crucial for the access code feature)
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, xp)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'member', 
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Quests (Bounties) Table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    base_xp INTEGER DEFAULT 100 NOT NULL,
    status TEXT DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests viewable by everyone" ON public.quests FOR SELECT USING (true);
-- Admins can insert/update quests (Assuming role check, but for simplicity here we allow auth users)
CREATE POLICY "Auth users can insert quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update quests" ON public.quests FOR UPDATE USING (auth.uid() IS NOT NULL);


-- 4. Create User Quest History (Participation) Table
CREATE TABLE IF NOT EXISTS public.user_quest_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'participated' NOT NULL, -- 'participated', 'won', 'lost'
    xp_awarded INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_quest_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History viewable by everyone" ON public.user_quest_history FOR SELECT USING (true);
CREATE POLICY "Users can insert own history" ON public.user_quest_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.user_quest_history FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create Leaderboard View (Optional but useful)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT p.id, p.full_name, p.avatar_url, p.xp as total_points
FROM public.profiles p
ORDER BY p.xp DESC;
