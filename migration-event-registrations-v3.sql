-- Migration v3: Add phone uniqueness constraint per event
-- Run this in Supabase SQL editor (db.techtrendi.com)

ALTER TABLE public.cagd_event_registrations
  ADD CONSTRAINT cagd_regs_event_phone_unique UNIQUE (event_id, phone);
