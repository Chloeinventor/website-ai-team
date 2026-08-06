"use client";

import { useRef, useState } from "react";

import { FLAGSHIP, PRODUCTS } from "@/lib/products";

const STEPS = [
  {
    id: "discover",
    label: "Discover",
    time: "[2 min]",
    headline: "Pick the job you're sick of doing.",
    body: "Four workflows, each named after the outcome rather than the tech. If none of them fit, that's what the custom build is for.",
  },
  {
    id: "configure",
    label: "Configure",
    time: "[10 min]",
    headline: "Say what good looks like, in English.",
    body: "The rules are prose, not a scoring matrix. Change your mind later by editing a sentence — no rebuilding a filter tree.",
  },
  {
    id: "try",
    label: "Try",
    time: "[15 sec]",
    headline: "Run it on your own messy data.",
    body: "Paste something real and watch every node work. If the verdict is wrong, you found that out before paying, which is the point.",
  },
  {
    id: "deploy",
    label: "Buy & deploy",
    time: "[40 min]",
    headline: "Pay on your rail, import, done.",
    body: "Revolut, GCash or PayNow — whichever is normal where you are. The workflow JSON and setup notes land the moment payment confirms.",
  },
] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + STEPS.length) % STEPS.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  const step = STEPS[active];

  return (
    <section id="how" className="scroll-mt-24 py-16 sm:py-20">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-section font-semibold">
            Four steps, and only one of them costs money.
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="How it works"
          onKeyDown={onKeyDown}
          className="mt-8 flex flex-wrap gap-2"
        >
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              role="tab"
              id={`tab-${item.id}`}
              aria-controls={`panel-${item.id}`}
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className={`flex items-center gap-2.5 rounded-node border px-4 py-2.5 transition-colors ${
                index === active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-paper text-ink-soft hover:border-ink-muted"
              }`}
            >
              <span className="font-mono text-[11px] opacity-70">0{index + 1}</span>
              <span className="font-medium">{item.label}</span>
              <span
                className={`font-mono text-[11px] ${
                  index === active ? "text-white/60" : "text-ink-muted"
                }`}
              >
                {item.time}
              </span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${step.id}`}
          aria-labelledby={`tab-${step.id}`}
          className="card mt-5 grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]"
        >
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{step.headline}</h3>
            <p className="mt-3 text-ink-soft">{step.body}</p>
          </div>
          <div className="min-w-0">
            <Panel id={step.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Each panel is real interface, rendered — not a screenshot of one. */
function Panel({ id }: { id: (typeof STEPS)[number]["id"] }) {
  if (id === "discover") {
    return (
      <Frame title="shelf">
        <ul className="divide-y divide-line">
          {PRODUCTS.map((product) => (
            <li
              key={product.slug}
              className="flex items-center justify-between gap-4 px-3 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {product.name}
                </span>
                <span className="block truncate text-xs text-ink-muted">
                  {product.outcome}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-ink-muted">
                {product.setupTime}
              </span>
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  if (id === "configure") {
    return (
      <Frame title="rules.md">
        <div className="space-y-3 px-3 py-3 font-mono text-[12.5px] leading-relaxed">
          <p className="text-ink-muted"># Who&apos;s worth a call</p>
          <p>
            <span className="text-node-agent">book</span> if they name a budget{" "}
            <span className="text-ink-muted">or</span> a deadline
          </p>
          <p>
            <span className="text-node-trigger">nurture</span> if they&apos;re
            vague but real
          </p>
          <p>
            <span className="text-node-output">decline</span> if it&apos;s a
            vendor pitch
          </p>
          <p className="text-ink-muted"># edit this sentence, not a filter tree</p>
          <p className="text-ink-muted">
            <span className="animate-caret">▌</span>
          </p>
        </div>
      </Frame>
    );
  }

  if (id === "try") {
    return (
      <Frame title="run · sandbox">
        <ol className="space-y-1 px-3 py-3">
          {FLAGSHIP.steps.map((step, index) => (
            <li key={step.label} className="flex items-baseline gap-2.5 font-mono text-[12px]">
              <span className="text-ink-muted">0{index + 1}</span>
              <span className="flex-1 truncate">{step.label}</span>
              <span className="text-node-action">ok</span>
            </li>
          ))}
          <li className="flex items-baseline gap-2.5 border-t border-line pt-2 font-mono text-[12px]">
            <span className="text-ink-muted">→</span>
            <span className="flex-1">verdict: book the call</span>
            <span className="text-ink-muted">38s</span>
          </li>
        </ol>
      </Frame>
    );
  }

  return (
    <Frame title="checkout">
      <div className="space-y-2 px-3 py-3">
        {[
          { rail: "Revolut", note: "card · Revolut Pay", cur: "EUR" },
          { rail: "GCash", note: "GCash · Maya · card", cur: "PHP" },
          { rail: "PayNow · MariBank", note: "any SG bank app", cur: "SGD" },
        ].map((rail) => (
          <div
            key={rail.rail}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
          >
            <span>
              <span className="block text-sm font-medium">{rail.rail}</span>
              <span className="block text-xs text-ink-muted">{rail.note}</span>
            </span>
            <span className="font-mono text-[11px] text-ink-muted">{rail.cur}</span>
          </div>
        ))}
        <p className="pt-1 font-mono text-[11px] text-ink-muted">
          fresh QR per order · confirms itself
        </p>
      </div>
    </Frame>
  );
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-node border border-line bg-canvas/60">
      <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="font-mono text-[11px] text-ink-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}
