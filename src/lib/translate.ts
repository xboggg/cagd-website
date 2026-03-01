/**
 * Auto-translate English text to Twi using Google Translate API.
 * Handles both plain text and HTML content.
 */
export async function translateToTwi(text: string): Promise<string> {
  if (!text || !text.trim()) return "";

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ak&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation failed");
    const data = await res.json();
    // Response format: [[["translated","original",null,null,10],...]]
    const translated = (data[0] as any[])
      .map((segment: any) => segment[0])
      .join("");
    return translated;
  } catch (err) {
    console.warn("Translation failed, keeping original:", err);
    return text;
  }
}

/**
 * Translate HTML content to Twi while preserving HTML structure.
 * Strips HTML, translates the text, then returns translated text.
 * For rich content, we translate the full HTML and let Google handle tags.
 */
export async function translateHtmlToTwi(html: string): Promise<string> {
  if (!html || !html.trim()) return "";

  // For short content, translate directly (Google handles basic HTML)
  // For very long content, split into chunks
  const MAX_CHUNK = 4500;

  if (html.length <= MAX_CHUNK) {
    return translateToTwi(html);
  }

  // Split by paragraphs for long content
  const parts = html.split(/(<\/p>|<\/div>|<\/li>|<br\s*\/?>)/i);
  let result = "";
  let chunk = "";

  for (const part of parts) {
    if ((chunk + part).length > MAX_CHUNK) {
      if (chunk) {
        result += await translateToTwi(chunk);
      }
      chunk = part;
    } else {
      chunk += part;
    }
  }

  if (chunk) {
    result += await translateToTwi(chunk);
  }

  return result;
}
