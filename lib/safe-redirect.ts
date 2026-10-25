const FALLBACK = "/dashboard";

// Browsers strip tabs and newlines from URLs, so "/\t/evil.com" becomes "//evil.com".
// Reject whitespace, control characters and backslashes outright.
const UNSAFE_CHARS = /[\u0000- \u007f\\]/;

// Accepts only same-origin relative paths ("/x"), rejecting protocol-relative
// ("//host") and any value a browser could normalise into an external URL.
export function safeRedirectPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || UNSAFE_CHARS.test(value)) {
    return FALLBACK;
  }
  return value;
}
