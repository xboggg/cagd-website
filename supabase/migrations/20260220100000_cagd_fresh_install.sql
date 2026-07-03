-- CAGD Fresh Installation for Self-Hosted Supabase
-- All tables prefixed with cagd_ to avoid conflicts

-- ============================================
-- STEP 1: Create app_role enum if not exists
-- ============================================

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create all CAGD tables
-- ============================================

-- User Roles
CREATE TABLE IF NOT EXISTS public.cagd_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.cagd_user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE IF NOT EXISTS public.cagd_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_profiles ENABLE ROW LEVEL SECURITY;

-- News
CREATE TABLE IF NOT EXISTS public.cagd_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  publish_date TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_news ENABLE ROW LEVEL SECURITY;

-- Reports
CREATE TABLE IF NOT EXISTS public.cagd_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size BIGINT,
  category TEXT NOT NULL DEFAULT 'General',
  publish_date TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_reports ENABLE ROW LEVEL SECURITY;

-- Management Profiles
CREATE TABLE IF NOT EXISTS public.cagd_management_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  profile_type TEXT NOT NULL DEFAULT 'Leadership' CHECK (profile_type IN ('CAG', 'DCAG', 'Regional', 'Leadership')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_management_profiles ENABLE ROW LEVEL SECURITY;

-- Divisions
CREATE TABLE IF NOT EXISTS public.cagd_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  directorates JSONB DEFAULT '[]',
  functions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_divisions ENABLE ROW LEVEL SECURITY;

-- Projects
CREATE TABLE IF NOT EXISTS public.cagd_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  components JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_projects ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE IF NOT EXISTS public.cagd_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  venue TEXT,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_events ENABLE ROW LEVEL SECURITY;

-- Gallery Albums
CREATE TABLE IF NOT EXISTS public.cagd_gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_image TEXT,
  album_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_gallery_albums ENABLE ROW LEVEL SECURITY;

-- Gallery Photos
CREATE TABLE IF NOT EXISTS public.cagd_gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.cagd_gallery_albums(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_gallery_photos ENABLE ROW LEVEL SECURITY;

-- Regional Offices
CREATE TABLE IF NOT EXISTS public.cagd_regional_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  director_name TEXT,
  director_photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_regional_offices ENABLE ROW LEVEL SECURITY;

-- Site Settings
CREATE TABLE IF NOT EXISTS public.cagd_site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cagd_site_settings ENABLE ROW LEVEL SECURITY;

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
-- STEP 3: Create functions
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.cagd_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Has role function
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

-- Slug generation function
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

-- Increment download count
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.cagd_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cagd_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- STEP 4: Create triggers
-- ============================================

DROP TRIGGER IF EXISTS cagd_update_profiles_updated_at ON public.cagd_profiles;
DROP TRIGGER IF EXISTS cagd_update_news_updated_at ON public.cagd_news;
DROP TRIGGER IF EXISTS cagd_update_reports_updated_at ON public.cagd_reports;
DROP TRIGGER IF EXISTS cagd_update_management_updated_at ON public.cagd_management_profiles;
DROP TRIGGER IF EXISTS cagd_update_divisions_updated_at ON public.cagd_divisions;
DROP TRIGGER IF EXISTS cagd_update_projects_updated_at ON public.cagd_projects;
DROP TRIGGER IF EXISTS cagd_update_events_updated_at ON public.cagd_events;
DROP TRIGGER IF EXISTS cagd_update_albums_updated_at ON public.cagd_gallery_albums;
DROP TRIGGER IF EXISTS cagd_update_regional_updated_at ON public.cagd_regional_offices;
DROP TRIGGER IF EXISTS cagd_update_settings_updated_at ON public.cagd_site_settings;
DROP TRIGGER IF EXISTS cagd_news_generate_slug ON public.cagd_news;
DROP TRIGGER IF EXISTS cagd_on_auth_user_created ON auth.users;

CREATE TRIGGER cagd_update_profiles_updated_at BEFORE UPDATE ON public.cagd_profiles FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_news_updated_at BEFORE UPDATE ON public.cagd_news FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_reports_updated_at BEFORE UPDATE ON public.cagd_reports FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_management_updated_at BEFORE UPDATE ON public.cagd_management_profiles FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_divisions_updated_at BEFORE UPDATE ON public.cagd_divisions FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_projects_updated_at BEFORE UPDATE ON public.cagd_projects FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_events_updated_at BEFORE UPDATE ON public.cagd_events FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_albums_updated_at BEFORE UPDATE ON public.cagd_gallery_albums FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_regional_updated_at BEFORE UPDATE ON public.cagd_regional_offices FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_update_settings_updated_at BEFORE UPDATE ON public.cagd_site_settings FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();
CREATE TRIGGER cagd_news_generate_slug BEFORE INSERT OR UPDATE ON public.cagd_news FOR EACH ROW EXECUTE FUNCTION public.cagd_generate_slug();
CREATE TRIGGER cagd_on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.cagd_handle_new_user();

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

-- cagd_user_roles
CREATE POLICY "cagd_users_read_own_roles" ON public.cagd_user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "cagd_admins_manage_roles" ON public.cagd_user_roles FOR ALL TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_profiles
CREATE POLICY "cagd_public_read_profiles" ON public.cagd_profiles FOR SELECT USING (true);
CREATE POLICY "cagd_users_update_own_profile" ON public.cagd_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "cagd_users_insert_own_profile" ON public.cagd_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- cagd_news
CREATE POLICY "cagd_public_read_published_news" ON public.cagd_news FOR SELECT USING (status = 'published' OR public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_news" ON public.cagd_news FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_news" ON public.cagd_news FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_news" ON public.cagd_news FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));

-- cagd_reports
CREATE POLICY "cagd_public_read_reports" ON public.cagd_reports FOR SELECT USING (publish_date IS NOT NULL OR public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_reports" ON public.cagd_reports FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_reports" ON public.cagd_reports FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_reports" ON public.cagd_reports FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));

-- cagd_management_profiles
CREATE POLICY "cagd_public_read_management" ON public.cagd_management_profiles FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_management" ON public.cagd_management_profiles FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_management" ON public.cagd_management_profiles FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_management" ON public.cagd_management_profiles FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_divisions
CREATE POLICY "cagd_public_read_divisions" ON public.cagd_divisions FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_divisions" ON public.cagd_divisions FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_divisions" ON public.cagd_divisions FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_divisions" ON public.cagd_divisions FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_projects
CREATE POLICY "cagd_public_read_projects" ON public.cagd_projects FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_projects" ON public.cagd_projects FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_projects" ON public.cagd_projects FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_projects" ON public.cagd_projects FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_events
CREATE POLICY "cagd_public_read_published_events" ON public.cagd_events FOR SELECT USING (status = 'published' OR public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_insert_events" ON public.cagd_events FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_update_events" ON public.cagd_events FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));
CREATE POLICY "cagd_admin_editor_delete_events" ON public.cagd_events FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor'));

-- cagd_gallery_albums
CREATE POLICY "cagd_public_read_albums" ON public.cagd_gallery_albums FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_albums" ON public.cagd_gallery_albums FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_albums" ON public.cagd_gallery_albums FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_albums" ON public.cagd_gallery_albums FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_gallery_photos
CREATE POLICY "cagd_public_read_photos" ON public.cagd_gallery_photos FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_photos" ON public.cagd_gallery_photos FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_photos" ON public.cagd_gallery_photos FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_photos" ON public.cagd_gallery_photos FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_regional_offices
CREATE POLICY "cagd_public_read_regional_offices" ON public.cagd_regional_offices FOR SELECT USING (true);
CREATE POLICY "cagd_admin_insert_regional_offices" ON public.cagd_regional_offices FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_regional_offices" ON public.cagd_regional_offices FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_regional_offices" ON public.cagd_regional_offices FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_site_settings
CREATE POLICY "cagd_public_read_some_settings" ON public.cagd_site_settings FOR SELECT USING (
  key IN ('contact_email', 'contact_phone', 'contact_address', 'social_facebook', 'social_twitter', 'social_instagram', 'social_youtube')
  OR public.cagd_has_role(auth.uid(), 'admin')
);
CREATE POLICY "cagd_admin_insert_settings" ON public.cagd_site_settings FOR INSERT TO authenticated WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_settings" ON public.cagd_site_settings FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_settings" ON public.cagd_site_settings FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_contact_messages
CREATE POLICY "cagd_public_insert_contact" ON public.cagd_contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "cagd_admin_read_contact" ON public.cagd_contact_messages FOR SELECT TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_contact" ON public.cagd_contact_messages FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_contact" ON public.cagd_contact_messages FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- cagd_newsletter_subscribers
CREATE POLICY "cagd_public_insert_newsletter" ON public.cagd_newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "cagd_admin_read_newsletter" ON public.cagd_newsletter_subscribers FOR SELECT TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_update_newsletter" ON public.cagd_newsletter_subscribers FOR UPDATE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_newsletter" ON public.cagd_newsletter_subscribers FOR DELETE TO authenticated USING (public.cagd_has_role(auth.uid(), 'admin'));

-- ============================================
-- STEP 6: Create Storage Buckets
-- ============================================

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

-- Storage policies
CREATE POLICY "cagd_public_read_report_pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-report-pdfs');
CREATE POLICY "cagd_admin_editor_upload_report_pdfs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-report-pdfs' AND (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor')));
CREATE POLICY "cagd_admin_editor_delete_report_pdfs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-report-pdfs' AND (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor')));

CREATE POLICY "cagd_public_read_gallery_images" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-gallery-images');
CREATE POLICY "cagd_admin_upload_gallery_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-gallery-images' AND public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_gallery_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-gallery-images' AND public.cagd_has_role(auth.uid(), 'admin'));

CREATE POLICY "cagd_public_read_profile_photos" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-profile-photos');
CREATE POLICY "cagd_admin_upload_profile_photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-profile-photos' AND public.cagd_has_role(auth.uid(), 'admin'));
CREATE POLICY "cagd_admin_delete_profile_photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-profile-photos' AND public.cagd_has_role(auth.uid(), 'admin'));

CREATE POLICY "cagd_public_read_news_images" ON storage.objects FOR SELECT USING (bucket_id = 'cagd-news-images');
CREATE POLICY "cagd_admin_editor_upload_news_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cagd-news-images' AND (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor')));
CREATE POLICY "cagd_admin_editor_delete_news_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cagd-news-images' AND (public.cagd_has_role(auth.uid(), 'admin') OR public.cagd_has_role(auth.uid(), 'editor')));

-- ============================================
-- DONE! CAGD tables created successfully.
-- ============================================
