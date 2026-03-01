import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch a site content section from cagd_site_settings.
 * Stores JSON-serialized arrays/objects under a unique key.
 * Returns the parsed value or the provided fallback if not found.
 */
export function useSiteContent<T>(key: string, fallback: T): { data: T; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data: row } = await supabase
        .from("cagd_site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (row?.value) {
        try {
          return JSON.parse(row.value) as T;
        } catch {
          return fallback;
        }
      }
      return fallback;
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  return { data: data ?? fallback, isLoading };
}

/**
 * Helper to save site content back to cagd_site_settings.
 * Upserts by key.
 */
export async function saveSiteContent(key: string, value: unknown): Promise<{ error: string | null }> {
  const json = JSON.stringify(value);

  // Check if key exists
  const { data: existing } = await supabase
    .from("cagd_site_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  let error;
  if (existing) {
    ({ error } = await supabase
      .from("cagd_site_settings")
      .update({ value: json, updated_at: new Date().toISOString() })
      .eq("key", key));
  } else {
    ({ error } = await supabase
      .from("cagd_site_settings")
      .insert({ key, value: json }));
  }

  return { error: error?.message || null };
}
