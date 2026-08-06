import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { OrderStatus, type PublicOrder } from "@/components/order-status";
import { getOrder } from "@/lib/orders/store";
import { formatPrice, getProduct } from "@/lib/products";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Your order — ${SITE.name}`,
  robots: { index: false },
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const order = getOrder(params.id);

  if (!order) {
    return (
      <>
        <Nav />
        <main id="main" className="shell py-20">
          <h1 className="text-section font-semibold">
            I can&apos;t find that order.
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            Orders live in memory in this v1 build, so a redeploy or a different
            server instance can lose the thread (see the README — swapping in a
            real database is the first TODO). If you paid, email{" "}
            <a className="underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>{" "}
            with your reference and it&apos;ll be sorted the same day.
          </p>
          <Link href="/" className="btn-ghost mt-8">
            Back to the shelf
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const product = getProduct(order.productSlug);

  const initial: PublicOrder = {
    id: order.id,
    reference: order.reference,
    status: order.status,
    mode: order.mode,
    provider: order.provider,
    productName: order.productName,
    amount: formatPrice(order.amountMinor, order.currency),
  };

  return (
    <>
      <Nav />
      <main id="main" className="shell py-14">
        <OrderStatus initial={initial} />

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <p className="eyebrow">What happens next</p>
            <ol className="mt-4 space-y-4">
              {[
                {
                  title: "Download the workflow",
                  body: "[workflow.json] — import it into your own n8n or Make account. It's yours; nothing runs on my infrastructure.",
                },
                {
                  title: `Wire up your accounts (${product?.setupTime ?? "[~40 min]"})`,
                  body: "The setup checklist names every credential you'll need, in the order you'll need it.",
                },
                {
                  title: "Run it once on a real record",
                  body: "Same as the sandbox you tried, except now it's writing to your systems.",
                },
                {
                  title: "Break it, and email me",
                  body: `[30 days] of fixes are included. ${SITE.email} — I answer my own mail.`,
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 font-mono text-[11px] text-ink-muted">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{step.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            {order.status === "paid" ? (
              <button type="button" className="btn-solid mt-6" disabled>
                [Download workflow.json]
              </button>
            ) : (
              <p className="mt-6 font-mono text-[11px] text-ink-muted">
                the download unlocks the moment payment confirms
              </p>
            )}
          </div>

          <div className="card p-6">
            <p className="eyebrow">Order log</p>
            <ul className="mt-4 space-y-2.5">
              {order.events.map((event) => (
                <li
                  key={`${event.at}-${event.event}`}
                  className="flex flex-wrap items-baseline gap-x-3 font-mono text-[12px]"
                >
                  <span className="text-ink-muted">
                    {new Date(event.at).toLocaleTimeString()}
                  </span>
                  <span className="font-medium">{event.event}</span>
                  {event.note ? (
                    <span className="text-ink-muted">{event.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-line pt-4 text-sm text-ink-soft">
              Wrong amount, wrong product, or changed your mind? [14-day] refund,
              no argument —{" "}
              <a className="underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
