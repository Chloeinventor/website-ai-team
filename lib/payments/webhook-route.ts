import { NextResponse } from "next/server";

import { handlePaymentEvent } from "@/lib/fulfillment";
import { findOrder } from "@/lib/orders/store";
import { getProvider } from "./index";
import { WebhookVerificationError, type ProviderId } from "./types";

/**
 * Shared webhook plumbing: verify → normalise → fulfil.
 * The three routes under /api/webhooks/* are three lines each because every
 * provider hands back the same `order.paid` shape.
 */
export async function handleProviderWebhook(
  providerId: ProviderId,
  request: Request,
  signatureHeader: string,
): Promise<Response> {
  const provider = getProvider(providerId);

  // Signature verification needs the body exactly as sent — read it raw, once.
  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  const signature = request.headers.get(signatureHeader);

  let event;
  try {
    event = await provider.verifyWebhook({ rawBody, headers }, signature);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.warn(`[webhook:${providerId}] rejected — ${error.message}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    console.error(`[webhook:${providerId}] malformed payload`, error);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.type === "ignored") {
    // Ack anything we don't act on, or the gateway will keep retrying it.
    return NextResponse.json({ received: true, ignored: event.providerEvent });
  }

  const order = findOrder({
    providerOrderId: event.providerOrderId,
    reference: event.reference,
  });

  if (!order) {
    // 200, not 404: an unknown order is our problem to investigate, and a
    // retry storm won't fix it.
    console.error(
      `[webhook:${providerId}] no order for providerOrderId=${event.providerOrderId} reference=${event.reference}`,
    );
    return NextResponse.json({ received: true, matched: false });
  }

  const updated = await handlePaymentEvent(event, order);

  return NextResponse.json({
    received: true,
    matched: true,
    status: updated?.status,
  });
}
