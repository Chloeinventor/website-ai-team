import { NextResponse } from "next/server";

import { getOrder, updateOrder } from "@/lib/orders/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * LAUNCH-DAY FALLBACK ONLY — the "I've paid" form.
 *
 * Records what the buyer says they paid and parks the order as `pending` for a
 * human to match against the gateway dashboard. This route disappears the day
 * all three rails have live keys. It deliberately does NOT mark anything paid.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch(() => null)) as {
    reference?: string;
    email?: string;
  } | null;

  const claimedReference = body?.reference?.trim();
  const email = body?.email?.trim();

  if (!claimedReference || !email) {
    return NextResponse.json(
      { error: "A payment reference and an email are both required" },
      { status: 400 },
    );
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That email looks off" }, { status: 400 });
  }

  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ status: order.status });
  }

  const updated = updateOrder(
    order.id,
    { status: "pending", claimedReference, customerEmail: email },
    { event: "order.claimed", note: `ref ${claimedReference} from ${email}` },
  );

  console.info(
    `[orders] MANUAL REVIEW NEEDED — ${order.id} (${order.provider}) claims ref "${claimedReference}" for ${email}`,
  );

  return NextResponse.json({ status: updated?.status ?? "pending" });
}
