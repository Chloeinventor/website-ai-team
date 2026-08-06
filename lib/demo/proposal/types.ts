/**
 * The Proposal Builder contract.
 *
 * Deliberately the same shape as the JSON the real n8n workflow passes between
 * its four nodes, so the browser demo doubles as the spec for the workflow:
 *
 *   01 TRIGGER  raw notes            → string
 *   02 AGENT    extractScope(notes)  → ScopeExtract
 *   03 ACTION   fillTemplate(scope)  → ProposalDoc
 *   04 OUTPUT   generateFollowUps()  → FollowUp[]
 *
 * `null` is a legal answer everywhere it appears. "Budget wasn't discussed" is
 * the most common real outcome, and a type that can't say so invites a made-up
 * number — the same failure mode as an LLM with a non-nullable schema.
 */

export type FitLevel = "good" | "unclear" | "poor";

/** What the pill renders — the fit levels plus "nothing typed yet". */
export type PillLevel = FitLevel | "idle";

export interface BudgetSignal {
  amountMinor: number | null;
  currency: string | null;
  confidence: "stated" | "hinted" | "absent";
  /** Exactly as it appeared in the notes, for showing your work. */
  raw: string | null;
}

export interface Deadline {
  /** ISO date when one can be resolved, else null. */
  date: string | null;
  /** Why that date exists — "trade show", "board meeting". */
  driver: string | null;
  raw: string | null;
}

export interface ScopeExtract {
  problem: string;
  constraints: string[];
  budgetSignal: BudgetSignal;
  deadline: Deadline;
  deliverables: string[];
}

export interface PricingRow {
  label: string;
  detail?: string;
  amountMinor: number;
}

export interface ProposalDoc {
  intro: string;
  scope: string[];
  pricing: {
    rows: PricingRow[];
    totalMinor: number;
    currency: string;
    note?: string;
  };
  assumptions: string[];
  terms: string[];
}

export interface FollowUp {
  subject: string;
  /** Days after the proposal is sent. */
  sendOffsetDays: number;
  /** Pre-formatted for display, e.g. "Tue 11 Aug". */
  sendDateLabel: string;
  body: string;
}

export interface ProposalRun {
  scope: ScopeExtract;
  fit: FitLevel;
  doc: ProposalDoc;
  followUps: FollowUp[];
  /** Which path produced this — heuristic fallback, or a real model call. */
  source: "heuristic" | "model";
  /** Set when the model path was attempted and fell back. Shown, never swallowed. */
  warning?: string;
}
