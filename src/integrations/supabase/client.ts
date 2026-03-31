import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom fetch with timeout to prevent hanging on intermittent API issues.
function fetchWithTimeout(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const urlStr = url.toString();
  const isUpload = options?.method === 'POST' && (urlStr.includes('/storage/') || urlStr.includes('/object/'));
  const isAuth = urlStr.includes('/auth/');
  const timeout = isUpload ? 120000 : isAuth ? 60000 : 30000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: SUPABASE_ANON_KEY,
    },
    fetch: fetchWithTimeout,
  },
});
