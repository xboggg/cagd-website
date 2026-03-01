-- Add Twi translation columns to cagd_news table
ALTER TABLE cagd_news ADD COLUMN IF NOT EXISTS title_tw TEXT;
ALTER TABLE cagd_news ADD COLUMN IF NOT EXISTS excerpt_tw TEXT;
ALTER TABLE cagd_news ADD COLUMN IF NOT EXISTS content_tw TEXT;
