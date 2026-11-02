-- ==============================================================================
-- DIGINORON TRADE INTELLIGENCE PLATFORM - SUPABASE SQL SCHEMA
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create or Update table for public user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  referral_source TEXT,
  role TEXT DEFAULT 'trader', -- 'trader', 'analyst', 'admin'
  avatar_url TEXT,
  default_language TEXT DEFAULT 'fa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration support: If public.profiles already exists, add new columns safely:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 2. Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles RLS Policies (Safe recreate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Updated trigger to store full_name, phone, company, and referral_source upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, company, referral_source)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'company', ''),
    COALESCE(new.raw_user_meta_data->>'referral_source', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    referral_source = EXCLUDED.referral_source,
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if needed and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create table for User Saved Queries & Trade Bookmarks
CREATE TABLE IF NOT EXISTS public.saved_trade_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type_code TEXT NOT NULL,
  freq_code TEXT NOT NULL,
  cl_code TEXT NOT NULL,
  reporter_code TEXT NOT NULL,
  partner_code TEXT NOT NULL,
  period TEXT NOT NULL,
  cmd_code TEXT NOT NULL,
  flow_code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on saved queries
ALTER TABLE public.saved_trade_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own saved queries" ON public.saved_trade_queries;
CREATE POLICY "Users can manage their own saved queries" 
  ON public.saved_trade_queries FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.saved_trade_queries TO authenticated;

-- ==============================================================================
-- 7. AUTOMATED HEALTH MONITORING SYSTEM TABLES & RLS (EVERY 30 MINUTES)
-- ==============================================================================

-- A. Summary of each health monitoring execution run
CREATE TABLE IF NOT EXISTS public.health_monitor_runs (
  id TEXT PRIMARY KEY, -- Supports text ID like run_timestamp or uuid
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ,
  trigger_source TEXT DEFAULT 'manual', -- 'cron', 'manual', 'external'
  test_type TEXT DEFAULT 'basic', -- 'basic', 'functional', 'integration'
  total_tools INTEGER DEFAULT 0,
  healthy_count INTEGER DEFAULT 0,
  degraded_count INTEGER DEFAULT 0,
  unhealthy_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  run_status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed', 'skipped_locked'
  execution_duration_ms INTEGER DEFAULT 0,
  error_message TEXT
);

-- B. History of individual tool checks
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT REFERENCES public.health_monitor_runs(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'unhealthy', 'unknown'
  test_type TEXT DEFAULT 'basic', -- 'basic', 'functional', 'integration'
  response_time_ms INTEGER DEFAULT 0,
  http_status INTEGER DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- C. Incidents and degradation lifecycle tracker
CREATE TABLE IF NOT EXISTS public.health_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  incident_type TEXT NOT NULL, -- 'timeout', 'http_500', 'invalid_schema', 'missing_config', 'degraded_performance'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved'
  error_message TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 1,
  occurrences INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for maximum query performance & concurrency lock efficiency
CREATE INDEX IF NOT EXISTS idx_health_checks_tool_checked ON public.health_checks (tool_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks (status);
CREATE INDEX IF NOT EXISTS idx_health_checks_run_id ON public.health_checks (run_id);
CREATE INDEX IF NOT EXISTS idx_health_incidents_tool_status ON public.health_incidents (tool_id, status);
CREATE INDEX IF NOT EXISTS idx_health_incidents_status ON public.health_incidents (status);
CREATE INDEX IF NOT EXISTS idx_health_monitor_runs_started ON public.health_monitor_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_monitor_runs_status ON public.health_monitor_runs (run_status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.health_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Full operational access for monitoring engine and dashboard
DROP POLICY IF EXISTS "Service role has full access to health_monitor_runs" ON public.health_monitor_runs;
CREATE POLICY "Service role has full access to health_monitor_runs"
  ON public.health_monitor_runs FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to health_checks" ON public.health_checks;
CREATE POLICY "Service role has full access to health_checks"
  ON public.health_checks FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to health_incidents" ON public.health_incidents;
CREATE POLICY "Service role has full access to health_incidents"
  ON public.health_incidents FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant schema permissions
GRANT ALL ON public.health_monitor_runs TO anon, authenticated, service_role;
GRANT ALL ON public.health_checks TO anon, authenticated, service_role;
GRANT ALL ON public.health_incidents TO anon, authenticated, service_role;
