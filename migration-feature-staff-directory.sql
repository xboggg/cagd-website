-- Migration: Staff Directory
-- Run in Supabase SQL editor (db.techtrendi.com)

CREATE TABLE IF NOT EXISTS public.cagd_staff_directory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text,
  division text,
  department text,
  phone text,
  email text,
  photo text,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_staff_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_staff" ON public.cagd_staff_directory
  FOR SELECT USING (is_active = true);

CREATE POLICY "admin_all_staff" ON public.cagd_staff_directory
  USING (auth.role() = 'authenticated');
