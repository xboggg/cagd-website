-- Migration v2: Add gender, participant_type, region, department columns
-- Run this in Supabase SQL editor (db.techtrendi.com)

ALTER TABLE public.cagd_event_registrations
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS participant_type text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS department text;
