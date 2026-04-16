/**
 * Returns a display-ready image URL.
 * - External URLs (http/https) are returned as-is.
 * - Local upload paths (/uploads/...) are prefixed with /api.
 */
export function imageUrl(photoUrl) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
  return `/api${photoUrl}`;
}
