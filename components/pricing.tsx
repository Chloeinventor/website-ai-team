"use client";

import { useStore } from "@/components/store-provider";
import { formatPrice, PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";

/** Shown on the landing page and again, on its own, at /pricing. */
export function Pricing({ heading = true }: { heading?: boolean }) {
  const { openBuy, openTry } = useStore();

  return (
    <section id="pricing" className="scroll-mt-24 py-16 sm:py-20">
      <div className="shell">
        {heading ? (
          <div className="max-w-2xl">
            <p className="eyebrow">Pricing</p>
            <h2 className="mt-3 text-section font-semibold">
              Pay once. It&apos;s yours, including the JSON.
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              No seats, no monthly floor, no usage meter I control. You run these
              on your own accounts, so the only recurring cost is whatever your
              own tools already charge you.
            </p>
          </div>
        ) : null}

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <caption className="sr-only">
              Prices for each workflow across all three payment rails
            </caption>
            <thead>
              <tr className="text-left">
                {["Workflow", "What it does", "EUR", "PHP", "SGD", ""].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="border-b border-line pb-3 font-mono text-[11px] uppercase tracking-[0.14em] font-normal text-ink-muted"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((product) => (
                <tr key={product.slug} className="align-top">
                  <th scope="row" className="border-b border-line py-4 pr-4 text-left font-semibold">
                    {product.name}
                    <span className="mt-1 block font-mono text-[11px] font-normal text-ink-muted">
                      setup {product.setupTime}
                    </span>
                  </th>
                  <td className="border-b border-line py-4 pr-6 text-sm text-ink-soft">
                    {product.outcome}
                  </td>
                  {(["EUR", "PHP", "SGD"] as const).map((currency) => (
                    <td
                      key={currency}
                      className="border-b border-line py-4 pr-6 font-mono text-sm"
                    >
                      {formatPrice(product.priceMinor[currency], currency)}
                    </td>
                  ))}
                  <td className="border-b border-line py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => openTry(product.slug)}
                      >
                        Try free
                      </button>
                      <button
                        type="button"
                        className="btn-solid btn-sm"
                        onClick={() => openBuy(product.slug)}
                      >
                        Buy now
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card mt-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="eyebrow">Or: none of the above</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              Custom build — [€2,400] to start, or [€1,600/mo] to keep me around.
            </h3>
            <p className="mt-2 text-ink-soft">
              For the workflow that doesn&apos;t exist yet. This is the one thing
              on the page that needs a conversation first — because scoping it
              honestly takes twenty minutes and a few awkward questions.
            </p>
          </div>
          <a
            href={SITE.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost shrink-0"
          >
            Book 30 minutes ↗
          </a>
        </div>
      </div>
    </section>
  );
}
