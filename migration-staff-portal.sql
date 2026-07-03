-- ============================================================
-- Staff Portal Migration — Announcements, Events, Birthday, Org Chart
-- ============================================================

-- 1. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.cagd_announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'critical')),
  attachment_url text,
  attachment_name text,
  published boolean DEFAULT true,
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.cagd_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_announcements" ON public.cagd_announcements
  FOR SELECT TO authenticated
  USING (published = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "admin_all_announcements" ON public.cagd_announcements
  FOR ALL TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.cagd_announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.cagd_announcements (priority);

-- 2. STAFF EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.cagd_staff_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  max_participants integer,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_staff_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_staff_events" ON public.cagd_staff_events
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "admin_all_staff_events" ON public.cagd_staff_events
  FOR ALL TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_staff_events_date ON public.cagd_staff_events (event_date DESC);

-- 3. STAFF EVENT RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.cagd_staff_event_rsvps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.cagd_staff_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  status text DEFAULT 'attending' CHECK (status IN ('attending', 'declined', 'maybe')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.cagd_staff_event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_rsvps" ON public.cagd_staff_event_rsvps
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "own_insert_rsvp" ON public.cagd_staff_event_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_update_rsvp" ON public.cagd_staff_event_rsvps
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_all_rsvps" ON public.cagd_staff_event_rsvps
  FOR ALL TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.cagd_has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON public.cagd_staff_event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON public.cagd_staff_event_rsvps (user_id);

-- 4. ADD COLUMNS TO STAFF DIRECTORY (birthday + org chart)
ALTER TABLE public.cagd_staff_directory ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.cagd_staff_directory ADD COLUMN IF NOT EXISTS reports_to uuid REFERENCES public.cagd_staff_directory(id);
CREATE INDEX IF NOT EXISTS idx_staff_reports_to ON public.cagd_staff_directory (reports_to);
CREATE INDEX IF NOT EXISTS idx_staff_dob ON public.cagd_staff_directory (date_of_birth);
