-- RPC function to increment download count publicly
-- This allows anonymous users to increment the download count without direct table access

CREATE OR REPLACE FUNCTION public.increment_download_count(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cagd_reports
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = report_id;
END;
$$;

-- Grant execute to anonymous users
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO authenticated;
