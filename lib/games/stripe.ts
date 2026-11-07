/**
 * Stripe Checkout for the map games, over Stripe's REST API (no SDK needed).
 * Payment methods come from the Stripe dashboard: turn on MobilePay and cards
 * there (Settings → Payment methods).
 */
import crypto from "node:crypto";

import { formatCode } from "./code";
import { type Lang, type Product, priceOf, productName } from "./catalog";

export class StripeError extends Error {}

function apiBase(): string {
  return (process.env.STRIPE_API_BASE ?? "https://api.stripe.com/v1").replace(/\/$/, "");
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

async function stripe(method: "GET" | "POST", path: string, params?: URLSearchParams): Promise<Record<string, unknown>> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("Stripe is not configured");
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params?.toString(),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = json.error as { message?: string } | undefined;
    throw new StripeError(`Stripe ${res.status}: ${err?.message ?? "request failed"}`);
  }
  return json;
}

export interface CheckoutInput {
  code: string;
  product: Product;
  lang: Lang;
  origin: string;
}

export async function createCheckoutSession({ code, product, lang, origin }: CheckoutInput): Promise<{ id: string; url: string }> {
  const name = productName(product, lang);
  const codeLine = lang === "da" ? `Din kode: ${formatCode(code)}` : `Your code: ${formatCode(code)}`;
  const p = new URLSearchParams({
    mode: "payment",
    locale: lang,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "dkk",
    "line_items[0][price_data][unit_amount]": String(priceOf(product)),
    "line_items[0][price_data][product_data][name]": name,
    success_url: `${origin}/games/unlock?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/games/levels${product === "bundle" ? "#bundle" : `?level=${product}`}`,
    client_reference_id: code,
    "metadata[code]": code,
    "metadata[product]": product,
    "metadata[withdrawal_waiver]": "accepted",
    // The receipt Stripe emails shows the description, so the buyer has the code in writing.
    "payment_intent_data[description]": `${name} · ${codeLine}`,
    "payment_intent_data[metadata][code]": code,
    "payment_intent_data[metadata][product]": product,
  });
  const session = await stripe("POST", "/checkout/sessions", p);
  return { id: String(session.id), url: String(session.url) };
}

export interface PaidSession {
  paid: boolean;
  code: string | null;
  email: string | null;
  paymentIntent: string | null;
}

export function readSession(session: Record<string, unknown>): PaidSession {
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const details = (session.customer_details ?? {}) as { email?: string };
  const pi = session.payment_intent;
  return {
    paid: session.payment_status === "paid",
    code: metadata.code ?? null,
    email: details.email ?? null,
    paymentIntent: typeof pi === "string" ? pi : (pi as { id?: string } | null)?.id ?? null,
  };
}

export async function retrieveCheckoutSession(id: string): Promise<PaidSession> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) throw new StripeError("Bad session id");
  return readSession(await stripe("GET", `/checkout/sessions/${id}`));
}

/**
 * Verify a webhook's Stripe-Signature header (HMAC-SHA256 of "t.payload").
 * Returns false on any mismatch or a timestamp more than `toleranceSec` old.
 */
export function verifyWebhook(payload: string, header: string | null, secret: string, toleranceSec = 300, now = Date.now()): boolean {
  if (!header) return false;
  const parts = header.split(",").map((kv) => kv.split("=") as [string, string]);
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length || !/^\d+$/.test(t)) return false;
  if (Math.abs(now / 1000 - Number(t)) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const exp = Buffer.from(expected, "hex");
  return sigs.some((s) => {
    const got = Buffer.from(s, "hex");
    return got.length === exp.length && crypto.timingSafeEqual(got, exp);
  });
}
