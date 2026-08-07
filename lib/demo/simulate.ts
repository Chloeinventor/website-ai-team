import type { DemoKind } from "@/lib/products";

/**
 * The try-it engine for products that don't have a runner of their own.
 *
 * These are 100% client-side and deterministic: no API key, no signup, no
 * request leaves the browser. They read what the visitor actually typed and
 * react to it, so a run is specific rather than canned — but they are
 * simulations of the product, not the product.
 *
 * [Freight Invoice Auditor] and [Proposal Builder] don't appear here. Both have
 * real pipelines under lib/demo/, wired in through components/demo-surface.tsx.
 */

export interface RunStep {
  id: string;
  kind: "trigger" | "agent" | "action" | "output";
  label: string;
  detail: string;
  /** Simulated latency, so the run feels like work rather than a reveal. */
  ms: number;
}

export interface RunField {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral";
}

export interface RunResult {
  verdict: string;
  tone: "good" | "warn" | "neutral";
  summary: string;
  fields: RunField[];
  /** Optional drafted artefact — the thing the workflow would have produced. */
  draft?: { title: string; body: string };
}

export interface RunOutput {
  steps: RunStep[];
  result: RunResult;
  /**
   * Product-specific payload for a custom renderer. The generic result card
   * ignores it; the products with real pipelines carry their whole run here.
   */
  artifact?: unknown;
}

// ---------------------------------------------------------------------------
// Shared readers
// ---------------------------------------------------------------------------

function rows(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3 && /[a-z0-9]/i.test(line));
}

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function firstField(line: string): string {
  return line.split(/[,;\t|]/)[0]!.trim().slice(0, 32);
}

// ---------------------------------------------------------------------------
// [Carrier Scorecard]
// ---------------------------------------------------------------------------

