-- Migration: Event Feedback & Ratings
-- Run in Supabase SQL editor (db.techtrendi.com)

CREATE TABLE IF NOT EXISTS public.cagd_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text DEFAULT 'event' CHECK (type IN ('event', 'general')),
  event_id uuid REFERENCES public.cagd_events(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text,
  name text,
  email text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_feedback" ON public.cagd_feedback
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_select_feedback" ON public.cagd_feedback
  FOR SELECT USING (auth.role() = 'authenticated');
