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
 * GCash — via PayMongo Checkout Sessions.
 *
 * Docs to re-check before go-live: developers.paymongo.com
 *  - A Checkout Session is created per order and returns a hosted
 *    `checkout_url`. GCash opens from there; we encode the same URL as the QR
 *    so a phone scan lands on the same, order-scoped session.
 *  - Webhook header `paymongo-signature: t=<ts>,te=<test>,li=<live>`,
 *    signed over `${t}.${rawBody}`.
 */

const API_BASE = (
  process.env.PAYMONGO_API_BASE ?? "https://api.paymongo.com/v1"
).replace(/\/$/, "");

const TIMESTAMP_TOLERANCE_S = 5 * 60;

function authHeader(): string {
  const key = process.env.PAYMONGO_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export const paymongoProvider: PaymentProvider = {
  id: "paymongo",
  label: "GCash",
  sublabel: "GCash, Maya, or card · via PayMongo",
  region: "Philippines · PHP",
  currency: "PHP",

  isConfigured() {
    return Boolean(process.env.PAYMONGO_SECRET_KEY);
  },

  async createPaymentRequest(order: OrderDraft): Promise<PaymentRequest> {
    const res = await fetch(`${API_BASE}/checkout_sessions`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                name: order.productName,
                quantity: 1,
                amount: order.amountMinor,
                currency: order.currency,
              },
            ],
            payment_method_types: ["gcash", "paymaya", "card"],
            reference_number: order.reference,
            description: `${order.productName} — ${order.reference}`,
            send_email_receipt: false,
            show_line_items: true,
            success_url: `${order.origin}/orders/${order.id}`,
            cancel_url: `${order.origin}/orders/${order.id}?cancelled=1`,
            ...(order.customerEmail ? { billing: { email: order.customerEmail } } : {}),
          },
        },
      }),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => null)) as
      | {
          data?: {
            id?: string;
            attributes?: { checkout_url?: string };
          };
          errors?: { detail?: string }[];
        }
      | null;

    const checkoutUrl = body?.data?.attributes?.checkout_url;
    if (!res.ok || !body?.data?.id || !checkoutUrl) {
      throw new PaymentProviderError(
        `PayMongo rejected the checkout session: ${
          body?.errors?.[0]?.detail ?? res.statusText
        }`,
        res.status,
      );
    }

    return {
      provider: "paymongo",
      providerOrderId: body.data.id,
      checkoutUrl,
      qrDataUrl: await encodeQr(checkoutUrl),
      qrSource: "encoded-checkout-url",
      mode: "live",
      instructions: [
        "Scan with your phone, or open the link and pick GCash.",
        "Approve the amount in the GCash app.",
        "This page flips to Paid on its own — no screenshot needed.",
      ],
    };
  },

  async verifyWebhook(
    payload: RawWebhook,
    signature: string | null,
  ): Promise<NormalizedEvent> {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!secret) {
      throw new WebhookVerificationError("PAYMONGO_WEBHOOK_SECRET is not set");
    }
    if (!signature) {
      throw new WebhookVerificationError("Missing paymongo-signature header");
    }

    // t=<unix seconds>,te=<test signature>,li=<live signature>
    const parts = Object.fromEntries(
      signature.split(",").map((chunk) => {
        const [k, v] = chunk.split("=");
        return [k?.trim(), v?.trim()];
      }),
    ) as { t?: string; te?: string; li?: string };

    const isLive = (process.env.PAYMONGO_SECRET_KEY ?? "").startsWith("sk_live");
    const provided = isLive ? parts.li : parts.te;

    if (!parts.t || !provided) {
      throw new WebhookVerificationError("Malformed paymongo-signature header");
    }

    const age = Math.abs(Date.now() / 1000 - Number(parts.t));
    if (!Number.isFinite(age) || age > TIMESTAMP_TOLERANCE_S) {
      throw new WebhookVerificationError("Timestamp outside tolerance");
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${parts.t}.${payload.rawBody}`)
      .digest("hex");

    if (!safeCompare(provided, expected)) {
      throw new WebhookVerificationError("Signature mismatch");
    }

    const event = JSON.parse(payload.rawBody) as {
      data?: {
        attributes?: {
          type?: string;
          data?: {
            id?: string;
            attributes?: {
              reference_number?: string;
              amount?: number;
              currency?: string;
              status?: string;
              payment_intent?: { attributes?: { status?: string } };
            };
          };
        };
      };
    };

    const eventType = event.data?.attributes?.type;
    const resource = event.data?.attributes?.data;
    const attrs = resource?.attributes;

    const paid =
      eventType === "checkout_session.payment.paid" || eventType === "payment.paid";
    const failed = eventType === "payment.failed";

    return {
      type: paid ? "order.paid" : failed ? "order.failed" : "ignored",
      provider: "paymongo",
      providerOrderId: resource?.id,
      reference: attrs?.reference_number,
      amountMinor: attrs?.amount,
      currency: attrs?.currency,
      providerEvent: eventType,
    };
  },
};
