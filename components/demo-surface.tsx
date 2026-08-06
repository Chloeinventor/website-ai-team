"use client";

import { DemoRunner } from "@/components/demo-runner";
import { ProposalDemo } from "@/components/proposal/proposal-demo";
import type { Product } from "@/lib/products";

/**
 * One entry point for every "try it" surface — the modal, the product page
 * sandbox, and the homepage widget all render this.
 *
 * Products get a specialised demo only when they've earned one; everything else
 * falls through to the shared runner rather than forking a copy of it.
 */
export function DemoSurface({
  product,
  variant = "inline",
  onBuy,
}: {
  product: Product;
  variant?: "inline" | "modal";
  onBuy?: () => void;
}) {
  if (product.demo === "proposal") {
    return <ProposalDemo product={product} variant={variant} onBuy={onBuy} />;
  }

  return <DemoRunner product={product} variant={variant} onBuy={onBuy} />;
}
