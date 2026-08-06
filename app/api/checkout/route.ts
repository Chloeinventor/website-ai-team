import { NextResponse } from "next/server";

import { createOrder, newOrderId, newReference } from "@/lib/orders/store";
import {
  fallbackPaymentRequest,
  getProvider,
} from "@/lib/payments";
import { isProviderId, PaymentProviderError } from "@/lib/payments/types";
import { getProduct } from "@/lib/products";
import { originFrom } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Buy Now → one order, one dynamic payment request on the chosen rail.
 * If that rail has no keys yet, we return the clearly-labelled fallback instead
 * of failing the purchase.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    productSlug?: string;
    provider?: string;
    email?: string;
  } | null;

  if (!body?.productSlug || !isProviderId(body.provider)) {
    return NextResponse.json(
      { error: "productSlug and a valid provider are required" },
      { status: 400 },
    );
  }

  const product = getProduct(body.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const provider = getProvider(body.provider);
  const email = body.email?.trim() || undefined;
  const currency = provider.currency;

  const draft = {
    id: newOrderId(),
    reference: newReference(),
    productSlug: product.slug,
    productName: product.name,
    amountMinor: product.priceMinor[currency],
    currency,
    customerEmail: email,
    origin: originFrom(request.headers),
  };

  let payment;
  let note: string | undefined;

  if (provider.isConfigured()) {
    try {
      payment = await provider.createPaymentRequest(draft);
    } catch (error) {
      // A gateway outage shouldn't be a dead end — drop to the manual rail and
      // say so plainly in the UI.
      const message =
        error instanceof PaymentProviderError
          ? error.message
          : (error as Error).message;
      console.error(`[checkout] ${provider.id} failed: ${message}`);
      payment = fallbackPaymentRequest(provider.id, draft);
      note = "gateway error, served fallback";
    }
  } else {
    payment = fallbackPaymentRequest(provider.id, draft);
    note = "provider not configured, served fallback";
  }

  const order = createOrder({
    id: draft.id,
    reference: draft.reference,
    productSlug: draft.productSlug,
    productName: draft.productName,
    amountMinor: draft.amountMinor,
    currency: draft.currency,
    provider: provider.id,
    providerOrderId: payment.providerOrderId,
    customerEmail: email,
    mode: payment.mode,
  });

  if (note) {
    console.warn(`[checkout] order ${order.id}: ${note}`);
  }

  return NextResponse.json({
    order: {
      id: order.id,
      reference: order.reference,
      status: order.status,
      amountMinor: order.amountMinor,
      currency: order.currency,
      productName: order.productName,
      productSlug: order.productSlug,
    },
    payment,
  });
}
