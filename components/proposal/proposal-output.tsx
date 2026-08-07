"use client";

import { useState } from "react";

import { FitPill } from "@/components/proposal/fit-pill";
import { SendDraft } from "@/components/proposal/send-draft";
import { printProposal } from "@/lib/demo/proposal/print";
import type { ProposalRun } from "@/lib/demo/proposal/types";
import { SITE } from "@/lib/site";

/**
 * What node 04 produces, rendered as the three things a proposal actually is:
 * what was understood, what's being quoted, and what happens if they go quiet.
 *
 * Deliberately not raw JSON — the point of the product is that a person can
 * read this, edit two lines, and send it.
 */

function money(minor: number, currency: string): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    // A currency code the browser doesn't know shouldn't break the quote.
    return `${currency} ${major.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
  }
}

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
      <p className="eyebrow">{kicker}</p>
      {title ? (
        <h4 className="mt-1.5 font-medium tracking-tight">{title}</h4>
      ) : null}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function asPlainText(run: ProposalRun): string {
  const { doc, followUps } = run;
  const lines = [
    doc.intro,
    "",
    "SCOPE",
    ...doc.scope.map((item) => `- ${item}`),
    "",
    "INVESTMENT",
    ...doc.pricing.rows.map(
      (row) => `- ${row.label}: ${money(row.amountMinor, doc.pricing.currency)}`,
    ),
    `TOTAL: ${money(doc.pricing.totalMinor, doc.pricing.currency)}`,
    ...(doc.pricing.note ? ["", doc.pricing.note] : []),
    "",
    "ASSUMPTIONS",
    ...doc.assumptions.map((item) => `- ${item}`),
    "",
    "TERMS",
    ...doc.terms.map((item) => `- ${item}`),
    "",
    "FOLLOW-UPS",
    ...followUps.map(
      (f) => `[${f.sendDateLabel} · +${f.sendOffsetDays}d] ${f.subject}\n${f.body}`,
    ),
  ];
  return lines.join("\n");
}

export function ProposalOutput({ run }: { run: ProposalRun }) {
  const [copied, setCopied] = useState(false);
  const { scope, doc, followUps } = run;

  const budget =
    scope.budgetSignal.confidence === "absent"
      ? "not discussed"
      : `${scope.budgetSignal.raw ?? "—"} (${scope.budgetSignal.confidence})`;

  const timing =
    scope.deadline.date || scope.deadline.driver
      ? [scope.deadline.date, scope.deadline.driver].filter(Boolean).join(" · ")
      : "not discussed";

  async function copy() {
    try {
      await navigator.clipboard.writeText(asPlainText(run));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is on screen either way.
    }
  }

  return (
    <div className="overflow-hidden rounded-node border border-line bg-canvas/70">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <FitPill level={run.fit} />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            {run.source === "model"
              ? "written by claude-sonnet-5"
              : "offline draft · no key"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="btn-ghost btn-sm">
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() =>
              printProposal(run, {
                siteName: SITE.name,
                title: `Proposal draft — ${SITE.name}`,
              })
            }
          >
            Download PDF
          </button>
        </div>
      </header>

      {run.warning ? (
        <p className="border-b border-line bg-node-trigger/[0.07] px-4 py-2.5 text-sm text-ink-soft sm:px-5">
          {run.warning}
        </p>
      ) : null}

      {/* 02 · what the agent understood */}
      <Section kicker="02 · extracted scope">
        <p className="text-sm leading-relaxed text-ink-soft">
          {scope.problem || "No clear problem statement in the notes."}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Budget signal
            </dt>
            <dd
              className={`text-sm font-medium ${
                scope.budgetSignal.confidence === "stated"
                  ? "text-node-action"
                  : scope.budgetSignal.confidence === "hinted"
                    ? "text-node-trigger"
                    : "text-ink-muted"
              }`}
            >
              {budget}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Deadline
            </dt>
            <dd className="text-sm font-medium">{timing}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Deliverables
            </dt>
            <dd className="text-sm font-medium">{scope.deliverables.length}</dd>
          </div>
        </dl>

        {scope.constraints.length ? (
          <ul className="mt-3 space-y-1">
            {scope.constraints.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink-muted">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-node-trigger" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      {/* 03 · the document */}
      <Section kicker="03 · the proposal">
        <p className="text-sm leading-relaxed text-ink-soft">{doc.intro}</p>

        <p className="eyebrow mt-4">Scope</p>
        <ul className="mt-1.5 space-y-1">
          {doc.scope.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-node-action" />
              {item}
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-4">Investment</p>
        <div className="mt-1.5 overflow-x-auto">
          <table className="w-full min-w-[420px] border-separate border-spacing-0 text-sm">
            <tbody>
              {doc.pricing.rows.map((row) => (
                <tr key={row.label} className="align-top">
                  <th scope="row" className="border-b border-line py-2 pr-4 text-left font-medium">
                    {row.label}
                    {row.detail ? (
                      <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                        {row.detail}
                      </span>
                    ) : null}
                  </th>
                  <td className="whitespace-nowrap border-b border-line py-2 text-right font-mono">
                    {money(row.amountMinor, doc.pricing.currency)}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2.5 pr-4 text-left font-semibold">
                  Total
                </th>
                <td className="whitespace-nowrap py-2.5 text-right font-mono text-base font-medium">
                  {money(doc.pricing.totalMinor, doc.pricing.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {doc.pricing.note ? (
          <p className="mt-2 rounded-lg border border-node-trigger/30 bg-node-trigger/[0.06] px-3 py-2 text-sm text-ink-soft">
            {doc.pricing.note}
          </p>
        ) : null}

        <p className="eyebrow mt-4">Assumptions</p>
        <ul className="mt-1.5 space-y-1">
          {doc.assumptions.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-ink-soft">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-node-agent" />
              {item}
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-4">Terms</p>
        <ul className="mt-1.5 space-y-1">
          {doc.terms.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-ink-soft">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 04 · what happens if they go quiet */}
      <Section kicker="04 · follow-up sequence" title="Queued behind the send">
        <ol className="space-y-2.5">
          {followUps.map((item) => (
            <li key={item.subject} className="rounded-lg border border-line bg-paper p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{item.subject}</p>
                <p className="font-mono text-[11px] text-ink-muted">
                  {item.sendDateLabel} · +{item.sendOffsetDays}d
                </p>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-muted">
          In the real workflow these are rows with send-at timestamps, swept by a
          cron job — and cancelled the moment the client replies.
        </p>
      </Section>

      <Section kicker="take it with you">
        <SendDraft run={run} />
      </Section>
    </div>
  );
}
