"use client";

import { useState } from "react";

import { formatMoney } from "@/lib/demo/audit";
import type { AuditRun, Variance } from "@/lib/demo/audit/types";

const KIND_LABEL: Record<Variance["kind"], string> = {
  over_rate: "above agreed rate",
  surcharge_cap: "over surcharge cap",
  unagreed_charge: "not in contract",
  free_time: "inside free time",
  duplicate: "billed twice",
  arithmetic: "doesn't add up",
};

function Section({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
      <p className="eyebrow">{kicker}</p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export function AuditOutput({ run }: { run: AuditRun }) {
  const [copied, setCopied] = useState(false);
  const { invoice, variances, recoverableMinor, billedMinor } = run;

  async function copyDispute() {
    try {
      await navigator.clipboard.writeText(run.dispute.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the draft is on screen either way.
    }
  }

  if (run.verdict === "unreadable") {
    return (
      <div className="rounded-node border border-node-trigger/35 bg-node-trigger/[0.06] px-4 py-4">
        <p className="font-medium">No charge lines found.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Paste the invoice body — a label and an amount per line is enough. The
          real workflow reads the PDF straight from the mailbox; this box needs
          text.
        </p>
      </div>
    );
  }

  const clean = variances.length === 0;
  const pctRecoverable = billedMinor
    ? ((recoverableMinor / billedMinor) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="overflow-hidden rounded-node border border-line bg-canvas/70">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:px-5">
        <div>
          <p className="flex items-center gap-2 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${clean ? "bg-node-action" : "bg-node-output"}`}
            />
            {clean
              ? "Nothing to dispute"
              : `${formatMoney(recoverableMinor, invoice.currency)} recoverable`}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            {invoice.carrier ?? "unknown carrier"} ·{" "}
            {invoice.invoiceNumber ?? "no invoice number"} ·{" "}
            {invoice.lane ? `${invoice.lane.from} → ${invoice.lane.to}` : "lane not stated"}
          </p>
        </div>
        {!clean ? (
          <button type="button" onClick={copyDispute} className="btn-ghost btn-sm">
            {copied ? "Copied" : "Copy dispute"}
          </button>
        ) : null}
      </header>

      <Section kicker="02 · what was billed">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Invoice total
            </dt>
            <dd className="text-sm font-medium">
              {formatMoney(billedMinor, invoice.currency)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Lines read
            </dt>
            <dd className="text-sm font-medium">{invoice.lines.length}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Queried
            </dt>
            <dd className={`text-sm font-medium ${clean ? "" : "text-node-output"}`}>
              {variances.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Of invoice
            </dt>
            <dd className="text-sm font-medium">{pctRecoverable}%</dd>
          </div>
        </dl>
      </Section>

      <Section kicker="03 · checked against the rate card">
        {clean ? (
          <p className="text-sm text-ink-soft">
            Every line matches the contract — base rate, surcharge cap, agreed
            accessorials, free time. Pass it for payment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Line", "Issue", "Billed", "Expected", "Recoverable"].map((head) => (
                    <th
                      key={head}
                      scope="col"
                      className="border-b border-line pb-2 text-left font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-ink-muted last:text-right"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variances.map((variance) => (
                  <tr key={`${variance.kind}-${variance.line}`} className="align-top">
                    <th scope="row" className="border-b border-line py-2.5 pr-3 text-left font-medium">
                      {variance.line}
                      <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                        {variance.reason}
                      </span>
                    </th>
                    <td className="border-b border-line py-2.5 pr-3">
                      <span
                        className={`chip py-0.5 ${
                          variance.confidence === "high"
                            ? "border-node-output/35 text-node-output"
                            : "border-node-trigger/35 text-node-trigger"
                        }`}
                      >
                        {KIND_LABEL[variance.kind]}
                      </span>
                    </td>
                    <td className="border-b border-line py-2.5 pr-3 font-mono">
                      {formatMoney(variance.billedMinor, invoice.currency)}
                    </td>
                    <td className="border-b border-line py-2.5 pr-3 font-mono text-ink-muted">
                      {variance.expectedMinor !== null
                        ? formatMoney(variance.expectedMinor, invoice.currency)
                        : "—"}
                    </td>
                    <td className="border-b border-line py-2.5 text-right font-mono font-medium">
                      {variance.recoverableMinor > 0
                        ? formatMoney(variance.recoverableMinor, invoice.currency)
                        : "query"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="py-3 text-right font-semibold">
                    Total held
                  </td>
                  <td className="py-3 text-right font-mono text-base font-medium">
                    {formatMoney(recoverableMinor, invoice.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
          Amber lines are queries, not claims — someone reads them before the
          email goes out. The arithmetic is code, not a model: same invoice, same
          rate card, same number every time.
        </p>
      </Section>

      {!clean ? (
        <Section kicker="04 · dispute pack">
          <div className="rounded-lg border border-line bg-paper p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              {run.dispute.subject}
            </p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {run.dispute.body}
            </p>
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
            Plus {run.sheetRows.length - 1} row
            {run.sheetRows.length === 2 ? "" : "s"} appended to the dispute log —
            the spreadsheet your finance team already reconciles against.
          </p>
        </Section>
      ) : null}
    </div>
  );
}
