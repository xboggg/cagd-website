-- CAGD Database Migration: Add cagd_ prefix to all tables
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Rename all existing tables
-- ============================================

ALTER TABLE IF EXISTS public.news RENAME TO cagd_news;
ALTER TABLE IF EXISTS public.reports RENAME TO cagd_reports;
ALTER TABLE IF EXISTS public.events RENAME TO cagd_events;
ALTER TABLE IF EXISTS public.divisions RENAME TO cagd_divisions;
ALTER TABLE IF EXISTS public.projects RENAME TO cagd_projects;
ALTER TABLE IF EXISTS public.management_profiles RENAME TO cagd_management_profiles;
ALTER TABLE IF EXISTS public.regional_offices RENAME TO cagd_regional_offices;
ALTER TABLE IF EXISTS public.gallery_albums RENAME TO cagd_gallery_albums;
ALTER TABLE IF EXISTS public.gallery_photos RENAME TO cagd_gallery_photos;
ALTER TABLE IF EXISTS public.profiles RENAME TO cagd_profiles;
ALTER TABLE IF EXISTS public.user_roles RENAME TO cagd_user_roles;
ALTER TABLE IF EXISTS public.site_settings RENAME TO cagd_site_settings;

-- ============================================
-- STEP 2: Add missing columns to existing tables
-- ============================================

-- News: add slug and excerpt
ALTER TABLE public.cagd_news ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.cagd_news ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Reports: add file_size and description
ALTER TABLE public.cagd_reports ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.cagd_reports ADD COLUMN IF NOT EXISTS description TEXT;

-- Events: add end_date
ALTER TABLE public.cagd_events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- ============================================
-- STEP 3: Create new tables
-- ============================================

-- Contact Messages
CREATE TABLE IF NOT EXISTS public.cagd_contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_contact_messages ENABLE ROW LEVEL SECURITY;

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.cagd_newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);
ALTER TABLE public.cagd_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Update has_role function to use new table name
-- ============================================

CREATE OR REPLACE FUNCTION public.cagd_has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cagd_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Keep old function for backward compatibility but point to new table
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cagd_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- STEP 5: Update handle_new_user function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cagd_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- STEP 6: Drop old RLS policies and create new ones
-- ============================================

-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "Users can read own roles" ON public.cagd_user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.cagd_user_roles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.cagd_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.cagd_profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.cagd_profiles;
DROP POLICY IF EXISTS "Public reads published news" ON public.cagd_news;
DROP POLICY IF EXISTS "Admin/editor manage news" ON public.cagd_news;
DROP POLICY IF EXISTS "Admin/editor update news" ON public.cagd_news;
DROP POLICY IF EXISTS "Admin/editor delete news" ON public.cagd_news;
DROP POLICY IF EXISTS "Public reads reports" ON public.cagd_reports;
DROP POLICY IF EXISTS "Admin/editor manage reports" ON public.cagd_reports;
DROP POLICY IF EXISTS "Admin/editor update reports" ON public.cagd_reports;
DROP POLICY IF EXISTS "Admin/editor delete reports" ON public.cagd_reports;
DROP POLICY IF EXISTS "Public reads management profiles" ON public.cagd_management_profiles;
DROP POLICY IF EXISTS "Admin manages management profiles" ON public.cagd_management_profiles;
DROP POLICY IF EXISTS "Admin updates management profiles" ON public.cagd_management_profiles;
DROP POLICY IF EXISTS "Admin deletes management profiles" ON public.cagd_management_profiles;
DROP POLICY IF EXISTS "Public reads divisions" ON public.cagd_divisions;
DROP POLICY IF EXISTS "Admin manages divisions" ON public.cagd_divisions;
DROP POLICY IF EXISTS "Admin updates divisions" ON public.cagd_divisions;
DROP POLICY IF EXISTS "Admin deletes divisions" ON public.cagd_divisions;
DROP POLICY IF EXISTS "Public reads projects" ON public.cagd_projects;
DROP POLICY IF EXISTS "Admin manages projects" ON public.cagd_projects;
DROP POLICY IF EXISTS "Admin updates projects" ON public.cagd_projects;
DROP POLICY IF EXISTS "Admin deletes projects" ON public.cagd_projects;
DROP POLICY IF EXISTS "Public reads published events" ON public.cagd_events;
DROP POLICY IF EXISTS "Admin/editor manage events" ON public.cagd_events;
DROP POLICY IF EXISTS "Admin/editor update events" ON public.cagd_events;
DROP POLICY IF EXISTS "Admin/editor delete events" ON public.cagd_events;
DROP POLICY IF EXISTS "Public reads albums" ON public.cagd_gallery_albums;
DROP POLICY IF EXISTS "Admin manages albums" ON public.cagd_gallery_albums;
DROP POLICY IF EXISTS "Admin updates albums" ON public.cagd_gallery_albums;
DROP POLICY IF EXISTS "Admin deletes albums" ON public.cagd_gallery_albums;
DROP POLICY IF EXISTS "Public reads photos" ON public.cagd_gallery_photos;
DROP POLICY IF EXISTS "Admin manages photos" ON public.cagd_gallery_photos;
DROP POLICY IF EXISTS "Admin updates photos" ON public.cagd_gallery_photos;
DROP POLICY IF EXISTS "Admin deletes photos" ON public.cagd_gallery_photos;
DROP POLICY IF EXISTS "Public reads regional offices" ON public.cagd_regional_offices;
DROP POLICY IF EXISTS "Admin manages regional offices" ON public.cagd_regional_offices;
DROP POLICY IF EXISTS "Admin updates regional offices" ON public.cagd_regional_offices;
DROP POLICY IF EXISTS "Admin deletes regional offices" ON public.cagd_regional_offices;
DROP POLICY IF EXISTS "Admin reads site settings" ON public.cagd_site_settings;
DROP POLICY IF EXISTS "Admin manages site settings" ON public.cagd_site_settings;
DROP POLICY IF EXISTS "Admin updates site settings" ON public.cagd_site_settings;
DROP POLICY IF EXISTS "Admin deletes site settings" ON public.cagd_site_settings;

