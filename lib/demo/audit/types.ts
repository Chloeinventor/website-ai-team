/**
 * The [Freight Invoice Auditor] contract.
 *
 * Same split as the Proposal Builder, for the same reason: reading a messy
 * invoice is fuzzy work, but deciding what you're owed is arithmetic. Node 02
 * parses; node 03 does maths against a rate card. A model never touches the
 * money — a hallucinated recovery figure sent to a carrier is worse than no
 * audit at all.
 */

export interface InvoiceLine {
  /** Label exactly as printed on the invoice. */
  label: string;
  /** Normalised for matching: lowercased, punctuation stripped. */
  key: string;
  amountMinor: number;
  /** Units where the line states them — "3 days", "2 containers". */
  units: number | null;
}

export interface ParsedInvoice {
  carrier: string | null;
  invoiceNumber: string | null;
  reference: string | null;
  lane: { from: string; to: string } | null;
  currency: string;
  lines: InvoiceLine[];
  /** The total the invoice claims. Null when it doesn't state one. */
  statedTotalMinor: number | null;
}

export type VarianceKind =
  | "over_rate"
  | "surcharge_cap"
  | "unagreed_charge"
  | "free_time"
  | "duplicate"
  | "arithmetic";

export interface Variance {
  kind: VarianceKind;
  line: string;
  billedMinor: number;
  /** What the contract says it should have been. Null when there's no basis. */
  expectedMinor: number | null;
  recoverableMinor: number;
  reason: string;
  /**
   * `high` — the contract is unambiguous, send it.
   * `review` — worth querying, but a human should look before it goes out.
   */
  confidence: "high" | "review";
}

export interface AuditRun {
  invoice: ParsedInvoice;
  variances: Variance[];
  billedMinor: number;
  recoverableMinor: number;
  verdict: "recoverable" | "clean" | "unreadable";
  dispute: { subject: string; body: string };
  /** Rows for the Excel/Sheets dispute log, header first. */
  sheetRows: string[][];
  source: "heuristic";
}
