import { normalizeCode } from "@/lib/games/code";
import { activatePurchase, revokeByPaymentIntent } from "@/lib/games/db";
import { json } from "@/lib/games/http";
import { readSession, verifyWebhook } from "@/lib/games/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Subscribe to: checkout.session.completed,
 * checkout.session.async_payment_succeeded, charge.refunded, charge.dispute.created.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: "not_configured" }, { status: 503 });
  const payload = await request.text();
  if (!verifyWebhook(payload, request.headers.get("stripe-signature"), secret)) {
    return json({ error: "Bad signature" }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  const obj = event.data.object;
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = readSession(obj);
        const code = normalizeCode(s.code);
        if (s.paid && code) await activatePurchase(code, { email: s.email, paymentIntent: s.paymentIntent });
        break;
      }
      case "charge.refunded":
        if (obj.refunded === true && typeof obj.payment_intent === "string") await revokeByPaymentIntent(obj.payment_intent);
        break;
      case "charge.dispute.created":
        if (typeof obj.payment_intent === "string") await revokeByPaymentIntent(obj.payment_intent);
        break;
    }
  } catch (error) {
    console.error(`[games webhook] ${event.type}: ${(error as Error).message}`);
    return json({ error: "Handler failed" }, { status: 500 }); // Stripe retries
  }
  return json({ received: true });
}
