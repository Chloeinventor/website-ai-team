import { type Lang, isProduct } from "@/lib/games/catalog";
import { newCode } from "@/lib/games/code";
import { createPendingPurchase, isDbConfigured, setPurchaseSession } from "@/lib/games/db";
import { clientIp, json } from "@/lib/games/http";
import { createCheckoutSession, isStripeConfigured } from "@/lib/games/stripe";
import { checkRateLimit } from "@/lib/email/rate-limit";
import { originFrom } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Buy a level or the bundle: a new code (pending until paid) and a Stripe Checkout page. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { product?: unknown; lang?: unknown; consent?: unknown } | null;
  if (!body || !isProduct(body.product)) return json({ error: "Unknown product" }, { status: 400 });
  if (body.consent !== true) return json({ error: "Consent to immediate delivery is required" }, { status: 400 });
  if (!isStripeConfigured() || !isDbConfigured()) return json({ error: "not_configured" }, { status: 503 });
  if (!checkRateLimit(`games-checkout:${clientIp(request)}`, { limit: 20 }).ok) return json({ error: "Too many tries" }, { status: 429 });

  const lang: Lang = body.lang === "en" ? "en" : "da";
  const code = newCode();
  try {
    await createPendingPurchase(code, body.product);
    const session = await createCheckoutSession({ code, product: body.product, lang, origin: originFrom(request.headers) });
    await setPurchaseSession(code, session.id);
    return json({ url: session.url });
  } catch (error) {
    console.error(`[games checkout] ${(error as Error).message}`);
    return json({ error: "Checkout failed" }, { status: 502 });
  }
}
