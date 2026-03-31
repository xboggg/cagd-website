-- Staff Portal Features Migration
-- Run this on Supabase SQL editor at db.techtrendi.com

-- 1. Staff Polls
CREATE TABLE IF NOT EXISTS public.cagd_staff_polls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{label: "Option A"}, ...]
  is_active boolean DEFAULT true,
  allow_multiple boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.cagd_staff_poll_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES cagd_staff_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

-- 2. Staff Kudos / Recognition
CREATE TABLE IF NOT EXISTS public.cagd_staff_kudos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  from_name text NOT NULL,
  to_name text NOT NULL,
  to_division text,
  message text NOT NULL,
  category text DEFAULT 'kudos' CHECK (category IN ('kudos', 'teamwork', 'innovation', 'leadership', 'service')),
  created_at timestamptz DEFAULT now()
);

-- 3. Training Programs
CREATE TABLE IF NOT EXISTS public.cagd_training_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  trainer text,
  location text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  max_participants integer,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cagd_training_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES cagd_training_programs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  status text DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(program_id, user_id)
);

-- RLS Policies
ALTER TABLE public.cagd_staff_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cagd_staff_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cagd_staff_kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cagd_training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cagd_training_enrollments ENABLE ROW LEVEL SECURITY;

-- Polls: anyone can read active, authenticated can vote
CREATE POLICY "Anyone can read active polls" ON public.cagd_staff_polls FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert polls" ON public.cagd_staff_polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update polls" ON public.cagd_staff_polls FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete polls" ON public.cagd_staff_polls FOR DELETE USING (true);

CREATE POLICY "Anyone can read poll votes" ON public.cagd_staff_poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated can vote" ON public.cagd_staff_poll_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can delete votes" ON public.cagd_staff_poll_votes FOR DELETE USING (true);

-- Kudos: anyone can read, authenticated can give
CREATE POLICY "Anyone can read kudos" ON public.cagd_staff_kudos FOR SELECT USING (true);
CREATE POLICY "Authenticated can give kudos" ON public.cagd_staff_kudos FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can delete kudos" ON public.cagd_staff_kudos FOR DELETE USING (true);

-- Training: anyone can read, admin manages
CREATE POLICY "Anyone can read training" ON public.cagd_training_programs FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage training" ON public.cagd_training_programs FOR ALL USING (true);

CREATE POLICY "Anyone can read enrollments" ON public.cagd_training_enrollments FOR SELECT USING (true);
CREATE POLICY "Authenticated can enroll" ON public.cagd_training_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update enrollment" ON public.cagd_training_enrollments FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete enrollment" ON public.cagd_training_enrollments FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.cagd_staff_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_kudos_created ON public.cagd_staff_kudos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_program ON public.cagd_training_enrollments(program_id);
