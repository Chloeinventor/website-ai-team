import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ProductActions, ProductSandbox } from "@/components/product-actions";
import { NODE_COLOR } from "@/lib/node-colors";
import { formatPrice, getProduct, PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: `Not found — ${SITE.name}` };
  return {
    title: `${product.name} — ${SITE.name}`,
    description: product.outcome,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  return (
    <>
      <Nav />
      <main id="main">
        <div className="shell py-12">
          <Link
            href="/#products"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
          >
            ← all workflows
          </Link>

          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <div>
              <h1 className="text-balance text-display font-semibold">
                {product.name}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-ink-soft">
                {product.outcome} {product.blurb}
              </p>

              <div className="mt-8">
                <ProductActions slug={product.slug} />
              </div>

              <h2 className="mt-14 text-xl font-semibold tracking-tight">
                The four nodes
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.steps.map((step, index) => (
                  <li key={step.label} className="card p-4">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${NODE_COLOR[step.kind].dot}`} />
                      <span
                        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${NODE_COLOR[step.kind].text}`}
                      >
                        0{index + 1} · {step.kind}
                      </span>
                    </span>
                    <p className="mt-2 font-medium">{step.label}</p>
                    <p className="mt-1 text-sm text-ink-muted">{step.detail}</p>
                  </li>
                ))}
              </ol>

              <h2 className="mt-12 text-xl font-semibold tracking-tight">
                Try it on your own data
              </h2>
              <p className="mt-2 max-w-xl text-ink-soft">
                Runs in your browser. Nothing is sent anywhere, and nothing asks
                you to sign up.
              </p>
              <div className="card mt-5 p-5 sm:p-6">
                <ProductSandbox slug={product.slug} />
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-5">
                <p className="font-mono text-2xl font-medium">
                  {formatPrice(product.priceMinor.EUR, "EUR")}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ink-muted">
                  {formatPrice(product.priceMinor.PHP, "PHP")} ·{" "}
                  {formatPrice(product.priceMinor.SGD, "SGD")} · {product.billing}
                </p>

                <div className="mt-5">
                  <ProductActions slug={product.slug} size="sm" />
                </div>

                <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      Setup time
                    </dt>
                    <dd className="mt-0.5">{product.setupTime}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      Runs on
                    </dt>
                    <dd className="mt-0.5">{product.runsOn.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      What you get
                    </dt>
                    <dd className="mt-1">
                      <ul className="space-y-1.5">
                        {product.includes.map((item) => (
                          <li key={item} className="flex gap-2 text-ink-soft">
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-node-action" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="mt-4 px-1 font-mono text-[11px] leading-relaxed text-ink-muted">
                Pay with Revolut, GCash or PayNow · [14-day] refund · you keep the
                workflow file.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
