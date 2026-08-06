"use client";

import { useCallback, useEffect, useState } from "react";

import { DemoRunner } from "@/components/demo-runner";
import { FitPill } from "@/components/proposal/fit-pill";
import { KeySettings } from "@/components/proposal/key-settings";
import { ProposalOutput } from "@/components/proposal/proposal-output";
import { classifyFit, extractScope, runProposal } from "@/lib/demo/proposal";
import { readKey } from "@/lib/demo/proposal/key-store";
import type { PillLevel, ProposalRun } from "@/lib/demo/proposal/types";
import type { RunOutput, RunStep } from "@/lib/demo/simulate";
import type { Product } from "@/lib/products";

/**
 * [Proposal Builder]'s demo: the shared runner, a live fit pill, the real
 * four-node pipeline behind the Run button, and the key settings that decide
 * whether node 02 and node 04 use a model.
 *
 * The pill is separate from the example chips on purpose — a chip loads an
 * example, a pill reports a verdict, and one control can't honestly do both.
 * Both the pill and the drafted proposal come from the same `extractScope` →
 * `classifyFit` pair, so they can never disagree.
 */

function pillLevel(notes: string): PillLevel {
  if (!notes.trim()) return "idle";
  return classifyFit(extractScope(notes));
}

function money(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${currency} ${Math.round(minor / 100)}`;
  }
}

/** The four advertised nodes, with what actually happened in each one. */
function stepsFor(run: ProposalRun, notes: string): RunStep[] {
  const { scope, doc, followUps } = run;

  return [
    {
      id: "trigger",
      kind: "trigger",
      label: "Call ends",
      detail: `${notes.trim().length} chars of notes read`,
      ms: 0,
    },
    {
      id: "extract",
      kind: "agent",
      label: "Extract scope",
      detail: [
        `${scope.deliverables.length} deliverable${scope.deliverables.length === 1 ? "" : "s"}`,
        `budget ${scope.budgetSignal.confidence}`,
        scope.deadline.date || scope.deadline.driver ? "deadline found" : "no deadline",
        run.source === "model" ? "via claude-sonnet-5" : "offline",
      ].join(" · "),
      ms: 0,
    },
    {
      id: "template",
      kind: "action",
      label: "Fill the template",
      detail: `${doc.pricing.rows.length} line items · ${money(
        doc.pricing.totalMinor,
        doc.pricing.currency,
      )} · ${doc.assumptions.length} assumptions written down`,
      ms: 0,
    },
    {
      id: "draft",
      kind: "output",
      label: "Draft + reminders",
      detail: `Proposal drafted · ${followUps.length} follow-ups queued (+${followUps
        .map((f) => f.sendOffsetDays)
        .join(", +")}d)`,
      ms: 0,
    },
  ];
}

export function ProposalDemo({
  product,
  variant = "inline",
  onBuy,
}: {
  product: Product;
  variant?: "inline" | "modal";
  onBuy?: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // sessionStorage isn't available during SSR — read it once on mount.
  useEffect(() => {
    setApiKey(readKey());
  }, []);

  const handleInputChange = useCallback((value: string) => setNotes(value), []);

  const execute = useCallback(
    async (input: string, signal: AbortSignal): Promise<RunOutput> => {
      // The offline path resolves in single-digit milliseconds, which makes the
      // four nodes flash rather than play. A short floor lets the pipeline read
      // as a pipeline; the model path is naturally slower and never waits.
      const [run] = await Promise.all([
        runProposal(input, { apiKey, signal }),
        new Promise((resolve) => setTimeout(resolve, 1100)),
      ]);

      return {
        steps: stepsFor(run, input),
        // The custom renderer draws the real output; this keeps the generic
        // shape honest for anything that reads it without one.
        result: {
          verdict:
            run.fit === "good"
              ? "Proposal drafted"
              : run.fit === "unclear"
                ? "Drafted, with gaps flagged"
                : "Not enough to scope from",
          tone: run.fit === "good" ? "good" : run.fit === "unclear" ? "warn" : "neutral",
          summary: run.doc.intro,
          fields: [],
        },
        artifact: run,
      };
    },
    [apiKey],
  );

  return (
    <div>
      <DemoRunner
        product={product}
        variant={variant}
        onBuy={onBuy}
        onInputChange={handleInputChange}
        statusSlot={<FitPill level={pillLevel(notes)} />}
        execute={execute}
        renderResult={(output) => (
          <ProposalOutput run={output.artifact as ProposalRun} />
        )}
        footerNote={
          apiKey
            ? "your key · notes go straight to anthropic, never my server"
            : "runs in your browser · nothing sent anywhere"
        }
      />

      <KeySettings activeKey={apiKey} onChange={setApiKey} />
    </div>
  );
}
