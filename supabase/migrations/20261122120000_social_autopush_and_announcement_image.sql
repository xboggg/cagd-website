-- =====================================================================
-- 22 Nov 2026
--   A. Announcements: a feature image, shown on the staff page
--   B. Social auto-push phase 1: queue + log for Facebook posting
--
-- Safe to run more than once. Nothing is dropped and nothing is deleted.
-- Several of these tables were created directly in the database rather
-- than through a migration, so every change here is guarded.
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. Announcement feature image
-- ---------------------------------------------------------------------
ALTER TABLE public.cagd_announcements
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.cagd_announcements.image_url IS
  'Optional banner shown on the staff announcements page. Separate from attachment_url, which may be a PDF or form.';


-- ---------------------------------------------------------------------
-- B1. Per-story switch: should this story go out to social?
-- ---------------------------------------------------------------------
ALTER TABLE public.cagd_news
  ADD COLUMN IF NOT EXISTS share_to_social BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.cagd_news.share_to_social IS
  'Unticked by the author for stories that should not be broadcast, e.g. internal circulars.';


-- ---------------------------------------------------------------------
-- B2. The log. One row per story per platform — this is what makes
--     "post once" true. A later edit finds the row and does nothing.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cagd_social_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id        UUID NOT NULL REFERENCES public.cagd_news(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL DEFAULT 'facebook',
  status         TEXT NOT NULL DEFAULT 'pending',
  remote_post_id TEXT,
  error          TEXT,
  attempts       INTEGER NOT NULL DEFAULT 0,
  posted_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cagd_social_posts_status_check'
  ) THEN
    ALTER TABLE public.cagd_social_posts
      ADD CONSTRAINT cagd_social_posts_status_check
      CHECK (status IN ('pending', 'sent', 'failed', 'skipped'));
  END IF;
END $$;

-- The "post once" guarantee lives here, not in application code.
CREATE UNIQUE INDEX IF NOT EXISTS cagd_social_posts_once
  ON public.cagd_social_posts (news_id, platform);

CREATE INDEX IF NOT EXISTS cagd_social_posts_pending
  ON public.cagd_social_posts (status)
  WHERE status IN ('pending', 'failed');

ALTER TABLE public.cagd_social_posts ENABLE ROW LEVEL SECURITY;

-- Admins and editors can see the log in the News list. Nobody writes to
-- it from the browser — only the server function does, via service role,
-- which bypasses RLS.
DROP POLICY IF EXISTS "cagd_staff_read_social_posts" ON public.cagd_social_posts;
CREATE POLICY "cagd_staff_read_social_posts"
  ON public.cagd_social_posts FOR SELECT TO authenticated
  USING (
    public.cagd_has_role(auth.uid(), 'admin')
    OR public.cagd_has_role(auth.uid(), 'editor')
  );

DROP TRIGGER IF EXISTS cagd_social_posts_updated_at ON public.cagd_social_posts;
CREATE TRIGGER cagd_social_posts_updated_at
  BEFORE UPDATE ON public.cagd_social_posts
  FOR EACH ROW EXECUTE FUNCTION public.cagd_update_updated_at_column();


-- ---------------------------------------------------------------------
-- B3. The watcher.
--
--     Pure SQL on purpose: it only writes a row. It makes no network
--     call, so it can never slow down or block a save, and it does not
--     depend on pg_net or pg_cron being installed on this server.
--     The server function picks the row up afterwards.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cagd_queue_social_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only when the story is actually live and the author left the box ticked.
  IF NEW.status IS DISTINCT FROM 'published' OR COALESCE(NEW.share_to_social, TRUE) = FALSE THEN
    RETURN NEW;
  END IF;

  -- Only on the move INTO published. Editing a story that is already
  -- published must not queue it a second time.
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM 'published' THEN
    RETURN NEW;
  END IF;

  -- ON CONFLICT DO NOTHING: if this story has ever been queued or sent
  -- for this platform, leave that row exactly as it is.
  INSERT INTO public.cagd_social_posts (news_id, platform, status)
  VALUES (NEW.id, 'facebook', 'pending')
  ON CONFLICT (news_id, platform) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cagd_news_queue_social ON public.cagd_news;
CREATE TRIGGER cagd_news_queue_social
  AFTER INSERT OR UPDATE OF status ON public.cagd_news
  FOR EACH ROW EXECUTE FUNCTION public.cagd_queue_social_post();


-- ---------------------------------------------------------------------
-- B4. Which categories go out automatically.
--     Empty value = every category. Edit this one row to narrow it,
--     e.g. 'Press Release,Announcements,Payroll'.
-- ---------------------------------------------------------------------
INSERT INTO public.cagd_site_settings (key, value)
VALUES ('social_share_categories', '')
ON CONFLICT (key) DO NOTHING;


-- ---------------------------------------------------------------------
-- Check
-- ---------------------------------------------------------------------
SELECT 'announcements.image_url' AS item,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'cagd_announcements' AND column_name = 'image_url') AS ok
UNION ALL
SELECT 'news.share_to_social',
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'cagd_news' AND column_name = 'share_to_social')
UNION ALL
SELECT 'cagd_social_posts table',
       EXISTS (SELECT 1 FROM information_schema.tables
                WHERE table_name = 'cagd_social_posts')
UNION ALL
SELECT 'trigger on cagd_news',
       EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cagd_news_queue_social');
