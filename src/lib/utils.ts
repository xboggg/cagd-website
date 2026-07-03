import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves a database image path to the correct URL for the current base path.
 * Handles /new-site/ subdirectory deployment.
 */
export function resolveImagePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/images/')) {
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  }
  return path;
}
