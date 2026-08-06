import { handleProviderWebhook } from "@/lib/payments/webhook-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PayMongo → checkout_session.payment.paid / payment.paid / payment.failed. */
export async function POST(request: Request) {
  return handleProviderWebhook("paymongo", request, "paymongo-signature");
}
