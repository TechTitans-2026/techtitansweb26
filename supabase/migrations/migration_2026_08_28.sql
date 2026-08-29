-- ============================================================
-- Tech Titans — Pre-launch migration
-- Safe to run on the EXISTING live database. Run this in the
-- Supabase Dashboard SQL Editor. It only adds what's missing —
-- it does not drop or alter existing data.
-- ============================================================

-- 1. Add columns the frontend reads but the original schema never defined
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. THE CRITICAL FIX: create profiles automatically on signup.
-- Without this, registering a user never creates a profiles row,
-- so every role check / admin check / directory listing silently fails.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  -- If a profile row already exists for this id (e.g. re-run), skip.
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- 3. Backfill: any account that already registered before this fix
-- existed has NO profiles row and is currently broken (can't log in
-- properly, admin checks fail). This creates profiles for them
-- retroactively so existing test accounts aren't stuck.
INSERT INTO public.profiles (id, username, full_name, email, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)) || '_' || substr(u.id::text, 1, 4),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.email,
  'member'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 4. Sanity check — run this after and confirm every auth user has a profile
-- SELECT count(*) FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL;
-- (should return 0)
