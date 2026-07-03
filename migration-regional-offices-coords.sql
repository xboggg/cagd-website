-- Migration: Add latitude/longitude to regional offices
-- Run this in the Supabase SQL editor

ALTER TABLE public.cagd_regional_offices
  ADD COLUMN IF NOT EXISTS latitude  numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

-- Pre-populate coordinates for Ghana's 16 regional capitals
-- Update by partial region name match (adjust WHERE clauses to match your actual region names)

UPDATE public.cagd_regional_offices SET latitude = 5.6037,  longitude = -0.1870  WHERE region ILIKE '%greater accra%' OR region ILIKE '%accra%';
UPDATE public.cagd_regional_offices SET latitude = 6.6885,  longitude = -1.6244  WHERE region ILIKE '%ashanti%';
UPDATE public.cagd_regional_offices SET latitude = 4.9340,  longitude = -1.7586  WHERE region ILIKE '%western%' AND region NOT ILIKE '%north%';
UPDATE public.cagd_regional_offices SET latitude = 6.0870,  longitude = -0.2638  WHERE region ILIKE '%eastern%';
UPDATE public.cagd_regional_offices SET latitude = 5.1053,  longitude = -1.2466  WHERE region ILIKE '%central%';
UPDATE public.cagd_regional_offices SET latitude = 6.6008,  longitude =  0.4713  WHERE region ILIKE '%volta%';
UPDATE public.cagd_regional_offices SET latitude = 9.4034,  longitude = -0.8424  WHERE region ILIKE '%northern%' AND region NOT ILIKE '%north east%';
UPDATE public.cagd_regional_offices SET latitude = 10.7869, longitude = -0.8511  WHERE region ILIKE '%upper east%';
UPDATE public.cagd_regional_offices SET latitude = 10.0603, longitude = -2.5002  WHERE region ILIKE '%upper west%';
UPDATE public.cagd_regional_offices SET latitude = 7.3376,  longitude = -2.3288  WHERE region ILIKE '%bono%' AND region NOT ILIKE '%east%';
UPDATE public.cagd_regional_offices SET latitude = 7.5878,  longitude = -1.9322  WHERE region ILIKE '%bono east%';
UPDATE public.cagd_regional_offices SET latitude = 6.8060,  longitude = -2.5172  WHERE region ILIKE '%ahafo%';
UPDATE public.cagd_regional_offices SET latitude = 6.2077,  longitude = -2.4886  WHERE region ILIKE '%western north%';
UPDATE public.cagd_regional_offices SET latitude = 8.0757,  longitude = -0.1783  WHERE region ILIKE '%oti%';
UPDATE public.cagd_regional_offices SET latitude = 9.0934,  longitude = -1.8234  WHERE region ILIKE '%savannah%';
UPDATE public.cagd_regional_offices SET latitude = 10.5237, longitude = -0.3616  WHERE region ILIKE '%north east%';
