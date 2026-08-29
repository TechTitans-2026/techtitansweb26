-- ============================================================
-- TECH TITANS — CONSOLIDATED MASTER DATABASE SETUP
-- ============================================================
-- Run this in the Supabase SQL Editor to initialize all tables,
-- RLS security policies, storage buckets, views, and auth triggers.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users may update their basic profile fields (name, avatar, team), but NOT self-escalate role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Ensure role is not altered by regular user updates (role changes require service_role / grant-admin Edge function)
        role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

-- 3. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

-- 4. Quests (Bounties) Table
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

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quests are viewable by everyone" ON public.quests;
CREATE POLICY "Quests are viewable by everyone" ON public.quests
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage quests" ON public.quests;
CREATE POLICY "Admins can manage quests" ON public.quests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

-- 5. User Quest History Table
CREATE TABLE IF NOT EXISTS public.user_quest_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('participated', 'won', 'lost')) DEFAULT 'participated' NOT NULL,
    xp_awarded INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, quest_id)
);

ALTER TABLE public.user_quest_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quest history" ON public.user_quest_history;
CREATE POLICY "Users can view own quest history" ON public.user_quest_history
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

DROP POLICY IF EXISTS "Users can register for quests" ON public.user_quest_history;
CREATE POLICY "Users can register for quests" ON public.user_quest_history
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        status = 'participated' AND
        xp_awarded = 0
    );

DROP POLICY IF EXISTS "Admins can manage quest history" ON public.user_quest_history;
CREATE POLICY "Admins can manage quest history" ON public.user_quest_history
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

-- 6. Leaderboard View
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

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;
CREATE POLICY "Admins can view feedback" ON public.feedback
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

-- 8. Storage: event_images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event_images', 'event_images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
CREATE POLICY "Event images are publicly accessible" ON storage.objects 
    FOR SELECT USING (bucket_id = 'event_images');

DROP POLICY IF EXISTS "Admins can upload event images" ON storage.objects;
CREATE POLICY "Admins can upload event images" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'event_images' AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

DROP POLICY IF EXISTS "Admins can delete event images" ON storage.objects;
CREATE POLICY "Admins can delete event images" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'event_images' AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'head'))
    );

-- 9. Trigger: Automatically Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, email, role, xp)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', base_username),
    NEW.email,
    'member',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();