function scorecard(input: string): RunOutput {
  const lines = rows(input);
  const late = lines.filter((line) => /\b(late|delayed|missed|overdue|failed slot)\b/i.test(line));
  const damaged = lines.filter((line) => /\b(damag\w+|broken|shortage|short[- ]?ship\w*)\b/i.test(line));
  const exceptions = lines.filter((line) =>
    /\b(exception|refused|redeliver\w*|not home|access denied|returned)\b/i.test(line),
  );

  const carriers = new Map<string, { total: number; late: number }>();
  for (const line of lines) {
    const name = firstField(line);
    if (!/[a-z]{3}/i.test(name)) continue;
    const entry = carriers.get(name) ?? { total: 0, late: 0 };
    entry.total += 1;
    if (/\b(late|delayed|missed|overdue)\b/i.test(line)) entry.late += 1;
    carriers.set(name, entry);
  }

  const worst = [...carriers.entries()]
    .filter(([, entry]) => entry.total >= 2)
    .sort((a, b) => b[1].late / b[1].total - a[1].late / a[1].total)[0];

  const onTime = lines.length - late.length;
  const onTimeRate = lines.length ? onTime / lines.length : 0;
  const healthy = onTimeRate >= 0.95;

  return {
    steps: [
      { id: "trigger", kind: "trigger", label: "Month closes", detail: `${lines.length} delivery rows in scope`, ms: 260 },
      {
        id: "normalise",
        kind: "agent",
        label: "Normalise the data",
        detail: `${carriers.size || 1} carrier${carriers.size === 1 ? "" : "s"} · columns reconciled`,
        ms: 720,
      },
      {
        id: "compute",
        kind: "action",
        label: "Compute the metrics",
        detail: `on-time ${pct(onTime, lines.length)} · damage ${pct(damaged.length, lines.length)}`,
        ms: 560,
      },
      { id: "book", kind: "output", label: "Workbook + summary", detail: "Excel with charts, ready to send", ms: 380 },
    ],
    result: {
      verdict: healthy ? "Performance holding" : "Service level slipping",
      tone: healthy ? "good" : "warn",
      summary: healthy
        ? `On-time is above the ${(0.95 * 100).toFixed(0)}% threshold. Worth sending as a "no action" month — the ones you don't have to chase are the point of measuring.`
        : `On-time is under threshold${worst ? `, and ${worst[0]} is carrying most of it` : ""}. This is the sheet you put in front of them at the review.`,
      fields: [
        { label: "Rows analysed", value: String(lines.length) },
        { label: "On-time", value: pct(onTime, lines.length), tone: healthy ? "good" : "warn" },
        { label: "Damage rate", value: pct(damaged.length, lines.length), tone: damaged.length ? "warn" : "good" },
        { label: "Exceptions", value: String(exceptions.length) },
        { label: "Worst carrier", value: worst ? worst[0] : "—", tone: worst ? "warn" : "neutral" },
      ],
      draft: {
        title: "Summary line for the workbook",
        body: healthy
          ? `On-time ${pct(onTime, lines.length)} across ${lines.length} drops, ${damaged.length} damage claims, ${exceptions.length} exceptions. No carrier below tolerance this period.`
          : `On-time ${pct(onTime, lines.length)} across ${lines.length} drops — below the [95%] contractual threshold. ${
              worst ? `${worst[0]} accounts for ${worst[1].late} of ${late.length} late deliveries. ` : ""
            }Recommend raising at the monthly review with a corrective action plan.`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// [POD Chaser]
// ---------------------------------------------------------------------------

function pod(input: string): RunOutput {
  const lines = rows(input);
  const missing = lines.filter((line) =>
    /\b(no pod|missing|awaiting|pending|not received|n\/?a|none|—|-{2,})\b/i.test(line),
  );
  const aged = missing.filter((line) => /\b(1[4-9]|[2-9]\d)\s*days?\b/i.test(line));
  const carriers = new Set(missing.map(firstField).filter((name) => /[a-z]{3}/i.test(name)));

  const value = lines
    .map((line) => line.match(/[£€$]\s?([\d,]+(?:\.\d{2})?)/))
    .filter(Boolean)
    .reduce((total, match) => total + Number(match![1].replace(/,/g, "")), 0);

  const clean = missing.length === 0;

  return {
    steps: [
      { id: "trigger", kind: "trigger", label: "Delivery due", detail: `${lines.length} consignments past ETA`, ms: 240 },
      {
        id: "match",
        kind: "agent",
        label: "Match the paperwork",
        detail: `${lines.length - missing.length} matched · ${missing.length} with nothing attached`,
        ms: 700,
      },
      {
        id: "chase",
        kind: "action",
        label: "Chase what's missing",
        detail: clean
          ? "Nothing to chase"
          : `${carriers.size || 1} carrier${carriers.size === 1 ? "" : "s"} · driver first, then the desk`,
        ms: 540,
      },
      {
        id: "list",
        kind: "output",
        label: "Ready-to-invoice list",
        detail: clean ? "Everything billable" : `${missing.length} held, ${aged.length} aged past [14 days]`,
        ms: 340,
      },
    ],
    result: {
      verdict: clean ? "All clear to invoice" : `${missing.length} consignments not billable yet`,
      tone: clean ? "good" : aged.length ? "warn" : "neutral",
      summary: clean
        ? "Every consignment has proof attached. Nothing here is blocking a invoice run."
        : `${missing.length} deliveries have no proof attached${
            value ? `, holding roughly ${value.toLocaleString("en-GB")} of billing` : ""
          }. Chases go out on the ladder; the list clears itself as documents land.`,
      fields: [
        { label: "Consignments", value: String(lines.length) },
        { label: "Missing POD", value: String(missing.length), tone: clean ? "good" : "warn" },
        { label: "Aged past [14d]", value: String(aged.length), tone: aged.length ? "warn" : "good" },
        { label: "Carriers to chase", value: String(carriers.size) },
      ],
      draft: {
        title: clean ? "Nothing sent" : "First chase, as it goes out",
        body: clean
          ? "No chase needed — the workflow stays quiet on a clean run rather than emailing you to say so."
          : `Hi — we're missing proof of delivery for ${missing.length} consignment${
              missing.length === 1 ? "" : "s"
            } from last week, listed below. We can't raise the invoice without them, so anything you can send today helps.\n\nIf the driver has a photo on their phone that's fine — it doesn't need to be the signed copy.`,
      },
    },
  };
}

// ---------------------------------------------------------------------------

const ENGINES: Partial<Record<DemoKind, (input: string) => RunOutput>> = {
  scorecard,
  pod,
};

export function simulate(kind: DemoKind, input: string): RunOutput {
  const engine = ENGINES[kind];
  if (!engine) {
    // audit and proposal have real pipelines and are routed away in
    // components/demo-surface.tsx before this is ever reached.
    throw new Error(`No simulate engine for "${kind}" — that product has its own runner.`);
  }
  return engine(input.trim() || PROMPT_EXAMPLES[kind][0].text);
}

export interface PromptExample {
  /** What the chip says. Chips load an example — they never report a verdict. */
  label: string;
  text: string;
}

export const PROMPT_EXAMPLES: Record<DemoKind, PromptExample[]> = {
  audit: [
    {
      label: "load example",
      text: `Carrier: Northwind Freight
Invoice: INV-88231
Ref: SHP-4471   Rotterdam → Felixstowe

Base freight                  1,450.00
Fuel surcharge (BAF)            218.00
Congestion fee                   95.00
Documentation                    45.00
Demurrage 3 days                360.00
Total                         2,168.00`,
    },
    {
      label: "a clean one",
      text: `Carrier: Northwind Freight
Invoice: INV-88240
Ref: SHP-4488   Rotterdam → Felixstowe

Base freight                  1,300.00
Fuel surcharge (BAF)            150.00
Documentation                    45.00
Total                         1,495.00`,
    },
    {
      label: "doesn't add up",
      text: `Carrier: Harbour Lines
Invoice: HL-2201
Ref: SHP-5010   Shanghai → Felixstowe

Ocean freight                 2,850.00
Terminal handling               310.00
Documentation                    45.00
Documentation                    45.00
Total                         3,420.00`,
    },
  ],
  scorecard: [
    {
      label: "load example",
      text: `Northwind, SHP-1180, delivered on time
Northwind, SHP-1181, late 3h, missed slot
Northwind, SHP-1184, delivered on time
Harbour Lines, SHP-1190, delivered on time
Harbour Lines, SHP-1191, damaged pallet, shortage
Harbour Lines, SHP-1192, delivered on time
Meridian, SHP-1200, refused at door, redelivery
Meridian, SHP-1201, delivered on time`,
    },
    {
      label: "a good month",
      text: `Northwind, SHP-1310, delivered on time
Northwind, SHP-1311, delivered on time
Harbour Lines, SHP-1320, delivered on time
Harbour Lines, SHP-1321, delivered on time`,
    },
  ],
  pod: [
    {
      label: "load example",
      text: `Northwind, SHP-1180, £2,400, POD received
Northwind, SHP-1181, £1,850, no POD, 16 days
Harbour Lines, SHP-1190, £3,100, awaiting
Harbour Lines, SHP-1191, £980, POD received
Meridian, SHP-1200, £2,250, missing, 21 days`,
    },
    {
      label: "all clear",
      text: `Northwind, SHP-1310, £2,400, POD received
Harbour Lines, SHP-1320, £1,900, POD received`,
    },
  ],
  proposal: [
    {
      label: "load example",
      text: "They want inbound leads scored and routed to two reps, plus a weekly summary in Slack. Budget hinted around $6k. Wants it before the trade show in three weeks.",
    },
    {
      label: "vague call",
      text: "Chatted with Dan, they're drowning in admin and want 'AI to help somehow'. Didn't get to budget. Said they'd think about timing.",
    },
  ],
};
