-- Migration: Forms & Documents Library
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.cagd_forms_library (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name           text        NOT NULL,
  description    text,
  category       text        DEFAULT 'General',
  form_code      text,
  file_url       text        NOT NULL,
  file_size      text,
  is_active      boolean     DEFAULT true,
  download_count integer     DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE public.cagd_forms_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_forms"
  ON public.cagd_forms_library FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin_all_forms"
  ON public.cagd_forms_library
  USING (auth.role() = 'authenticated');

-- Optional: seed with some example forms
-- INSERT INTO public.cagd_forms_library (name, category, form_code, file_url, file_size, description) VALUES
--   ('Pension Application Form', 'Pension', 'CAGD-PEN-01', 'https://cagd.gov.gh/forms/pension-application.pdf', '245 KB', 'Apply for government pension on retirement'),
--   ('Salary Change Request Form', 'Payroll', 'CAGD-PAY-02', 'https://cagd.gov.gh/forms/salary-change.pdf', '180 KB', 'Request a salary grade or step change');
