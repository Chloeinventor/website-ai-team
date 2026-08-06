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
 * PayNow (MariBank and every other SG bank) — via HitPay payment requests.
 *
 * Why a gateway at all: MariBank is a PayNow participant, so a STATIC QR copied
 * out of the app does move money — but it carries no order reference, so nothing
 * can reconcile it except a human reading a bank feed. HitPay issues a DYNAMIC,
 * per-transaction PayNow request instead: amount locked, reference attached,
 * webhook on completion.
 *
 * Docs to re-check before go-live: docs.hitpayapp.com
 *  - POST /v1/payment-requests (form-encoded, `X-BUSINESS-API-KEY`).
 *  - Response carries `url` plus, for PayNow, a `qr_code_data.qr_code` EMV
 *    payload — we prefer that over encoding the URL, because it is the real
 *    PayNow string a banking app expects.
 */

const API_BASE = (
  process.env.HITPAY_API_BASE ?? "https://api.sandbox.hit-pay.com/v1"
).replace(/\/$/, "");

export const hitpayProvider: PaymentProvider = {
  id: "hitpay",
  label: "PayNow · MariBank",
  sublabel: "Any SG bank app · via HitPay",
  region: "Singapore · SGD",
  currency: "SGD",

  isConfigured() {
    return Boolean(process.env.HITPAY_API_KEY);
  },

  async createPaymentRequest(order: OrderDraft): Promise<PaymentRequest> {
    const form = new URLSearchParams();
    form.set("amount", (order.amountMinor / 100).toFixed(2));
    form.set("currency", order.currency);
    form.set("payment_methods[]", "paynow_online");
    form.set("reference_number", order.reference);
    form.set("purpose", order.productName);
    form.set("redirect_url", `${order.origin}/orders/${order.id}`);
    form.set("webhook", `${order.origin}/api/webhooks/hitpay`);
    form.set("channel", "api_other");
    if (order.customerEmail) form.set("email", order.customerEmail);

    const res = await fetch(`${API_BASE}/payment-requests`, {
      method: "POST",
      headers: {
        "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY ?? "",
        "Content-Type": "application/x-www-form-urlencoded",
        // HitPay only returns JSON when it thinks it's an XHR.
        "X-Requested-With": "XMLHttpRequest",
      },
      body: form.toString(),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => null)) as
      | {
          id?: string;
          url?: string;
          expiry_date?: string;
          qr_code_data?: { qr_code?: string };
          message?: string;
        }
      | null;

    if (!res.ok || !body?.id || !body.url) {
      throw new PaymentProviderError(
        `HitPay rejected the payment request: ${body?.message ?? res.statusText}`,
        res.status,
      );
    }

    // Prefer the real PayNow EMV payload; fall back to the hosted URL.
    const emv = body.qr_code_data?.qr_code;

    return {
      provider: "hitpay",
      providerOrderId: body.id,
      checkoutUrl: body.url,
      qrDataUrl: await encodeQr(emv ?? body.url),
      qrSource: emv ? "provider-payload" : "encoded-checkout-url",
      mode: "live",
      expiresAt: body.expiry_date,
      instructions: [
        "Open MariBank (or any SG bank app) → Scan & Pay.",
        "The amount and reference are already filled in — don't edit them.",
        "This page flips to Paid on its own once PayNow settles.",
      ],
    };
  },

  async verifyWebhook(
    payload: RawWebhook,
    signature: string | null,
  ): Promise<NormalizedEvent> {
    const salt = process.env.HITPAY_WEBHOOK_SALT;
    if (!salt) {
      throw new WebhookVerificationError("HITPAY_WEBHOOK_SALT is not set");
    }

    // HitPay has two generations of webhook in the wild.
    if (signature) {
      // v2: raw-body HMAC in the `hitpay-signature` header.
      const expected = crypto
        .createHmac("sha256", salt)
        .update(payload.rawBody)
        .digest("hex");
      if (!safeCompare(signature.trim(), expected)) {
        throw new WebhookVerificationError("Signature mismatch");
      }
      const event = JSON.parse(payload.rawBody) as {
        payment_id?: string;
        payment_request_id?: string;
        reference_number?: string;
        amount?: string | number;
        currency?: string;
        status?: string;
      };
      return normalise(event);
    }

    // v1: form-encoded body with an `hmac` field over the sorted key+value pairs.
    const fields = Object.fromEntries(
      new URLSearchParams(payload.rawBody).entries(),
    ) as Record<string, string>;

    const provided = fields.hmac;
    if (!provided) {
      throw new WebhookVerificationError("Missing hmac field");
    }

    const signingString = Object.keys(fields)
      .filter((key) => key !== "hmac")
      .sort()
      .map((key) => `${key}${fields[key]}`)
      .join("");

    const expected = crypto
      .createHmac("sha256", salt)
      .update(signingString)
      .digest("hex");

    if (!safeCompare(provided, expected)) {
      throw new WebhookVerificationError("Signature mismatch");
    }

    return normalise(fields);
  },
};

function normalise(event: {
  payment_id?: string;
  payment_request_id?: string;
  reference_number?: string;
  amount?: string | number;
  currency?: string;
  status?: string;
}): NormalizedEvent {
  const status = (event.status ?? "").toLowerCase();
  const amount = Number(event.amount);

  return {
    type:
      status === "completed" || status === "succeeded"
        ? "order.paid"
        : status === "failed" || status === "expired"
          ? "order.failed"
          : "ignored",
    provider: "hitpay",
    providerOrderId: event.payment_request_id ?? event.payment_id,
    reference: event.reference_number,
    amountMinor: Number.isFinite(amount) ? Math.round(amount * 100) : undefined,
    currency: event.currency?.toUpperCase(),
    providerEvent: `payment.${status || "unknown"}`,
  };
}
