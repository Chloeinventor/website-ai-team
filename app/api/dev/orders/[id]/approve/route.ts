import { NextResponse } from "next/server";

import { approvePendingOrder } from "@/lib/fulfillment";
import { getOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV ONLY — the missing half of the manual fallback.
 *
 * Releases a `pending` order as if a human had matched it against the gateway
 * dashboard: flips it to paid, runs fulfillment once, unlocks the download.
 * 404s in production so it can never be reached on a deployed site — approving
 * your own orders over HTTP is exactly the kind of thing that shouldn't ship.
 *
 * Delete this alongside the rest of the fallback path once all three rails have
 * live keys (README §3).
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const approved = await approvePendingOrder(params.id);

  return NextResponse.json({
    id: approved?.id,
    reference: approved?.reference,
    status: approved?.status,
    paidAt: approved?.paidAt,
  });
}
