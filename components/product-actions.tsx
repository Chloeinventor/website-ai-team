"use client";

import { DemoSurface } from "@/components/demo-surface";
import { useStore } from "@/components/store-provider";
import { getProduct } from "@/lib/products";

/** The two buttons, wired to the shared Buy/Try modals. */
export function ProductActions({
  slug,
  size = "md",
}: {
  slug: string;
  size?: "md" | "sm";
}) {
  const { openBuy, openTry } = useStore();
  const cls = size === "sm" ? "btn-sm" : "";

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className={`btn-agent ${cls}`} onClick={() => openTry(slug)}>
        Try it free
      </button>
      <button type="button" className={`btn-ghost ${cls}`} onClick={() => openBuy(slug)}>
        Buy now
      </button>
    </div>
  );
}

/** The product's own sandbox, inline on its detail page. */
export function ProductSandbox({ slug }: { slug: string }) {
  const { openBuy } = useStore();
  const product = getProduct(slug);
  if (!product) return null;

  return <DemoSurface product={product} onBuy={() => openBuy(slug)} />;
}