-- Create new RLS policies

-- cagd_user_roles
CREATE POLICY "cagd_users_read_own_roles" ON public.cagd_user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "cagd_admins_manage_roles" ON public.cagd_user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_profiles
CREATE POLICY "cagd_public_read_profiles" ON public.cagd_profiles FOR SELECT USING (true);
CREATE POLICY "cagd_users_update_own_profile" ON public.cagd_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "cagd_users_insert_own_profile" ON public.cagd_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- cagd_news
CREATE POLICY "cagd_public_read_published_news" ON public.cagd_news FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_news" ON public.cagd_news FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_news" ON public.cagd_news FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_news" ON public.cagd_news FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- cagd_reports
CREATE POLICY "cagd_public_read_reports" ON public.cagd_reports FOR SELECT USING (publish_date IS NOT NULL OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_reports" ON public.cagd_reports FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_reports" ON public.cagd_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_reports" ON public.cagd_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
-- Allow public to increment download count
CREATE POLICY "cagd_public_increment_download" ON public.cagd_reports FOR UPDATE USING (true) WITH CHECK (true);

-- cagd_management_profiles
CREATE POLICY "cagd_public_read_management" ON public.cagd_management_profiles FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_management" ON public.cagd_management_profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_management" ON public.cagd_management_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_management" ON public.cagd_management_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_divisions
CREATE POLICY "cagd_public_read_divisions" ON public.cagd_divisions FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_divisions" ON public.cagd_divisions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_divisions" ON public.cagd_divisions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_divisions" ON public.cagd_divisions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_projects
CREATE POLICY "cagd_public_read_projects" ON public.cagd_projects FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_projects" ON public.cagd_projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_projects" ON public.cagd_projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_projects" ON public.cagd_projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_events
CREATE POLICY "cagd_public_read_published_events" ON public.cagd_events FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_events" ON public.cagd_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_events" ON public.cagd_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_events" ON public.cagd_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- cagd_gallery_albums
CREATE POLICY "cagd_public_read_albums" ON public.cagd_gallery_albums FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_albums" ON public.cagd_gallery_albums FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_albums" ON public.cagd_gallery_albums FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_albums" ON public.cagd_gallery_albums FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_gallery_photos
CREATE POLICY "cagd_public_read_photos" ON public.cagd_gallery_photos FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_photos" ON public.cagd_gallery_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_photos" ON public.cagd_gallery_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_photos" ON public.cagd_gallery_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_regional_offices
CREATE POLICY "cagd_public_read_regional_offices" ON public.cagd_regional_offices FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_regional_offices" ON public.cagd_regional_offices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_regional_offices" ON public.cagd_regional_offices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_regional_offices" ON public.cagd_regional_offices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_site_settings
CREATE POLICY "cagd_public_read_some_settings" ON public.cagd_site_settings FOR SELECT USING (
  key IN ('contact_email', 'contact_phone', 'contact_address', 'social_facebook', 'social_twitter', 'social_instagram', 'social_youtube')
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "cagd_admin_insert_settings" ON public.cagd_site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_settings" ON public.cagd_site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_settings" ON public.cagd_site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_contact_messages
CREATE POLICY "cagd_public_insert_contact" ON public.cagd_contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "cagd_admin_read_contact" ON public.cagd_contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_contact" ON public.cagd_contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_contact" ON public.cagd_contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cagd_newsletter_subscribers
CREATE POLICY "cagd_public_insert_newsletter" ON public.cagd_newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "cagd_admin_read_newsletter" ON public.cagd_newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_newsletter" ON public.cagd_newsletter_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_newsletter" ON public.cagd_newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- STEP 7: Update triggers for renamed tables
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.cagd_profiles;
DROP TRIGGER IF EXISTS update_news_updated_at ON public.cagd_news;
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.cagd_reports;
DROP TRIGGER IF EXISTS update_management_profiles_updated_at ON public.cagd_management_profiles;
DROP TRIGGER IF EXISTS update_divisions_updated_at ON public.cagd_divisions;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.cagd_projects;
DROP TRIGGER IF EXISTS update_events_updated_at ON public.cagd_events;
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.cagd_gallery_albums;
DROP TRIGGER IF EXISTS update_regional_offices_updated_at ON public.cagd_regional_offices;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.cagd_site_settings;

CREATE TRIGGER cagd_update_profiles_updated_at BEFORE UPDATE ON public.cagd_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_news_updated_at BEFORE UPDATE ON public.cagd_news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_reports_updated_at BEFORE UPDATE ON public.cagd_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_management_updated_at BEFORE UPDATE ON public.cagd_management_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_divisions_updated_at BEFORE UPDATE ON public.cagd_divisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_projects_updated_at BEFORE UPDATE ON public.cagd_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_events_updated_at BEFORE UPDATE ON public.cagd_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_albums_updated_at BEFORE UPDATE ON public.cagd_gallery_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_regional_updated_at BEFORE UPDATE ON public.cagd_regional_offices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER cagd_update_settings_updated_at BEFORE UPDATE ON public.cagd_site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 8: Create RPC function for safe download increment
-- ============================================

CREATE OR REPLACE FUNCTION public.cagd_increment_download(report_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.cagd_reports
  SET download_count = download_count + 1
  WHERE id = report_id;
$$;

-- ============================================
-- STEP 9: Create slug generation function for news
-- ============================================

CREATE OR REPLACE FUNCTION public.cagd_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '^-|-$', '', 'g');
    NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER cagd_news_generate_slug
  BEFORE INSERT OR UPDATE ON public.cagd_news
  FOR EACH ROW EXECUTE FUNCTION public.cagd_generate_slug();

-- ============================================
-- STEP 10: Rename storage buckets
-- ============================================

-- Note: Storage bucket renaming requires deleting and recreating
-- First, we'll create new buckets (old ones can be deleted manually after migration)

INSERT INTO storage.buckets (id, name, public)
VALUES ('cagd-report-pdfs', 'cagd-report-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cagd-gallery-images', 'cagd-gallery-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cagd-profile-photos', 'cagd-profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cagd-news-images', 'cagd-news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for new buckets
CREATE POLICY "cagd_public_read_report_pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-report-pdfs');
CREATE POLICY "cagd_admin_editor_upload_report_pdfs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-report-pdfs' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
CREATE POLICY "cagd_admin_editor_delete_report_pdfs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-report-pdfs' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "cagd_public_read_gallery_images" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-gallery-images');
CREATE POLICY "cagd_admin_upload_gallery_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-gallery-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_gallery_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-gallery-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cagd_public_read_profile_photos" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-profile-photos');
CREATE POLICY "cagd_admin_upload_profile_photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-profile-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_profile_photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-profile-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cagd_public_read_news_images" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-news-images');
CREATE POLICY "cagd_admin_editor_upload_news_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-news-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));
CREATE POLICY "cagd_admin_editor_delete_news_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-news-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

-- ============================================
-- DONE! Migration complete.
-- ============================================
