/**
 * PLACEHOLDER CATALOG — logistics.
 *
 * Every string in [brackets] and every price is a placeholder — see README
 * ("Replace before launch"). Prices are in MINOR UNITS (cents / centavos)
 * because that is what all three gateways expect.
 *
 * Each product carries a price per rail currency rather than one price + FX at
 * runtime: Revolut settles in EUR here, PayMongo only does PHP, HitPay only
 * does SGD. Set each one deliberately instead of letting a stale exchange rate
 * decide.
 *
 * Selection principle for this shelf: universal inputs (invoices, email,
 * spreadsheets — nothing that needs a proprietary TMS licence), a provable
 * money outcome rather than a time saving, and a demo that lands from a single
 * paste.
 */

export type CurrencyCode = "EUR" | "PHP" | "SGD";

export type DemoKind = "audit" | "scorecard" | "pod" | "proposal";

export interface ProductStep {
  /** Node type drives the accent colour — trigger / agent / action / output. */
  kind: "trigger" | "agent" | "action" | "output";
  label: string;
  detail: string;
}

export interface Product {
  slug: string;
  name: string;
  /** One line, outcome-shaped. Not a feature list. */
  outcome: string;
  blurb: string;
  priceMinor: Record<CurrencyCode, number>;
  billing: string;
  demo: DemoKind;
  runsOn: string[];
  steps: ProductStep[];
  includes: string[];
  setupTime: string;
  flagship?: boolean;
}

export const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; decimals: number; label: string }
> = {
  EUR: { symbol: "€", decimals: 2, label: "Euro" },
  PHP: { symbol: "₱", decimals: 2, label: "Philippine peso" },
  SGD: { symbol: "S$", decimals: 2, label: "Singapore dollar" },
};

export function formatPrice(minor: number, currency: CurrencyCode): string {
  const meta = CURRENCY_META[currency];
  const major = minor / 10 ** meta.decimals;
  return `${meta.symbol}${major.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export const PRODUCTS: Product[] = [
  {
    slug: "freight-invoice-auditor",
    name: "[Freight Invoice Auditor]",
    outcome: "Finds the money your carriers overcharged you.",
    blurb:
      "Every freight invoice checked against your rate card before it's paid — base rate, surcharge caps, accessorials you never agreed to, and demurrage inside free time. Flags what's recoverable and drafts the dispute.",
    priceMinor: { EUR: 89000, PHP: 5600000, SGD: 130000 },
    billing: "one-time · yours to keep",
    demo: "audit",
    runsOn: ["Email", "Excel rate card", "n8n"],
    setupTime: "[~45 min]",
    flagship: true,
    steps: [
      {
        kind: "trigger",
        label: "Invoice arrives",
        detail: "Email, PDF, or a drop in a watched folder.",
      },
      {
        kind: "agent",
        label: "Read the invoice",
        detail: "Lane, charges, units — line by line.",
      },
      {
        kind: "action",
        label: "Check the rate card",
        detail: "Your contract, your caps, your free time.",
      },
      {
        kind: "output",
        label: "Dispute pack",
        detail: "Recoverable total, sheet, drafted email.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Rate-card template (Excel or Sheets) you fill in once",
      "Dispute email template in your own wording",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "carrier-scorecard",
    name: "[Carrier Scorecard]",
    outcome: "Your monthly carrier review, built overnight.",
    blurb:
      "On-time percentage, damage rate, cost per drop and exception counts by carrier — assembled from the data you already have and delivered as a formatted workbook the week it's due, not the week after.",
    priceMinor: { EUR: 59000, PHP: 3800000, SGD: 87000 },
    billing: "one-time · yours to keep",
    demo: "scorecard",
    runsOn: ["Sheets or Excel", "n8n", "Email"],
    setupTime: "[~35 min]",
    steps: [
      {
        kind: "trigger",
        label: "Month closes",
        detail: "Runs on a schedule, not on a reminder.",
      },
      {
        kind: "agent",
        label: "Normalise the data",
        detail: "Every carrier names their columns differently.",
      },
      {
        kind: "action",
        label: "Compute the metrics",
        detail: "On-time, damage, cost per drop, exceptions.",
      },
      {
        kind: "output",
        label: "Workbook + summary",
        detail: "Excel with charts, and the three lines that matter.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Excel/Sheets template with the charts already wired",
      "Metric definitions you can argue with a carrier about",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "pod-chaser",
    name: "[POD Chaser]",
    outcome: "Chases every missing delivery note so you can invoice.",
    blurb:
      "Finds the deliveries with no proof attached, chases the driver or carrier on a schedule, and stops the moment the document lands. The cash you can't invoice for is usually sitting behind a missing PDF.",
    priceMinor: { EUR: 44000, PHP: 2800000, SGD: 65000 },
    billing: "one-time · yours to keep",
    demo: "pod",
    runsOn: ["Email", "Sheets", "n8n"],
    setupTime: "[~25 min]",
    steps: [
      {
        kind: "trigger",
        label: "Delivery due",
        detail: "Watches the manifest for anything past ETA.",
      },
      {
        kind: "agent",
        label: "Match the paperwork",
        detail: "Ties inbound PDFs to the right consignment.",
      },
      {
        kind: "action",
        label: "Chase what's missing",
        detail: "Driver, then carrier, then the account manager.",
      },
      {
        kind: "output",
        label: "Ready-to-invoice list",
        detail: "What's cleared, what's still stuck, and with whom.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Escalation ladder you can re-time",
      "Consignment matching rules",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "proposal-builder",
    name: "[Proposal Builder]",
    outcome: "Turns a rate enquiry into a sendable quote by lunch.",
    blurb:
      "Call notes or an RFQ in, scoped quote out — with the pricing table, the assumptions you always forget, and a follow-up sequence queued behind it. Built for the tender you'd otherwise answer at 9pm.",
    priceMinor: { EUR: 39000, PHP: 2600000, SGD: 58000 },
    billing: "one-time · yours to keep",
    demo: "proposal",
    runsOn: ["Email", "Docs", "n8n"],
    setupTime: "[~35 min]",
    steps: [
      {
        kind: "trigger",
        label: "Enquiry lands",
        detail: "Call notes, an email, or an RFQ document.",
      },
      {
        kind: "agent",
        label: "Extract scope",
        detail: "Lanes, volumes, constraints, budget signals, deadline.",
      },
      {
        kind: "action",
        label: "Fill the template",
        detail: "Your document, your pricing logic, your terms.",
      },
      {
        kind: "output",
        label: "Draft + reminders",
        detail: "Ready to send, with follow-ups pre-queued.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Quote template wired to your rate logic",
      "Follow-up sequence ([3] touches)",
      "[30 days] of fixes if something breaks",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const FLAGSHIP =
  PRODUCTS.find((p) => p.flagship) ?? (PRODUCTS[0] as Product);
