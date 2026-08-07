import { findVariances } from "./audit";
import { parseInvoice } from "./parse";
import { DEFAULT_RATE_CARD, type RateCard } from "./rate-card";
import type { AuditRun, Variance } from "./types";

export { findVariances } from "./audit";
export { parseInvoice, toMinor, normaliseLabel } from "./parse";
export { DEFAULT_RATE_CARD, agreedBaseFor } from "./rate-card";
export type { RateCard } from "./rate-card";
export * from "./types";

export function formatMoney(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(minor / 100);
  } catch {
    return `${currency} ${(minor / 100).toFixed(2)}`;
  }
}

function buildDispute(
  invoice: AuditRun["invoice"],
  variances: Variance[],
  recoverableMinor: number,
): { subject: string; body: string } {
  const ref = invoice.invoiceNumber ?? invoice.reference ?? "[invoice]";
  const carrier = invoice.carrier ?? "there";
  const high = variances.filter((v) => v.confidence === "high");
  const review = variances.filter((v) => v.confidence === "review");

  const lines = [
    `Hi ${carrier === "there" ? "there" : carrier},`,
    "",
    `We've checked invoice ${ref} against our agreed rates and there are a few lines we can't pass for payment as billed.`,
    "",
    ...high.map(
      (v) =>
        `• ${v.line} — billed ${formatMoney(v.billedMinor, invoice.currency)}${
          v.expectedMinor !== null
            ? `, expected ${formatMoney(v.expectedMinor, invoice.currency)}`
            : ""
        }. ${v.reason}`,
    ),
  ];

  if (review.length) {
    lines.push(
      "",
      "And these we'd like explained before we settle:",
      ...review.map((v) => `• ${v.line} — ${formatMoney(v.billedMinor, invoice.currency)}. ${v.reason}`),
    );
  }

  lines.push(
    "",
    `That's ${formatMoney(recoverableMinor, invoice.currency)} in total we're holding pending a credit or an explanation. Happy to settle the balance today.`,
    "",
    "Thanks,",
    "[Your name]",
  );

  return {
    subject: `${ref} — query before payment`,
    body: lines.join("\n"),
  };
}

/**
 * The four nodes, in order:
 *   01 TRIGGER  the pasted invoice
 *   02 AGENT    parseInvoice   — fuzzy reading
 *   03 ACTION   findVariances  — deterministic arithmetic vs the rate card
 *   04 OUTPUT   dispute pack   — sheet rows + a drafted email
 */
export function runAudit(
  text: string,
  options: { rateCard?: RateCard } = {},
): AuditRun {
  const card = options.rateCard ?? DEFAULT_RATE_CARD;
  const invoice = parseInvoice(text);

  const billedMinor =
    invoice.statedTotalMinor ??
    invoice.lines.reduce((total, line) => total + line.amountMinor, 0);

  if (!invoice.lines.length) {
    return {
      invoice,
      variances: [],
      billedMinor: 0,
      recoverableMinor: 0,
      verdict: "unreadable",
      dispute: {
        subject: "",
        body: "",
      },
      sheetRows: [],
      source: "heuristic",
    };
  }

  const variances = findVariances(invoice, card);
  const recoverableMinor = variances.reduce(
    (total, variance) => total + variance.recoverableMinor,
    0,
  );

  const sheetRows: string[][] = [
    ["Invoice", "Line", "Issue", "Billed", "Expected", "Recoverable", "Confidence"],
    ...variances.map((v) => [
      invoice.invoiceNumber ?? "—",
      v.line,
      v.kind.replace(/_/g, " "),
      formatMoney(v.billedMinor, invoice.currency),
      v.expectedMinor !== null ? formatMoney(v.expectedMinor, invoice.currency) : "—",
      formatMoney(v.recoverableMinor, invoice.currency),
      v.confidence,
    ]),
  ];

  return {
    invoice,
    variances,
    billedMinor,
    recoverableMinor,
    verdict: recoverableMinor > 0 || variances.length ? "recoverable" : "clean",
    dispute: variances.length
      ? buildDispute(invoice, variances, recoverableMinor)
      : { subject: "", body: "" },
    sheetRows,
    source: "heuristic",
  };
}
