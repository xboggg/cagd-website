-- ============================================================
-- CAGD Event Registrations Table
-- Follows the same conventions as supabase/migrations/20260220100000_cagd_fresh_install.sql
-- Safe to run multiple times (all statements use IF NOT EXISTS)
-- Run this in Supabase SQL editor at https://db.techtrendi.com
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cagd_event_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.cagd_events(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  organization  text,
  notes         text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate registrations (same email per event)
CREATE UNIQUE INDEX IF NOT EXISTS cagd_event_registrations_unique_email
  ON public.cagd_event_registrations (event_id, lower(email));

-- Index for fast per-event lookups
CREATE INDEX IF NOT EXISTS cagd_event_registrations_event_id_idx
  ON public.cagd_event_registrations (event_id);

-- RLS — same pattern as cagd_contact_messages in the existing migration
ALTER TABLE public.cagd_event_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or logged-in) can register
CREATE POLICY "cagd_public_insert_event_registration"
  ON public.cagd_event_registrations
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view registrations
CREATE POLICY "cagd_admin_read_event_registrations"
  ON public.cagd_event_registrations
  FOR SELECT
  TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));

-- Only admins can update status
CREATE POLICY "cagd_admin_update_event_registrations"
  ON public.cagd_event_registrations
  FOR UPDATE
  TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));

-- Only admins can delete
CREATE POLICY "cagd_admin_delete_event_registrations"
  ON public.cagd_event_registrations
  FOR DELETE
  TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin'));
