-- Migration: News/Announcements Subscriptions
-- Run in Supabase SQL editor (db.techtrendi.com)

CREATE TABLE IF NOT EXISTS public.cagd_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

ALTER TABLE public.cagd_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_subscription" ON public.cagd_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_all_subscriptions" ON public.cagd_subscriptions
  USING (auth.role() = 'authenticated');
