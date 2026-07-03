-- Migration: Document Download Tracker
-- Run in Supabase SQL editor (db.techtrendi.com)

CREATE TABLE IF NOT EXISTS public.cagd_document_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_url text NOT NULL,
  file_name text,
  event_id uuid REFERENCES public.cagd_events(id) ON DELETE SET NULL,
  downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_download" ON public.cagd_document_downloads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_select_download" ON public.cagd_document_downloads
  FOR SELECT USING (auth.role() = 'authenticated');
