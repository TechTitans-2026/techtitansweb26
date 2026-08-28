-- Create ENUM types
CREATE TYPE user_role AS ENUM ('member', 'head', 'admin');
CREATE TYPE project_status AS ENUM ('current', 'past');
CREATE TYPE doc_type AS ENUM ('script', 'paper', 'doc');

-- Create PROFILES table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role DEFAULT 'member'::user_role NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  team TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create MEMBERS table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  field TEXT,
  year INT,
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create PROJECTS table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'current'::project_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create PROJECT_MEMBERS table
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, member_id)
);

-- Create DOCUMENTS table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type doc_type NOT NULL,
  content_url TEXT NOT NULL,
  restricted BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create QUESTS table
CREATE TABLE quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create USER_QUESTS table
CREATE TABLE user_quests (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, quest_id)
);

-- Create CLUB_CODES table (for registration verification via Edge Functions)
CREATE TABLE club_codes (
  code TEXT PRIMARY KEY,
  is_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create FEEDBACK table (for contact us form)
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-----------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS)
-----------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_codes ENABLE ROW LEVEL SECURITY; -- accessible only by edge functions (service_role key)

-----------------------------------------------------------
-- HELPER FUNCTIONS
-----------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-----------------------------------------------------------
-- RLS POLICIES
-----------------------------------------------------------

-- PROFILES
-- user can read/update own row; head/admin can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Heads and admins can view all profiles" ON profiles
  FOR SELECT USING (get_user_role() IN ('head', 'admin'));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- MEMBERS
-- all authenticated users can view member directory
CREATE POLICY "All authenticated users can view members" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own member profile" ON members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Heads and admins can manage members" ON members
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- PROJECTS
-- readable by all authenticated users; writable by head/admin only
CREATE POLICY "All authenticated users can view projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Heads and admins can manage projects" ON projects
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- PROJECT_MEMBERS
CREATE POLICY "All authenticated users can view project_members" ON project_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Heads and admins can manage project_members" ON project_members
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- DOCUMENTS
-- readable if restricted = false OR requester is in project_members for that project_id OR requester role is head/admin
CREATE POLICY "Users can view unrestricted documents" ON documents
  FOR SELECT USING (restricted = false);

CREATE POLICY "Heads and admins can view all documents" ON documents
  FOR SELECT USING (get_user_role() IN ('head', 'admin'));

CREATE POLICY "Project members can view restricted project documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN members m ON pm.member_id = m.id
      WHERE pm.project_id = documents.project_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Heads and admins can manage documents" ON documents
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- QUESTS
CREATE POLICY "All authenticated users can view quests" ON quests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Heads and admins can manage quests" ON quests
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- USER_QUESTS
CREATE POLICY "All authenticated users can view leaderboard (user_quests)" ON user_quests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Heads and admins can manage user_quests" ON user_quests
  FOR ALL USING (get_user_role() IN ('head', 'admin'));

-- FEEDBACK
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Heads and admins can view feedback" ON feedback
  FOR SELECT USING (get_user_role() IN ('head', 'admin'));

-----------------------------------------------------------
-- TRIGGERS
-----------------------------------------------------------

-- CRITICAL: Trigger to automatically create a profiles row when a user
-- completes Supabase Auth signup. Without this, `profiles` is NEVER
-- populated and every role/admin/directory check in the app fails silently.
-- Reads username/full_name from the metadata passed in supabase.auth.signUp()
-- options.data, and falls back to the local part of the email if missing.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  final_username := base_username;

  -- Guard against the UNIQUE constraint on username colliding
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

-- Existing trigger: automatically create a `members` row once a profile exists
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.members (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile();
