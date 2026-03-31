-- Audit Trail table for tracking all admin actions
CREATE TABLE IF NOT EXISTS public.cagd_audit_trail (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
  resource_type text NOT NULL,
  resource_id text,
  resource_title text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_audit_trail ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "admin_read_audit" ON public.cagd_audit_trail
  FOR SELECT TO authenticated
  USING (public.cagd_has_role(auth.uid(), 'admin'));

-- Any authenticated user can insert audit entries (logging their own actions)
CREATE POLICY "authenticated_insert_audit" ON public.cagd_audit_trail
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON public.cagd_audit_trail (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.cagd_audit_trail (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON public.cagd_audit_trail (resource_type);
