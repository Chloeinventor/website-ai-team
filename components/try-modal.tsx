"use client";

import { useId } from "react";

import { DemoSurface } from "@/components/demo-surface";
import { Modal } from "@/components/modal";
import type { Product } from "@/lib/products";

/** "Try It Free" — opens instantly. No card, no email, no account. */
export function TryModal({
  product,
  onClose,
  onBuy,
}: {
  product: Product;
  onClose: () => void;
  onBuy: () => void;
}) {
  const titleId = useId();

  return (
    <Modal labelledBy={titleId} onClose={onClose} wide>
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="eyebrow">Try free · no card, no account</p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{product.outcome}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-ink-muted hover:border-ink-muted hover:text-ink"
          aria-label="Close"
        >
          ESC
        </button>
      </header>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        <DemoSurface product={product} variant="modal" onBuy={onBuy} />
      </div>
    </Modal>
  );
}
