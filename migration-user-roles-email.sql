-- Migration: Add email column to cagd_user_roles
-- Run this in the Supabase SQL editor

ALTER TABLE public.cagd_user_roles
  ADD COLUMN IF NOT EXISTS email text;
