"use client";

import { useStore } from "@/components/store-provider";

export function FinalCta() {
  const { openBuy, openTry } = useStore();

  return (
    <section className="py-16 sm:py-20">
      <div className="shell">
        <div className="dotgrid relative overflow-hidden rounded-[20px] border border-line bg-paper px-6 py-14 text-center shadow-lift sm:px-12">
          <p className="eyebrow">One decision left</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-section font-semibold">
            Run it on your own data. Buy it if it earns it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
            That&apos;s the whole offer. No trial that expires, no demo call, no
            discovery form — just the workflow, doing the job, in front of you.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-agent" onClick={() => openTry()}>
              Try it free
            </button>
            <button type="button" className="btn-ghost" onClick={() => openBuy()}>
              Buy now
            </button>
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            revolut · gcash · paynow — [14-day] refund either way
          </p>
        </div>
      </div>
    </section>
  );
}
