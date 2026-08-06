import crypto from "node:crypto";

import { encodeQr } from "@/lib/qr";
import {
  PaymentProviderError,
  WebhookVerificationError,
  type NormalizedEvent,
  type OrderDraft,
  type PaymentProvider,
  type PaymentRequest,
  type RawWebhook,
} from "./types";
import { safeCompare } from "./util";

/**
 * Revolut — Merchant API orders (the thing behind a Revolut Payment Link).
 *
 * Docs to re-check before go-live: developer.revolut.com/docs/merchant
 *  - POST /orders returns a hosted `checkout_url`; we encode THAT into the QR,
 *    so every scan carries the order id. No static wallet QR anywhere.
 *  - Webhooks are signed `v1=<hmac>` over `v1.{timestamp}.{rawBody}`.
 */

const API_VERSION = process.env.REVOLUT_API_VERSION ?? "2024-09-01";

function apiBase(): string {
  return (
    process.env.REVOLUT_API_BASE ?? "https://sandbox-merchant.revolut.com/api"
  ).replace(/\/$/, "");
}

/** Reject replayed webhooks. Revolut recommends a few minutes of tolerance. */
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

export const revolutProvider: PaymentProvider = {
  id: "revolut",
  label: "Revolut",
  sublabel: "Card, Revolut Pay, or scan to pay",
  region: "Europe / UK · EUR",
  currency: "EUR",

  isConfigured() {
    return Boolean(process.env.REVOLUT_API_KEY);
  },

  async createPaymentRequest(order: OrderDraft): Promise<PaymentRequest> {
    const res = await fetch(`${apiBase()}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REVOLUT_API_KEY}`,
        "Revolut-Api-Version": API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: order.amountMinor,
        currency: order.currency,
        description: `${order.productName} — ${order.reference}`,
        merchant_order_data: {
          reference: order.reference,
        },
        redirect_url: `${order.origin}/orders/${order.id}`,
        ...(order.customerEmail
          ? { customer: { email: order.customerEmail } }
          : {}),
      }),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => null)) as
      | {
          id?: string;
          checkout_url?: string;
          token?: string;
          message?: string;
        }
      | null;

    if (!res.ok || !body?.id || !body.checkout_url) {
      throw new PaymentProviderError(
        `Revolut rejected the order: ${body?.message ?? res.statusText}`,
        res.status,
      );
    }

    return {
      provider: "revolut",
      providerOrderId: body.id,
      checkoutUrl: body.checkout_url,
      qrDataUrl: await encodeQr(body.checkout_url),
      qrSource: "encoded-checkout-url",
      mode: "live",
      instructions: [
        "Scan with your phone camera, or open the link on this device.",
        "Pay by card or with Revolut Pay — you'll land back here.",
        "This page flips to Paid on its own the moment Revolut confirms.",
      ],
    };
  },

  async verifyWebhook(
    payload: RawWebhook,
    signature: string | null,
  ): Promise<NormalizedEvent> {
    const secret = process.env.REVOLUT_WEBHOOK_SECRET;
    if (!secret) {
      throw new WebhookVerificationError("REVOLUT_WEBHOOK_SECRET is not set");
    }

    const timestamp = payload.headers["revolut-request-timestamp"];
    if (!signature || !timestamp) {
      throw new WebhookVerificationError("Missing signature or timestamp");
    }

    const age = Math.abs(Date.now() - Number(timestamp));
    if (!Number.isFinite(age) || age > TIMESTAMP_TOLERANCE_MS) {
      throw new WebhookVerificationError("Timestamp outside tolerance");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`v1.${timestamp}.${payload.rawBody}`)
      .digest("hex");

    // The header can carry several signatures during a secret rotation.
    const candidates = signature
      .split(/[\s,]+/)
      .map((part) => part.replace(/^v1=/, "").trim())
      .filter(Boolean);

    if (!candidates.some((candidate) => safeCompare(candidate, expected))) {
      throw new WebhookVerificationError("Signature mismatch");
    }

    const event = JSON.parse(payload.rawBody) as {
      event?: string;
      order_id?: string;
      merchant_order_ext_ref?: string;
    };

    const type: NormalizedEvent["type"] =
      event.event === "ORDER_COMPLETED"
        ? "order.paid"
        : event.event === "ORDER_CANCELLED" || event.event === "ORDER_FAILED"
          ? "order.failed"
          : "ignored";

    return {
      type,
      provider: "revolut",
      providerOrderId: event.order_id,
      reference: event.merchant_order_ext_ref,
      providerEvent: event.event,
    };
  },
};
