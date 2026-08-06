import { NextResponse } from "next/server";

import { getOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Polled by the QR sheet and the confirmation page while a payment is open. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: order.id,
      reference: order.reference,
      status: order.status,
      mode: order.mode,
      provider: order.provider,
      productName: order.productName,
      productSlug: order.productSlug,
      amountMinor: order.amountMinor,
      currency: order.currency,
      customerEmail: order.customerEmail,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
