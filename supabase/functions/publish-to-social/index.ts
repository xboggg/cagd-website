// =====================================================================
// publish-to-social — CAGD
//
// Posts a published news story to the CAGD Facebook page.
// The website is the record; this only ever pushes outward. Nothing
// here ever reads from Facebook or writes to the website.
//
// Two ways in:
//   1. { news_id } with a signed-in admin/editor  -> handle that story
//   2. {} with the x-cron-secret header           -> drain anything
//                                                    still pending
//
// Required secrets:
//   FACEBOOK_PAGE_ID
//   FACEBOOK_PAGE_ACCESS_TOKEN
// Optional:
//   SOCIAL_CRON_SECRET   (needed only for the drain route)
//   SITE_URL             (default https://cagd.gov.gh)
//   FACEBOOK_API_VERSION (default v21.0)
//
// Until FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN are set, this
// function is inert: it marks rows 'skipped' with a clear reason and
// never touches Facebook. Publishing on the website is unaffected.
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cagd.gov.gh",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://cagd.gov.gh").replace(/\/+$/, "");
const FB_VERSION = Deno.env.get("FACEBOOK_API_VERSION") ?? "v21.0";
const MAX_ATTEMPTS = 3;

interface NewsRow {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  status: string | null;
  featured_image: string | null;
  share_to_social: boolean | null;
}

// ---------------------------------------------------------------------
// Facebook needs a public web address it can fetch itself. Stored paths
// and inline base64 images are no good to it.
// ---------------------------------------------------------------------
function toPublicImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("data:")) return null;        // inline fallback — unreachable by Facebook
  if (v.startsWith("blob:")) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `${SITE_URL}/${v.replace(/^\/+/, "")}`;
}

function buildMessage(news: NewsRow): string {
  const link = `${SITE_URL}/news/${news.slug ?? ""}`;
  const parts = [news.title.trim()];

  const excerpt = (news.excerpt ?? "").trim();
  if (excerpt) parts.push(excerpt.length > 400 ? `${excerpt.slice(0, 397)}...` : excerpt);

  parts.push(`Read the full item: ${link}`);
  return parts.join("\n\n");
}

// ---------------------------------------------------------------------
// The actual post. Returns the Facebook post id, or throws with the
// real reason so it lands in the log instead of vanishing.
// ---------------------------------------------------------------------
async function postToFacebook(news: NewsRow, pageId: string, token: string): Promise<string> {
  const message = buildMessage(news);
  const imageUrl = toPublicImageUrl(news.featured_image);
  const link = `${SITE_URL}/news/${news.slug ?? ""}`;

  const endpoint = imageUrl
    ? `https://graph.facebook.com/${FB_VERSION}/${pageId}/photos`
    : `https://graph.facebook.com/${FB_VERSION}/${pageId}/feed`;

  const body = new URLSearchParams(
    imageUrl
      ? { url: imageUrl, caption: message, access_token: token }
      : { message, link, access_token: token },
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const fbError = payload?.error;
    const detail = fbError
      ? `${fbError.type ?? "FacebookError"} ${fbError.code ?? ""}: ${fbError.message ?? "unknown"}`
      : `HTTP ${res.status}`;
    throw new Error(detail.trim());
  }

  // /photos returns post_id, /feed returns id
  return String(payload.post_id ?? payload.id ?? "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // -------------------------------------------------------------------
  // Who is asking?
  // -------------------------------------------------------------------
  let body: { news_id?: string; force?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const cronSecret = Deno.env.get("SOCIAL_CRON_SECRET");
  const isCron = Boolean(cronSecret) && req.headers.get("x-cron-secret") === cronSecret;

  if (!isCron) {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Not signed in" }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData?.user) return json({ error: "Not signed in" }, 401);

    const { data: roleRow } = await admin
      .from("cagd_user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!roleRow || !["admin", "editor"].includes(roleRow.role)) {
      return json({ error: "You do not have permission to publish to social media" }, 403);
    }
  }

  // -------------------------------------------------------------------
  // Which rows are we working on?
  // -------------------------------------------------------------------
  let query = admin
    .from("cagd_social_posts")
    .select("id, news_id, platform, status, attempts")
    .eq("platform", "facebook");

  if (body.news_id) {
    query = query.eq("news_id", body.news_id);
  } else {
    query = query.in("status", ["pending", "failed"]).lt("attempts", MAX_ATTEMPTS).limit(25);
  }

  const { data: rows, error: rowsErr } = await query;
  if (rowsErr) return json({ error: rowsErr.message }, 500);
  if (!rows || rows.length === 0) return json({ processed: 0, results: [] });

  // -------------------------------------------------------------------
  // Credentials. Without them we record why and stop — we never fail
  // silently and we never block the website.
  // -------------------------------------------------------------------
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID");
  const pageToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");

  // Categories allowed to go out. Empty setting = all of them.
  const { data: catSetting } = await admin
    .from("cagd_site_settings")
    .select("value")
    .eq("key", "social_share_categories")
    .maybeSingle();

  const allowedCategories = (catSetting?.value ?? "")
    .split(",")
    .map((c: string) => c.trim().toLowerCase())
    .filter(Boolean);

  const results: Array<Record<string, unknown>> = [];

  for (const row of rows) {
    // Already done, and not an explicit retry? Leave it alone.
    if (row.status === "sent" && !body.force) {
      results.push({ news_id: row.news_id, status: "sent", skipped: "already posted" });
      continue;
    }

    const { data: news } = await admin
      .from("cagd_news")
      .select("id, title, slug, excerpt, category, status, featured_image, share_to_social")
      .eq("id", row.news_id)
      .maybeSingle<NewsRow>();

    const finish = async (
      status: string,
      extra: Record<string, unknown> = {},
    ) => {
      await admin
        .from("cagd_social_posts")
        .update({ status, attempts: (row.attempts ?? 0) + 1, updated_at: new Date().toISOString(), ...extra })
        .eq("id", row.id);
      results.push({ news_id: row.news_id, status, ...extra });
    };

    if (!news) {
      await finish("failed", { error: "Story no longer exists" });
      continue;
    }
    if (news.status !== "published") {
      await finish("skipped", { error: `Story is ${news.status}, not published` });
      continue;
    }
    if (news.share_to_social === false) {
      await finish("skipped", { error: "Author unticked 'Also share on Facebook'" });
      continue;
    }
    if (
      allowedCategories.length > 0 &&
      !allowedCategories.includes((news.category ?? "").toLowerCase())
    ) {
      await finish("skipped", { error: `Category "${news.category}" is not in the approved share list` });
      continue;
    }
    if (!pageId || !pageToken) {
      await finish("skipped", {
        error: "Facebook is not connected yet (FACEBOOK_PAGE_ID / FACEBOOK_PAGE_ACCESS_TOKEN not set)",
      });
      continue;
    }

    try {
      const remoteId = await postToFacebook(news, pageId, pageToken);
      await finish("sent", {
        remote_post_id: remoteId,
        error: null,
        posted_at: new Date().toISOString(),
      });
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(String(thrown));
      console.error("[publish-to-social] Facebook post failed", {
        news_id: row.news_id,
        message: err.message,
      });
      await finish("failed", { error: err.message });
    }
  }

  return json({ processed: results.length, results });
});
