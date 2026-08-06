"use client";

import { useEffect, useState } from "react";

export interface PublicOrder {
  id: string;
  reference: string;
  status: "created" | "pending" | "paid" | "failed";
  mode: "live" | "fallback";
  provider: string;
  productName: string;
  amount: string;
}

const COPY: Record<
  PublicOrder["status"],
  { badge: string; tone: string; title: string; body: string }
> = {
  created: {
    badge: "waiting on payment",
    tone: "bg-node-trigger",
    title: "Nothing's landed yet.",
    body: "This page updates itself the moment the gateway confirms — leave it open, or close it and check the email receipt.",
  },
  pending: {
    badge: "logged · manual check",
    tone: "bg-node-trigger",
    title: "Got your reference. I'll match it by hand.",
    body: "This rail is still waiting on gateway approval, so a person confirms it. You'll have access by email within [one business day].",
  },
  paid: {
    badge: "paid",
    tone: "bg-node-action",
    title: "Paid. It's yours.",
    body: "Everything below is unlocked, and a copy is on its way to your email.",
  },
  failed: {
    badge: "failed",
    tone: "bg-node-output",
    title: "The payment didn't go through.",
    body: "Nothing was charged. Try another rail, or reply to the email and I'll sort it out with you.",
  },
};

/** Polls until the webhook lands, then stops. */
export function OrderStatus({ initial }: { initial: PublicOrder }) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    if (order.status === "paid" || order.status === "failed") return;

    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const next = (await res.json()) as { status: PublicOrder["status"] };
        if (next.status !== order.status) {
          setOrder((prev) => ({ ...prev, status: next.status }));
        }
      } catch {
        // Retry on the next tick.
      }
    }, 3000);

    return () => window.clearInterval(id);
  }, [order.id, order.status]);

  const copy = COPY[order.status];

  return (
    <div>
      <p className="chip">
        <span className={`h-1.5 w-1.5 rounded-full ${copy.tone}`} />
        {copy.badge}
      </p>
      <h1 className="mt-4 text-balance text-display font-semibold">{copy.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-soft">{copy.body}</p>

      <dl className="mt-8 grid max-w-lg grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
        {[
          { label: "Order", value: order.reference },
          { label: "Product", value: order.productName },
          { label: "Amount", value: order.amount },
          { label: "Rail", value: order.provider },
        ].map((field) => (
          <div key={field.label}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {field.label}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
