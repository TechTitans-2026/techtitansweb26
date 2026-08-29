-- ============================================================
-- TECH TITANS — COMPLETE MASTER DATABASE SCHEMA
-- ============================================================

-- 1. Extensions
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

-- 8. Storage Bucket for Event Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event_images', 'event_images', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Automatic Profile Creation Trigger (fires on Signup & Email Confirmation)
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

-- 10. Secret Admin Code Verification Function (Promotes user to Admin with Code: 001122)
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

-- 11. Row Level Security (RLS) & Access Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public Profiles are Viewable by Everyone" ON public.profiles;
CREATE POLICY "Public Profiles are Viewable by Everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users Can Update Own Profile" ON public.profiles;
CREATE POLICY "Users Can Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events Policies
DROP POLICY IF EXISTS "Events are Viewable by Everyone" ON public.events;
CREATE POLICY "Events are Viewable by Everyone" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated Users Can Modify Events" ON public.events;
CREATE POLICY "Authenticated Users Can Modify Events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quests Policies
DROP POLICY IF EXISTS "Quests are Viewable by Everyone" ON public.quests;
CREATE POLICY "Quests are Viewable by Everyone" ON public.quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated Users Can Modify Quests" ON public.quests;
CREATE POLICY "Authenticated Users Can Modify Quests" ON public.quests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- User Quest History Policies
DROP POLICY IF EXISTS "Quest History Viewable by Authenticated" ON public.user_quest_history;
CREATE POLICY "Quest History Viewable by Authenticated" ON public.user_quest_history FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users Can Register for Quests" ON public.user_quest_history;
CREATE POLICY "Users Can Register for Quests" ON public.user_quest_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated Users Can Update History" ON public.user_quest_history;
CREATE POLICY "Authenticated Users Can Update History" ON public.user_quest_history FOR UPDATE TO authenticated USING (true);

-- Feedback Policies
DROP POLICY IF EXISTS "Anyone Can Insert Feedback" ON public.feedback;
CREATE POLICY "Anyone Can Insert Feedback" ON public.feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated Can View Feedback" ON public.feedback;
CREATE POLICY "Authenticated Can View Feedback" ON public.feedback FOR SELECT TO authenticated USING (true);

-- Storage Policies
DROP POLICY IF EXISTS "Public Access to Event Images" ON storage.objects;
CREATE POLICY "Public Access to Event Images" ON storage.objects FOR SELECT USING (bucket_id = 'event_images');

DROP POLICY IF EXISTS "Authenticated Upload to Event Images" ON storage.objects;
CREATE POLICY "Authenticated Upload to Event Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event_images');
