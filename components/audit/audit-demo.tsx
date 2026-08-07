"use client";

import { useCallback } from "react";

import { AuditOutput } from "@/components/audit/audit-output";
import { DemoRunner } from "@/components/demo-runner";
import { formatMoney, runAudit } from "@/lib/demo/audit";
import type { AuditRun } from "@/lib/demo/audit/types";
import type { RunOutput, RunStep } from "@/lib/demo/simulate";
import type { Product } from "@/lib/products";

/**
 * [Freight Invoice Auditor]'s demo — the real pipeline behind the Run button,
 * not a simulation. Paste an invoice, get the arithmetic.
 */

function stepsFor(run: AuditRun, input: string): RunStep[] {
  const { invoice, variances } = run;
  const currency = invoice.currency;
  const high = variances.filter((v) => v.confidence === "high").length;

  return [
    {
      id: "trigger",
      kind: "trigger",
      label: "Invoice arrives",
      detail: `${input.trim().split(/\r?\n/).length} lines pasted`,
      ms: 0,
    },
    {
      id: "read",
      kind: "agent",
      label: "Read the invoice",
      detail: [
        `${invoice.lines.length} charge lines`,
        invoice.carrier ?? "carrier not stated",
        invoice.lane ? `${invoice.lane.from} → ${invoice.lane.to}` : "lane not stated",
      ].join(" · "),
      ms: 0,
    },
    {
      id: "check",
      kind: "action",
      label: "Check the rate card",
      detail: variances.length
        ? `${variances.length} line${variances.length === 1 ? "" : "s"} queried · ${high} contractual`
        : "every line inside contract",
      ms: 0,
    },
    {
      id: "pack",
      kind: "output",
      label: "Dispute pack",
      detail: run.recoverableMinor
        ? `${formatMoney(run.recoverableMinor, currency)} held · sheet + email drafted`
        : "nothing to raise — passed for payment",
      ms: 0,
    },
  ];
}

export function AuditDemo({
  product,
  variant = "inline",
  onBuy,
}: {
  product: Product;
  variant?: "inline" | "modal";
  onBuy?: () => void;
}) {
  const execute = useCallback(async (input: string): Promise<RunOutput> => {
    // Parsing and arithmetic are synchronous and instant; the floor lets the
    // four nodes read as a pipeline rather than flashing.
    const [run] = await Promise.all([
      Promise.resolve(runAudit(input)),
      new Promise((resolve) => setTimeout(resolve, 1100)),
    ]);

    return {
      steps: stepsFor(run, input),
      result: {
        verdict:
          run.verdict === "unreadable"
            ? "Couldn't read that"
            : run.recoverableMinor
              ? `${formatMoney(run.recoverableMinor, run.invoice.currency)} recoverable`
              : "Clean invoice",
        tone: run.recoverableMinor ? "warn" : "good",
        summary: run.dispute.body || "Every line matches the contract.",
        fields: [],
      },
      artifact: run,
    };
  }, []);

  return (
    <DemoRunner
      product={product}
      variant={variant}
      onBuy={onBuy}
      execute={execute}
      renderResult={(output) => <AuditOutput run={output.artifact as AuditRun} />}
      footerNote="runs in your browser · nothing sent anywhere"
    />
  );
}
