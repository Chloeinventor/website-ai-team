import { handleProviderWebhook } from "@/lib/payments/webhook-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revolut Merchant API → ORDER_COMPLETED / ORDER_CANCELLED / ORDER_FAILED. */
export async function POST(request: Request) {
  return handleProviderWebhook("revolut", request, "revolut-signature");
}
