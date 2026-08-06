import { getOrder, updateOrder, type Order } from "@/lib/orders/store";
import type { NormalizedEvent } from "@/lib/payments/types";

/**
 * The single fulfillment path. All three rails normalise into `order.paid`
 * before they get here, so this is written once — adding a fourth gateway means
 * adding a provider file, not another branch in here.
 */
export async function handlePaymentEvent(
  event: NormalizedEvent,
  order: Order,
): Promise<Order | undefined> {
  if (event.type === "order.failed") {
    return updateOrder(
      order.id,
      { status: "failed" },
      { event: "order.failed", note: event.providerEvent },
    );
  }

  if (event.type !== "order.paid") return order;

  // Webhooks retry. Confirming an already-paid order must be a no-op.
  if (order.status === "paid") {
    console.info(`[fulfillment] duplicate order.paid ignored: ${order.id}`);
    return order;
  }

  // Amount check where the gateway tells us one — a mismatched amount means
  // something is wrong with the order, not with the buyer.
  if (
    typeof event.amountMinor === "number" &&
    event.amountMinor !== order.amountMinor
  ) {
    console.warn(
      `[fulfillment] amount mismatch on ${order.id}: expected ${order.amountMinor}, got ${event.amountMinor}`,
    );
  }

  const paid = updateOrder(
    order.id,
    {
      status: "paid",
      paidAt: new Date().toISOString(),
      providerOrderId: event.providerOrderId ?? order.providerOrderId,
    },
    { event: "order.paid", note: `${event.provider}:${event.providerEvent}` },
  );

  await deliver(paid ?? order);
  return paid;
}

/**
 * Minimum viable fulfillment: log it loudly enough to act on, and let the
 * confirmation page do the talking.
 *
 * TODO (before launch): send the receipt + workflow JSON. Two lines with Resend
 * or your SMTP of choice — the order object already carries everything needed.
 */
async function deliver(order: Order): Promise<void> {
  console.info(
    `[fulfillment] deliver ${order.productName} → ${order.customerEmail ?? "(no email captured)"} ` +
      `| order ${order.id} | ref ${order.reference} | ${order.provider} | ${order.amountMinor} ${order.currency}`,
  );
}

/** Fallback path: a human confirmed a `pending` order matched a real payment. */
export async function approvePendingOrder(
  orderId: string,
): Promise<Order | undefined> {
  const order = getOrder(orderId);
  if (!order || order.status === "paid") return order;

  const paid = updateOrder(
    orderId,
    { status: "paid", paidAt: new Date().toISOString() },
    { event: "order.paid", note: "manually approved (fallback rail)" },
  );

  if (paid) await deliver(paid);
  return paid;
}
