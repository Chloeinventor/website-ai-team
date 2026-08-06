"use client";

import Link from "next/link";

import { useStore } from "@/components/store-provider";
import { NODE_COLOR } from "@/lib/node-colors";
import { formatPrice, PRODUCTS, type Product } from "@/lib/products";

export function ProductShelf() {
  return (
    <section id="products" className="scroll-mt-24 py-16 sm:py-20">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">The shelf</p>
          <h2 className="mt-3 text-section font-semibold">
            Four workflows, priced like software, delivered like a build.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Each one is a finished automation I run myself. Try it on your own
            data first — the demo takes about fifteen seconds and asks you for
            nothing.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {/* min-w-0 on each item: the mini-flow's nowrap labels would otherwise
              set the grid track's automatic minimum and push the page sideways. */}
          {PRODUCTS.map((product) => (
            <li key={product.slug} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { openBuy, openTry } = useStore();

  return (
    <article className="card group flex h-full flex-col p-5 transition-shadow duration-200 hover:shadow-lift">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-node-agent"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-ink-soft">{product.outcome}</p>
        </div>
        {product.flagship ? (
          <span className="chip shrink-0 border-node-agent/30 text-node-agent">
            flagship
          </span>
        ) : null}
      </div>

      <MiniFlow product={product} />

      <p className="mt-4 text-sm leading-relaxed text-ink-muted">{product.blurb}</p>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="font-mono text-xl font-medium">
            {formatPrice(product.priceMinor.EUR, "EUR")}
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            or {formatPrice(product.priceMinor.PHP, "PHP")} ·{" "}
            {formatPrice(product.priceMinor.SGD, "SGD")}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => openTry(product.slug)}
          >
            Try it free
          </button>
          <button
            type="button"
            className="btn-solid btn-sm"
            onClick={() => openBuy(product.slug)}
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}

/** The card's tiny preview: the real four nodes, lighting up on hover. */
function MiniFlow({ product }: { product: Product }) {
  return (
    <div
      aria-hidden
      className="dotgrid mt-4 flex items-center gap-1.5 overflow-hidden rounded-node border border-line bg-canvas/70 px-2.5 py-3"
    >
      {product.steps.map((step, index) => (
        <div key={step.label} className="flex min-w-0 flex-1 items-center gap-1.5">
          <div className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2 py-1.5 shadow-[0_1px_0_0_rgba(21,27,38,0.04)]">
            <span
              className={`mb-1 block h-1.5 w-1.5 rounded-full ${NODE_COLOR[step.kind].dot} opacity-70 transition group-hover:animate-pulseNode group-hover:opacity-100`}
              style={{ animationDelay: `${index * 0.16}s` }}
            />
            <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">
              {step.label}
            </span>
          </div>
          {index < product.steps.length - 1 ? (
            <span className="h-px w-3 shrink-0 bg-line-strong" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
