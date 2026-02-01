/**
 * Simple email format regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format (client-side only)
 */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Normalize email for caching (lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
