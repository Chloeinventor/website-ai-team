/**
 * Purchases and devices, in Supabase (tables and functions:
 * supabase/migrations/20261107_games_purchases.sql). Server-side only: uses the
 * service-role key over the REST API, so no client library is needed.
 */
import type { Product } from "./catalog";

export class GamesDbError extends Error {}

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function isDbConfigured(): boolean {
  return config() !== null;
}

async function rest(path: string, init: RequestInit & { prefer?: string } = {}): Promise<unknown> {
  const c = config();
  if (!c) throw new GamesDbError("Supabase is not configured");
  const res = await fetch(`${c.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new GamesDbError(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

export async function createPendingPurchase(code: string, product: Product): Promise<void> {
  await rest("purchases", { method: "POST", body: JSON.stringify({ code, product }), prefer: "return=minimal" });
}

export async function setPurchaseSession(code: string, session: string): Promise<void> {
  await rest(`purchases?code=eq.${code}`, {
    method: "PATCH",
    body: JSON.stringify({ stripe_session: session }),
    prefer: "return=minimal",
  });
}

/** Pending → active once paid. Idempotent; never re-activates a revoked code. */
export async function activatePurchase(code: string, details: { email?: string | null; paymentIntent?: string | null }): Promise<void> {
  await rest(`purchases?code=eq.${code}&status=eq.pending`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "active",
      paid_at: new Date().toISOString(),
      email: details.email ?? null,
      payment_intent: details.paymentIntent ?? null,
    }),
    prefer: "return=minimal",
  });
}

/** Refund or dispute: switch off every code paid with this payment. */
export async function revokeByPaymentIntent(paymentIntent: string): Promise<void> {
  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntent)) return;
  await rest(`purchases?payment_intent=eq.${paymentIntent}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "revoked" }),
    prefer: "return=minimal",
  });
}

export type ClaimResult =
  | { ok: true; product: string; code: string }
  | { ok: false; reason: "unknown" | "pending" | "revoked" | "device_limit" };

/** Register this device for the code, within its device limit (atomic, in SQL). */
export async function claimDevice(code: string, device: string): Promise<ClaimResult> {
  return (await rest("rpc/claim_device", {
    method: "POST",
    body: JSON.stringify({ p_code: code, p_device: device }),
  })) as ClaimResult;
}

/** The products of those codes that are active and registered to this device. */
export async function deviceProducts(codes: string[], device: string): Promise<string[]> {
  if (!codes.length) return [];
  return ((await rest("rpc/device_products", {
    method: "POST",
    body: JSON.stringify({ p_codes: codes, p_device: device }),
  })) as string[] | null) ?? [];
}
