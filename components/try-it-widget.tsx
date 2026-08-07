"use client";

import { DemoSurface } from "@/components/demo-surface";
import { useStore } from "@/components/store-provider";
import { FLAGSHIP } from "@/lib/products";

/**
 * The signature moment of the page — the one place the design is allowed to be
 * loud. Everything around it stays quiet on purpose.
 *
 * It is also the honest version of "try": the workflow runs on whatever the
 * visitor types, in their browser, before anyone asks them for anything.
 */
export function TryItWidget() {
  const { openBuy } = useStore();

  return (
    <section
      id="try"
      className="dotgrid scroll-mt-24 border-y border-line bg-paper/70 py-16 sm:py-24"
    >
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Try it, right here</p>
          <h2 className="mt-3 text-section font-semibold">
            Paste a real invoice. Watch it find the money.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            This is {FLAGSHIP.name} running on whatever you paste in — the same
            four nodes you&apos;d buy, checking against the same rate card. No
            signup, no card, and nothing leaves your browser.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          <Ornament className="-left-8 -top-6 hidden lg:block" accent="#E08A17" label="trigger" />
          <Ornament className="-right-10 top-24 hidden lg:block" accent="#0E9D93" label="action" delay="0.4s" />
          <Ornament className="-left-12 bottom-16 hidden lg:block" accent="#EC5A38" label="output" delay="0.8s" />

          <div className="card overflow-hidden shadow-lift">
            <div className="flex items-center justify-between gap-4 border-b border-line bg-canvas/70 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-node-trigger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-node-action/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-node-agent/70" />
                <span className="ml-2 font-mono text-[11px] text-ink-muted">
                  {FLAGSHIP.name.toLowerCase().replace(/[[\]]/g, "")}.workflow
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                sandbox
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <DemoSurface
                product={FLAGSHIP}
                onBuy={() => openBuy(FLAGSHIP.slug)}
              />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center font-mono text-[11px] leading-relaxed text-ink-muted">
          Honest footnote: this runs the real audit against a placeholder rate
          card. Buy it and it runs against yours, straight off the invoices in
          your mailbox.
        </p>
      </div>
    </section>
  );
}

/** Floating node chips around the widget — the whimsy, rationed. */
function Ornament({
  className = "",
  accent,
  label,
  delay = "0s",
}: {
  className?: string;
  accent: string;
  label: string;
  delay?: string;
}) {
  return (
    <div
      aria-hidden
      className={`absolute z-10 flex items-center gap-2 rounded-node border border-line bg-paper px-3 py-2 shadow-node ${className}`}
      style={{ transform: "rotate(-2deg)" }}
    >
      <span
        className="h-2 w-2 animate-pulseNode rounded-full"
        style={{ background: accent, animationDelay: delay }}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}
