/**
 * Converts a string to a URL-friendly slug
 * - Converts to lowercase
 * - Replaces Turkish characters with ASCII equivalents
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses multiple hyphens to single hyphen
 * - Removes leading/trailing hyphens
 */
export default function slugify(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .trim()
    // Turkish character replacements
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/(^-|-$)/g, "");
}

