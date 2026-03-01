/**
 * Batch-translate all existing cagd_news articles to Twi.
 * Run once: node scripts/batch-translate.mjs
 */

const SUPABASE_URL = "https://db.techtrendi.com";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.lbPqMemEL_VFnCma2zeuJ1MfFLNQ7_VXRgaacXeeReQ";

async function translateToTwi(text) {
  if (!text || !text.trim()) return "";
  // Split long text into chunks of ~4500 chars
  if (text.length > 4500) {
    const parts = text.split(/(<\/p>|<\/div>|<\/li>|<br\s*\/?>)/i);
    let result = "";
    let chunk = "";
    for (const part of parts) {
      if ((chunk + part).length > 4500) {
        if (chunk) result += await doTranslate(chunk);
        chunk = part;
      } else {
        chunk += part;
      }
    }
    if (chunk) result += await doTranslate(chunk);
    return result;
  }
  return doTranslate(text);
}

async function doTranslate(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ak&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data[0].map((s) => s[0]).join("");
  } catch (err) {
    console.error("  Translation failed:", err.message);
    return text; // fallback to original
  }
}

async function supabaseGet(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function supabaseUpdate(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  return res.ok;
}

async function main() {
  console.log("Fetching all news articles...");
  const articles = await supabaseGet("cagd_news", "select=id,title,excerpt,content,title_tw,excerpt_tw,content_tw&order=created_at.desc");

  if (!Array.isArray(articles)) {
    console.error("Failed to fetch articles:", articles);
    return;
  }

  console.log(`Found ${articles.length} articles. Translating...`);

  let translated = 0;
  let skipped = 0;

  for (const article of articles) {
    // Skip if already has Twi translation
    if (article.title_tw && article.content_tw) {
      console.log(`  SKIP: "${article.title.substring(0, 50)}..." (already translated)`);
      skipped++;
      continue;
    }

    console.log(`  Translating: "${article.title.substring(0, 50)}..."`);

    const titleTw = await translateToTwi(article.title || "");
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));

    const excerptTw = await translateToTwi(article.excerpt || "");
    await new Promise((r) => setTimeout(r, 500));

    const contentTw = await translateToTwi(article.content || "");
    await new Promise((r) => setTimeout(r, 1000));

    const ok = await supabaseUpdate("cagd_news", article.id, {
      title_tw: titleTw || null,
      excerpt_tw: excerptTw || null,
      content_tw: contentTw || null,
    });

    if (ok) {
      console.log(`    Done: "${titleTw.substring(0, 50)}..."`);
      translated++;
    } else {
      console.error(`    FAILED to update article ${article.id}`);
    }
  }

  console.log(`\nComplete! Translated: ${translated}, Skipped: ${skipped}, Total: ${articles.length}`);
}

main();
