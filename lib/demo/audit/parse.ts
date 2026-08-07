import type { InvoiceLine, ParsedInvoice } from "./types";

/**
 * 02 · AGENT — read the invoice.
 *
 * Regex parsing of a pasted invoice. Handles the shape carriers actually send:
 * a label, whitespace, an amount at the end of the line.
 *
 * TODO (v2): this is the one node that genuinely wants a model — real invoices
 * arrive as PDFs with multi-column tables and per-carrier vocabulary. Swap this
 * function for a structured-output call and everything downstream is unchanged,
 * because the arithmetic never depended on how the reading happened.
 */

const CURRENCY_BY_SYMBOL: Record<string, string> = {
  "£": "GBP",
  "€": "EUR",
  "$": "USD",
};

/** Trailing amount on a line: "Base freight        1,450.00" */
const LINE_RE = /^(.*?)[\s.·]{2,}([£€$]?\s?-?[\d][\d,\s]*(?:\.\d{1,2})?)\s*$/;
/** Same, but tolerant of a single space before the amount. */
const LOOSE_LINE_RE = /^(.+?)\s+([£€$]?\s?-?[\d][\d,]*(?:\.\d{1,2})?)\s*$/;

const TOTAL_LABEL = /^\s*(total|amount due|invoice total|grand total|balance)\b/i;
const SKIP_LABEL = /^\s*(subtotal|vat|tax|net|gross)\b/i;

export function toMinor(raw: string): number | null {
  const cleaned = raw.replace(/[£€$\s]/g, "").replace(/,/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Lowercase, strip punctuation and digits — for matching against the card. */
export function normaliseLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readUnits(label: string): number | null {
  const match = label.match(/(\d+)\s*(day|days|container|containers|pallet|pallets|hour|hours)\b/i);
  return match ? Number(match[1]) : null;
}

function readLane(text: string): { from: string; to: string } | null {
  const match = text.match(
    /([A-Za-z][A-Za-z .'-]{2,24}?)\s*(?:→|->|—>|>|\bto\b)\s*([A-Za-z][A-Za-z .'-]{2,24})/,
  );
  if (!match) return null;

  const from = match[1].trim();
  const to = match[2].trim();
  // "Refer to" and friends produce nonsense pairs; require both to look placey.
  if (from.length < 3 || to.length < 3) return null;
  return { from, to };
}

export function parseInvoice(text: string): ParsedInvoice {
  const rawLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  let currency = "GBP";
  for (const symbol of Object.keys(CURRENCY_BY_SYMBOL)) {
    if (text.includes(symbol)) {
      currency = CURRENCY_BY_SYMBOL[symbol];
      break;
    }
  }
  const code = text.match(/\b(GBP|EUR|USD|SGD|PHP)\b/);
  if (code) currency = code[1];

  const carrier =
    text.match(/^\s*(?:carrier|from|supplier|vendor)\s*[:\-]\s*(.+)$/im)?.[1]?.trim() ??
    null;
  const invoiceNumber =
    text.match(/\b(?:invoice|inv)\s*(?:no\.?|number|#)?\s*[:\-]?\s*([A-Z0-9][\w\-/]{2,})/i)?.[1] ??
    null;
  const reference =
    text.match(/\b(?:ref|reference|shipment|consignment|job)\s*(?:no\.?|#)?\s*[:\-]?\s*([A-Z0-9][\w\-/]{2,})/i)?.[1] ??
    null;

  const lines: InvoiceLine[] = [];
  let statedTotalMinor: number | null = null;

  for (const raw of rawLines) {
    const match = raw.match(LINE_RE) ?? raw.match(LOOSE_LINE_RE);
    if (!match) continue;

    const label = match[1].trim().replace(/[:.\-–]+$/, "").trim();
    const amount = toMinor(match[2]);
    if (amount === null || !label) continue;

    if (TOTAL_LABEL.test(label)) {
      statedTotalMinor = amount;
      continue;
    }
    if (SKIP_LABEL.test(label)) continue;

    // A bare number with no words isn't a charge line.
    if (!/[a-z]{3}/i.test(label)) continue;

    lines.push({
      label,
      key: normaliseLabel(label),
      amountMinor: amount,
      units: readUnits(label),
    });
  }

  return {
    carrier,
    invoiceNumber,
    reference,
    lane: readLane(text),
    currency,
    lines,
    statedTotalMinor,
  };
}
