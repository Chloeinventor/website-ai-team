export const SITE = {
  name: "[Autoworks]",
  /** The one-line answer to "what is this?" — reused in metadata and the nav. */
  tagline: "Buy an AI workflow that runs your busywork. Try it first, free.",
  builder: "[Your Name]",
  email: "[hello@yourdomain.com]",
  bookingUrl: "[https://cal.com/your-handle/30min]",
} as const;

/** Absolute origin for return URLs and webhook registration. */
export function originFrom(headers: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto =
    headers.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return host ? `${proto}://${host}` : "http://localhost:3000";
}
