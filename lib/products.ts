/**
 * PLACEHOLDER CATALOG.
 * Every string in [brackets] and every price below is a placeholder — see README
 * ("Replace before launch"). Prices are in MINOR UNITS (cents / centavos) because
 * that is what all three gateways expect.
 *
 * Each product carries a price per rail currency rather than one price + FX at
 * runtime: Revolut settles in EUR here, PayMongo only does PHP, HitPay only does
 * SGD. Set each one deliberately instead of letting a stale exchange rate decide.
 */

export type CurrencyCode = "EUR" | "PHP" | "SGD";

export type DemoKind = "qualifier" | "triage" | "proposal" | "watchtower";

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
    slug: "lead-qualifier",
    name: "[Inbound Lead Qualifier]",
    outcome: "Qualifies every inbound lead in under 60 seconds.",
    blurb:
      "A form fill lands, the agent enriches it, scores it against your rules, and either books the call or sends a polite no — before you've opened the tab.",
    priceMinor: { EUR: 49000, PHP: 3200000, SGD: 72000 },
    billing: "one-time · yours to keep",
    demo: "qualifier",
    runsOn: ["n8n", "webhook in", "your CRM"],
    setupTime: "[~40 min]",
    flagship: true,
    steps: [
      {
        kind: "trigger",
        label: "Form submitted",
        detail: "Webhook catches the payload the moment your form posts.",
      },
      {
        kind: "action",
        label: "Enrich company",
        detail: "Domain → headcount, funding, stack, region.",
      },
      {
        kind: "agent",
        label: "Score against ICP",
        detail: "Your rules in plain English, not a points spreadsheet.",
      },
      {
        kind: "output",
        label: "Route + reply",
        detail: "Books, nurtures, or declines. Always writes back.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Scoring prompt you can edit in English",
      "CRM + calendar wiring for one stack",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "inbox-triage",
    name: "[Inbox Triage Agent]",
    outcome: "Clears the 80% of your inbox that never needed you.",
    blurb:
      "Reads every new thread, files it, drafts the obvious replies, and leaves a three-line summary of what actually needs a human.",
    priceMinor: { EUR: 34000, PHP: 2200000, SGD: 50000 },
    billing: "one-time · yours to keep",
    demo: "triage",
    runsOn: ["Gmail", "n8n", "Slack"],
    setupTime: "[~25 min]",
    steps: [
      {
        kind: "trigger",
        label: "New thread",
        detail: "Watches the inbox, batched every few minutes.",
      },
      {
        kind: "agent",
        label: "Classify + summarise",
        detail: "Intent, urgency, who it's really for.",
      },
      {
        kind: "action",
        label: "Draft reply",
        detail: "Sits in drafts. Never sends without you.",
      },
      {
        kind: "output",
        label: "Morning digest",
        detail: "One message: what moved, what's waiting.",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Label taxonomy you can rename",
      "Tone sample trained on [10] of your own sent emails",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "proposal-builder",
    name: "[Proposal Builder]",
    outcome: "Turns a call recording into a sendable proposal by lunch.",
    blurb:
      "Transcript in, scoped proposal out — with the pricing table, the assumptions you always forget, and a follow-up sequence queued behind it.",
    priceMinor: { EUR: 39000, PHP: 2600000, SGD: 58000 },
    billing: "one-time · yours to keep",
    demo: "proposal",
    runsOn: ["Fireflies", "Docs", "n8n"],
    setupTime: "[~35 min]",
    steps: [
      {
        kind: "trigger",
        label: "Call ends",
        detail: "Transcript arrives from your recorder.",
      },
      {
        kind: "agent",
        label: "Extract scope",
        detail: "Problem, constraints, budget signals, deadline.",
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
      "Proposal template wired to your pricing rules",
      "Follow-up sequence ([3] touches)",
      "[30 days] of fixes if something breaks",
    ],
  },
  {
    slug: "ops-watchtower",
    name: "[Ops Watchtower]",
    outcome: "Tells you what broke, in English, before a client does.",
    blurb:
      "Watches your workflows, jobs, and integrations. When something fails it explains the failure, names the likely cause, and retries what's safe to retry.",
    priceMinor: { EUR: 29000, PHP: 1900000, SGD: 42000 },
    billing: "one-time · yours to keep",
    demo: "watchtower",
    runsOn: ["n8n", "Make", "Slack"],
    setupTime: "[~20 min]",
    steps: [
      {
        kind: "trigger",
        label: "Run fails",
        detail: "Any workflow, any platform, one listener.",
      },
      {
        kind: "agent",
        label: "Explain it",
        detail: "Reads the error and the last good run.",
      },
      {
        kind: "action",
        label: "Retry what's safe",
        detail: "Idempotent steps only. Never double-charges anyone.",
      },
      {
        kind: "output",
        label: "Alert with a verdict",
        detail: "“Stripe timed out, retried, fine now.”",
      },
    ],
    includes: [
      "Importable workflow JSON",
      "Failure taxonomy + retry policy",
      "Slack / email alerting",
      "[30 days] of fixes if something breaks",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const FLAGSHIP =
  PRODUCTS.find((p) => p.flagship) ?? (PRODUCTS[0] as Product);
