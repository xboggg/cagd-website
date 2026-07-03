import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom fetch with 10-second timeout to prevent hanging on intermittent API issues.
// The PostgREST server at db.techtrendi.com occasionally hangs for 60+ seconds.
// This ensures requests fail fast so React Query can retry.
function fetchWithTimeout(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: SUPABASE_ANON_KEY,
    },
    fetch: fetchWithTimeout,
  },
});
