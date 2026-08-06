import type { PricingRow, ProposalDoc, ScopeExtract } from "./types";

/**
 * 03 · ACTION — fillTemplate
 *
 * Deterministic in both paths, and that is the important design decision here:
 * the model extracts *signals*, this code decides *prices*. A rate card is a
 * lookup, not a judgement call, and a model that can invent a number will
 * eventually invent the wrong one in front of a client.
 *
 * Mirrors the "pricing is a Code node, not an LLM node" rule from the n8n
 * build — same reasoning, same boundary.
 */

/** PLACEHOLDER RATE CARD — replace before launch (README). Minor units. */
const RATE_CARD = {
  discoveryMinor: 60_000,
  perDeliverableMinor: 95_000,
  handoverMinor: 40_000,
  /** Nothing ships below this, however small the scope. */
  minimumMinor: 180_000,
};

const DEFAULT_CURRENCY = "EUR";

/** Round to a number a human would write on an invoice. */
function tidy(minor: number): number {
  return Math.round(minor / 5_000) * 5_000;
}

function title(value: string): string {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function fillTemplate(scope: ScopeExtract): ProposalDoc {
  const currency = scope.budgetSignal.currency ?? DEFAULT_CURRENCY;

  const deliverables = scope.deliverables.length
    ? scope.deliverables
    : ["[Scope to be confirmed on the follow-up call]"];

  const rows: PricingRow[] = [
    {
      label: "Discovery & mapping",
      detail: "Walk the current process, agree the rules in writing",
      amountMinor: RATE_CARD.discoveryMinor,
    },
    ...deliverables.map((item) => ({
      label: title(item).slice(0, 80),
      detail: "Build, test against real data, hand over",
      amountMinor: RATE_CARD.perDeliverableMinor,
    })),
    {
      label: "Handover & documentation",
      detail: "Workflow JSON, runbook, [30 days] of fixes",
      amountMinor: RATE_CARD.handoverMinor,
    },
  ];

  const subtotal = rows.reduce((sum, row) => sum + row.amountMinor, 0);
  const totalMinor = tidy(Math.max(subtotal, RATE_CARD.minimumMinor));

  // Only comment on budget when they actually named one.
  let note: string | undefined;
  if (scope.budgetSignal.amountMinor !== null) {
    const stated = scope.budgetSignal.amountMinor;
    if (totalMinor > stated * 1.1) {
      note = `Above the ${scope.budgetSignal.raw} mentioned on the call. Dropping "${title(
        deliverables[deliverables.length - 1],
      ).slice(0, 48)}" brings it under — worth a conversation before you sign anything.`;
    } else if (totalMinor < stated * 0.75) {
      note = `Comes in under the ${scope.budgetSignal.raw} discussed. The remainder would cover [a second workflow] if you want it.`;
    }
  }

  const assumptions = [
    "You provide access to the systems named above.",
    "One round of revisions is included; further changes are quoted separately.",
  ];

  // The gaps in the extract become written assumptions instead of silent ones —
  // this is the part people forget, which is why the product exists.
  if (scope.budgetSignal.confidence !== "stated") {
    assumptions.push(
      scope.budgetSignal.confidence === "hinted"
        ? `Budget was indicated (${scope.budgetSignal.raw}) but not confirmed. This quote assumes it.`
        : "Budget was not discussed. This quote is the starting point, not a negotiation.",
    );
  }
  if (!scope.deadline.date && !scope.deadline.driver) {
    assumptions.push("No delivery date was agreed. Timeline starts on acceptance.");
  }
  if (!scope.constraints.length) {
    assumptions.push("No technical constraints were raised. Existing tooling stays as-is.");
  }

  const timing = scope.deadline.driver
    ? `ahead of ${scope.deadline.driver}`
    : scope.deadline.date
      ? `by ${scope.deadline.date}`
      : "on a timeline we agree at kickoff";

  return {
    intro:
      `${scope.problem || "The process we discussed"} — that's the thing this fixes. ` +
      `Below is what I'd build, what it costs, and what I'm assuming. ` +
      `Delivery ${timing}.`,
    scope: deliverables.map((item) => title(item)),
    pricing: { rows, totalMinor, currency, note },
    assumptions: scope.constraints.length
      ? [...assumptions, ...scope.constraints.map((c) => `Constraint noted: ${title(c)}.`)]
      : assumptions,
    terms: [
      "[50%] on acceptance, [50%] on handover.",
      "[30 days] of fixes included after handover.",
      "You own the workflow files outright — nothing runs on my infrastructure.",
    ],
  };
}
