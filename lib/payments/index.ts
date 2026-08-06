import { hitpayProvider } from "./hitpay";
import { paymongoProvider } from "./paymongo";
import { revolutProvider } from "./revolut";
import type {
  OrderDraft,
  PaymentProvider,
  PaymentRequest,
  ProviderId,
} from "./types";

export const PROVIDERS: Record<ProviderId, PaymentProvider> = {
  revolut: revolutProvider,
  paymongo: paymongoProvider,
  hitpay: hitpayProvider,
};

export function getProvider(id: ProviderId): PaymentProvider {
  return PROVIDERS[id];
}

/** Shape the buyer's rail picker renders. Safe to serialise to the client. */
export interface ProviderSummary {
  id: ProviderId;
  label: string;
  sublabel: string;
  region: string;
  currency: PaymentProvider["currency"];
  /** false → this rail falls back to the manual QR + "I've paid" form. */
  live: boolean;
}

export function providerSummaries(): ProviderSummary[] {
  return (Object.values(PROVIDERS) as PaymentProvider[]).map((provider) => ({
    id: provider.id,
    label: provider.label,
    sublabel: provider.sublabel,
    region: provider.region,
    currency: provider.currency,
    live: provider.isConfigured(),
  }));
}

/**
 * LAUNCH-DAY FALLBACK — temporary, delete once all three gateways are approved.
 *
 * Gateway approval takes anywhere from same-day to a few business days. Until a
 * rail has keys, Buy Now serves a QR image you exported from that gateway's own
 * dashboard (drop it at public/qr/<provider>.png) and asks the buyer for their
 * payment reference. That creates a `pending` order a human confirms — nothing
 * here pretends to be automatic. See README → "Flipping a rail to automatic".
 */
export function fallbackPaymentRequest(
  providerId: ProviderId,
  order: OrderDraft,
): PaymentRequest {
  const provider = getProvider(providerId);

  return {
    provider: providerId,
    providerOrderId: `manual_${order.reference}`,
    checkoutUrl: "",
    qrDataUrl: `/qr/${providerId}.png`,
    qrSource: "manual-upload",
    mode: "fallback",
    instructions: [
      `Pay with ${provider.label} using the QR above, then paste your reference below.`,
      "You'll get access by email within [one business day] once it's matched.",
      "This rail isn't automatic yet — it's waiting on gateway approval.",
    ],
  };
}

export type { PaymentProvider, PaymentRequest, ProviderId } from "./types";
