import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves a database image path to the correct URL for the current base path.
 * Handles root domain deployment.
 */
/** Strip HTML tags and decode entities from a string (for displaying excerpts). */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Returns Twi content if available when language is 'tw', otherwise English.
 */
export function getNewsField(article: Record<string, any>, field: "title" | "excerpt" | "content", lang: string): string {
  if (lang === "tw") {
    const twValue = article[`${field}_tw`];
    if (twValue) return twValue;
  }
  return article[field] || "";
}

export function resolveImagePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/images/')) {
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  }
  return path;
}
