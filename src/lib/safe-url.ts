/** Returns a normalised http(s) URL without embedded credentials, or undefined. */
export function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (!url.hostname || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const EMAIL = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/;

/** A mailto: link for a plausible email address, or undefined. */
export function safeMailto(email: string | undefined): string | undefined {
  return email && EMAIL.test(email) ? `mailto:${email}` : undefined;
}
