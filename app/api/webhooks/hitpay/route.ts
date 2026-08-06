import { handleProviderWebhook } from "@/lib/payments/webhook-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * HitPay → PayNow completion.
 * v1 posts form-encoded with an `hmac` field; v2 signs the raw body in the
 * `hitpay-signature` header. The provider handles both.
 */
export async function POST(request: Request) {
  return handleProviderWebhook("hitpay", request, "hitpay-signature");
}
