"use client";

import { useStore } from "@/components/store-provider";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { FLAGSHIP } from "@/lib/products";

export function Hero() {
  const { openBuy, openTry } = useStore();

  return (
    <section className="relative overflow-hidden">
      <div className="shell grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-20">
        <div>
          <p className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-node-action" />
            [4] workflows · built solo · shipped this quarter
          </p>

          <h1 className="mt-5 text-balance text-display font-semibold">
            Buy an AI workflow that does the job you keep putting off.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Ready-made automations for the boring, expensive parts of running a
            business — lead qualification, inbox triage, proposals, ops alerts.
            Run one on your own messy data right here, then buy it if it earns
            it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-agent" onClick={() => openTry()}>
              Try it free
            </button>
            <button type="button" className="btn-ghost" onClick={() => openBuy()}>
              Buy {FLAGSHIP.name}
            </button>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            no card · no account · no call
          </p>
        </div>

        <div className="relative">
          <div className="card overflow-hidden p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                {FLAGSHIP.name} · canvas
              </p>
              <span className="chip py-0.5">live</span>
            </div>
            <WorkflowCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
