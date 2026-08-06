import type { CurrencyCode } from "@/lib/products";

export type ProviderId = "revolut" | "paymongo" | "hitpay";

export const PROVIDER_IDS: ProviderId[] = ["revolut", "paymongo", "hitpay"];

export function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === "string" && PROVIDER_IDS.includes(value as ProviderId)
  );
}

/** What the buyer is paying for. Created before we ever talk to a gateway. */
export interface OrderDraft {
  id: string;
  /** Human-facing reference we send to the gateway and match webhooks against. */
  reference: string;
  productSlug: string;
  productName: string;
  amountMinor: number;
  currency: CurrencyCode;
  customerEmail?: string;
  /** Absolute origin, used to build return + webhook URLs. */
  origin: string;
}

/**
 * The result of asking a gateway for a DYNAMIC, per-transaction payment.
 * Never a static wallet QR: a static QR carries no order reference, so nothing
 * can confirm it automatically — which is the entire point of this flow.
 */
export interface PaymentRequest {
  provider: ProviderId;
  /** Gateway's own id. Webhooks are matched on this first, reference second. */
  providerOrderId: string;
  /** "Or open in app" link. */
  checkoutUrl: string;
  /** PNG data URL. Either the gateway's own QR payload or the checkout URL encoded. */
  qrDataUrl: string;
  qrSource: "provider-payload" | "encoded-checkout-url" | "manual-upload";
  mode: "live" | "fallback";
  expiresAt?: string;
  /** Shown verbatim under the QR. Rail-specific instructions. */
  instructions: string[];
}

export interface RawWebhook {
  rawBody: string;
  headers: Record<string, string>;
}

/**
 * Every gateway normalises into this. Fulfillment is written once against
 * `order.paid`, not three times against three payload shapes.
 */
export interface NormalizedEvent {
  type: "order.paid" | "order.failed" | "ignored";
  provider: ProviderId;
  providerOrderId?: string;
  reference?: string;
  amountMinor?: number;
  currency?: string;
  /** Provider's own event name, kept for the log. */
  providerEvent?: string;
}

export interface PaymentProvider {
  id: ProviderId;
  /** Rail label as the buyer knows it. */
  label: string;
  sublabel: string;
  region: string;
  currency: CurrencyCode;
  /** False when env keys are missing — the UI then offers the fallback path. */
  isConfigured(): boolean;
  createPaymentRequest(order: OrderDraft): Promise<PaymentRequest>;
  /** Throws `WebhookVerificationError` on a bad or missing signature. */
  verifyWebhook(
    payload: RawWebhook,
    signature: string | null,
  ): Promise<NormalizedEvent>;
}

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PaymentProviderError";
  }
}
