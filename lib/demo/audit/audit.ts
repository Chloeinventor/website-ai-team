import { agreedBaseFor, type RateCard } from "./rate-card";
import type { InvoiceLine, ParsedInvoice, Variance } from "./types";

/**
 * 03 · ACTION — check the rate card.
 *
 * Pure arithmetic over the parsed invoice. Every figure here is one a buyer
 * could be asked to defend in an email to their carrier, so every figure is
 * reproducible: same invoice plus same rate card always yields the same
 * recovery. No model, no sampling, no rounding surprises.
 */

const BASE = /\b(base|freight|linehaul|line haul|ocean|sea|road) (freight|rate|charge)?\b|^freight$|^base$/;
const FUEL = /\b(fuel|baf|bunker|emission|ems)\b/;
const DEMURRAGE = /\b(demurrage|detention|storage|quay rent)\b/;

function classify(line: InvoiceLine): "base" | "fuel" | "demurrage" | "accessorial" {
  if (BASE.test(line.key)) return "base";
  if (FUEL.test(line.key)) return "fuel";
  if (DEMURRAGE.test(line.key)) return "demurrage";
  return "accessorial";
}

function isAgreed(card: RateCard, key: string): boolean {
  return card.agreedAccessorials.some(
    (allowed) => key.includes(allowed) || allowed.includes(key),
  );
}

export function findVariances(
  invoice: ParsedInvoice,
  card: RateCard,
): Variance[] {
  const variances: Variance[] = [];
  const seen = new Map<string, InvoiceLine>();

  const baseLine = invoice.lines.find((line) => classify(line) === "base");
  const agreedBase = agreedBaseFor(card, invoice.lane);

  for (const line of invoice.lines) {
    const kind = classify(line);

    // --- duplicates: the same charge twice on one invoice -------------------
    const previous = seen.get(line.key);
    if (previous) {
      variances.push({
        kind: "duplicate",
        line: line.label,
        billedMinor: line.amountMinor,
        expectedMinor: 0,
        recoverableMinor: line.amountMinor,
        reason: `"${previous.label}" is billed twice on this invoice.`,
        confidence: "high",
      });
      continue;
    }
    seen.set(line.key, line);

    // --- base freight above the agreed lane rate ----------------------------
    if (kind === "base" && agreedBase !== null) {
      const over = line.amountMinor - agreedBase;
      if (over > card.floorMinor) {
        variances.push({
          kind: "over_rate",
          line: line.label,
          billedMinor: line.amountMinor,
          expectedMinor: agreedBase,
          recoverableMinor: over,
          reason: `Contracted rate for this lane is the agreed base; billed above it.`,
          confidence: "high",
        });
      }
      continue;
    }

    // --- fuel surcharge above the contractual cap ---------------------------
    if (kind === "fuel") {
      // Cap against the agreed base where we know it, else the billed base —
      // otherwise an inflated base quietly inflates the permitted surcharge.
      const basis = agreedBase ?? baseLine?.amountMinor ?? null;
      if (basis === null) continue;

      const cap = Math.round((basis * card.surchargeCapPct) / 100);
      const over = line.amountMinor - cap;
      if (over > card.floorMinor) {
        variances.push({
          kind: "surcharge_cap",
          line: line.label,
          billedMinor: line.amountMinor,
          expectedMinor: cap,
          recoverableMinor: over,
          reason: `Contract caps fuel at ${card.surchargeCapPct}% of the agreed base.`,
          confidence: "high",
        });
      }
      continue;
    }

    // --- demurrage billed inside free time ----------------------------------
    if (kind === "demurrage") {
      const days = line.units;
      if (days !== null && days <= card.demurrageFreeDays) {
        variances.push({
          kind: "free_time",
          line: line.label,
          billedMinor: line.amountMinor,
          expectedMinor: 0,
          recoverableMinor: line.amountMinor,
          reason: `Contract includes ${card.demurrageFreeDays} free days; this bills ${days}.`,
          confidence: "high",
        });
      } else if (days === null) {
        variances.push({
          kind: "free_time",
          line: line.label,
          billedMinor: line.amountMinor,
          expectedMinor: null,
          recoverableMinor: 0,
          reason: `No day count stated — ask for the detention breakdown before paying.`,
          confidence: "review",
        });
      }
      continue;
    }

    // --- accessorials that aren't in the contract ---------------------------
    if (kind === "accessorial" && !isAgreed(card, line.key)) {
      variances.push({
        kind: "unagreed_charge",
        line: line.label,
        billedMinor: line.amountMinor,
        expectedMinor: null,
        recoverableMinor: line.amountMinor,
        reason: `Not listed in the agreed accessorials — query before paying.`,
        confidence: "review",
      });
    }
  }

  // --- does the invoice even add up? ----------------------------------------
  const summed = invoice.lines.reduce((total, line) => total + line.amountMinor, 0);
  if (
    invoice.statedTotalMinor !== null &&
    Math.abs(invoice.statedTotalMinor - summed) > card.floorMinor
  ) {
    const over = invoice.statedTotalMinor - summed;
    variances.push({
      kind: "arithmetic",
      line: "Invoice total",
      billedMinor: invoice.statedTotalMinor,
      expectedMinor: summed,
      recoverableMinor: Math.max(over, 0),
      reason:
        over > 0
          ? `Lines sum to less than the total billed.`
          : `Lines sum to more than the total billed — in your favour, but worth flagging.`,
      confidence: "high",
    });
  }

  // Biggest recovery first: that's the order a person wants to read them in.
  return variances.sort((a, b) => b.recoverableMinor - a.recoverableMinor);
}
