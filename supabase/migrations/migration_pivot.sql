-- Migration: Pivot to Master Admin Model
-- This script updates RLS policies for public access and creates the new events infrastructure.

-- 1. Enable public read access for existing tables
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

-- Projects
DROP POLICY IF EXISTS "Projects are viewable by everyone." ON public.projects;
CREATE POLICY "Projects are viewable by everyone." ON public.projects FOR SELECT USING (true);

-- Quests
DROP POLICY IF EXISTS "Quests are viewable by everyone." ON public.quests;
CREATE POLICY "Quests are viewable by everyone." ON public.quests FOR SELECT USING (true);

-- 2. Allow anonymous submissions to feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- 3. Create Events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    status TEXT DEFAULT 'upcoming',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events RLS: Public read
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

-- Events RLS: Admin write
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Create event_images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('event_images', 'event_images', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket Policies
CREATE POLICY "Event images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'event_images');

CREATE POLICY "Admins can upload event images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event_images' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can delete event images" ON storage.objects FOR DELETE USING (
  bucket_id = 'event_images' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
