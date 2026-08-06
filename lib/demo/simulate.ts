import type { DemoKind } from "@/lib/products";

/**
 * The try-it engine.
 *
 * v1 is 100% client-side and deterministic: no API key, no signup, no request
 * leaves the browser. It reads what the visitor actually typed and reacts to it,
 * so the run is specific rather than canned — but it is a simulation of the
 * product, not the product.
 *
 * TODO (v2): swap `simulate()` for a call to a real sandbox run and stream the
 * live step events back. The RunStep/RunResult shapes below are already the
 * shapes a real run emits, so the UI shouldn't have to change.
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
   * ignores it; [Proposal Builder] carries its whole ProposalRun here.
   */
  artifact?: unknown;
}

// ---------------------------------------------------------------------------
// Shared readers
// ---------------------------------------------------------------------------

const URGENT =
  /\b(asap|urgent|today|tomorrow|this week|next week|immediately|deadline|before (?:our|the)\b|by (?:friday|month|q[1-4]))/i;
const HEADCOUNT = /\b(\d{1,5})\s?(?:\+)?\s?(?:people|employees|staff|seats|users|agents|reps)\b/i;
const SERIES = /\b(seed|pre-seed|series\s?[abcd]|bootstrapped|profitable)\b/i;
const EMAIL = /\b[\w.+-]+@([\w-]+\.[\w.-]+)\b/;
const DOMAIN = /\b((?:[\w-]+\.)+(?:com|io|co|ai|net|org|ph|sg|dev|app))\b/i;

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function firstMatch(input: string, re: RegExp): string | undefined {
  const m = input.match(re);
  return m ? (m[1] ?? m[0]) : undefined;
}

/**
 * Budget has to survive being echoed back to the visitor, so it's read as a
 * whole amount ("$8k", "S$12,000") rather than a bare capture group.
 * A figure only counts if it carries a currency mark or a k/m suffix —
 * otherwise "40 people" reads as a budget.
 */
function readBudget(input: string): string | undefined {
  const withSymbol = input.match(
    /(?:([$€₱]|s\$)|\b(usd|eur|php|sgd)\s?)\s?(\d[\d,.]*)\s?([km])?\b/i,
  );
  if (withSymbol) {
    const mark = withSymbol[1] ?? withSymbol[2]?.toUpperCase() + " ";
    return `${mark}${withSymbol[3]}${withSymbol[4]?.toLowerCase() ?? ""}`;
  }

  const suffixed = input.match(/\b(\d[\d,.]*)\s?([km])\b/i);
  return suffixed ? `${suffixed[1]}${suffixed[2].toLowerCase()}` : undefined;
}

function guessCompany(input: string): string {
  const email = input.match(EMAIL);
  if (email?.[1]) return titleCase(email[1].split(".")[0]);

  const domain = input.match(DOMAIN);
  if (domain?.[1]) return titleCase(domain[1].split(".")[0]);

  // "at Northwind", "from Northwind", or any Capitalised token that isn't a
  // sentence opener.
  const named = input.match(/\b(?:at|from|for|with)\s+([A-Z][\w&-]{2,})/);
  if (named?.[1]) return named[1];

  const caps = input
    .split(/\s+/)
    .slice(1)
    .filter((w) => /^[A-Z][\w&-]{2,}$/.test(w));
  return caps[0] ?? "[the sender]";
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

// ---------------------------------------------------------------------------
// [Inbound Lead Qualifier] — the flagship
// ---------------------------------------------------------------------------

function qualify(input: string): RunOutput {
  const company = guessCompany(input);
  const urgent = URGENT.test(input);
  const budget = readBudget(input);
  const headcount = firstMatch(input, HEADCOUNT);
  const stage = firstMatch(input, SERIES);
  const wantsDemo = /\b(demo|trial|try|call|walkthrough)\b/i.test(input);
  const isVendor = /\b(seo|backlink|guest post|outsourc|agency partnership|cheap)\b/i.test(
    input,
  );
  const isStudent = /\b(student|thesis|homework|free|portfolio|internship)\b/i.test(
    input,
  );

  let score = 42;
  if (budget) score += 22;
  if (headcount) score += Number(headcount) >= 20 ? 14 : 6;
  if (stage) score += /series/i.test(stage) ? 12 : 4;
  if (urgent) score += 10;
  if (wantsDemo) score += 8;
  if (input.length > 180) score += 4;
  if (isVendor) score -= 45;
  if (isStudent) score -= 25;
  score = clamp(score);

  const hot = score >= 70;
  const warm = score >= 45 && score < 70;

  const verdict = hot
    ? "Book the call"
    : warm
      ? "Nurture, don't call"
      : "Decline politely";

  const draftBody = hot
    ? `Hi — thanks for reaching out about ${company}.\n\nBased on what you sent, this is squarely something I build. I've held two slots this week; grab whichever suits:\n[cal.com/your-handle/30min]\n\nBefore we talk, one question: what does this cost you today if nothing changes?`
    : warm
      ? `Hi — thanks for the note about ${company}.\n\nSounds like a real problem, but I want to make sure the fit is right before either of us spends a call on it. I've sent over a two-minute teardown of how I'd approach it. If it lands, reply and I'll open a slot.`
      : `Hi — thanks for reaching out.\n\nThis isn't a fit for what I build, so I won't waste your time with a call. If that changes, my door is open.`;

  return {
    steps: [
      {
        id: "trigger",
        kind: "trigger",
        label: "Form submitted",
        detail: `Payload received · ${input.trim().split(/\s+/).length} words read`,
        ms: 220,
      },
      {
        id: "enrich",
        kind: "action",
        label: "Enrich company",
        detail: `${company}${headcount ? ` · ~${headcount} people` : ""}${
          stage ? ` · ${stage}` : ""
        }`,
        ms: 640,
      },
      {
        id: "score",
        kind: "agent",
        label: "Score against ICP",
        detail: [
          budget ? "budget signal ✓" : "no budget signal",
          urgent ? "timeline stated ✓" : "no timeline",
          isVendor ? "vendor pitch ✗" : "inbound intent ✓",
        ].join(" · "),
        ms: 880,
      },
      {
        id: "route",
        kind: "output",
        label: hot ? "Route to calendar" : warm ? "Route to nurture" : "Route to archive",
        detail: hot
          ? "Slot held, invite drafted"
          : warm
            ? "Added to [Warm] sequence, 3 touches"
            : "Closed-lost with a reason attached",
        ms: 460,
      },
    ],
    result: {
      verdict,
      tone: hot ? "good" : warm ? "warn" : "neutral",
      summary: hot
        ? `${company} clears your bar. The call is booked and the reply is written — you just approve it.`
        : warm
          ? `${company} is interesting but under-specified. Nurture beats a 30-minute call you'd regret.`
          : `${company} isn't a fit. Declined in a way you'd be happy to have signed.`,
      fields: [
        { label: "Fit score", value: `${score}/100`, tone: hot ? "good" : warm ? "warn" : "neutral" },
        { label: "Company", value: company },
        { label: "Budget signal", value: budget ? `~${budget}` : "not stated", tone: budget ? "good" : "warn" },
        { label: "Timeline", value: urgent ? "urgent" : "unstated" },
        { label: "Handled in", value: "38s" },
      ],
      draft: { title: "Drafted reply", body: draftBody },
    },
  };
}

// ---------------------------------------------------------------------------
// [Inbox Triage Agent]
// ---------------------------------------------------------------------------

function triage(input: string): RunOutput {
  const urgent = URGENT.test(input);
  const invoice = /\b(invoice|payment|receipt|billing|overdue|paid)\b/i.test(input);
  const support = /\b(broken|error|bug|not working|down|failed|stuck)\b/i.test(input);
  const sales = /\b(pricing|quote|proposal|interested|buy|demo)\b/i.test(input);
  const sender = guessCompany(input);

  const label = support
    ? "[Support]"
    : invoice
      ? "[Finance]"
      : sales
        ? "[Sales]"
        : "[FYI]";

  const needsHuman = support || (urgent && !invoice);

  return {
    steps: [
      { id: "trigger", kind: "trigger", label: "New thread", detail: `From ${sender}`, ms: 200 },
      {
        id: "classify",
        kind: "agent",
        label: "Classify + summarise",
        detail: `${label} · ${urgent ? "urgent" : "normal"} · ${
          needsHuman ? "needs you" : "auto-handled"
        }`,
        ms: 760,
      },
      {
        id: "draft",
        kind: "action",
        label: "Draft reply",
        detail: needsHuman ? "Draft saved, flagged for review" : "Draft saved in your voice",
        ms: 620,
      },
      {
        id: "digest",
        kind: "output",
        label: "Add to digest",
        detail: needsHuman ? "Top of tomorrow's list" : "Filed under handled",
        ms: 320,
      },
    ],
    result: {
      verdict: needsHuman ? "Flagged for you" : "Handled without you",
      tone: needsHuman ? "warn" : "good",
      summary: needsHuman
        ? `${sender} hit something that needs a person. The draft is ready; you just decide.`
        : `Filed under ${label} with a reply waiting in drafts. Nothing for you to do.`,
      fields: [
        { label: "Label", value: label },
        { label: "Urgency", value: urgent ? "high" : "normal", tone: urgent ? "warn" : "neutral" },
        { label: "Sender", value: sender },
        { label: "Your input needed", value: needsHuman ? "yes" : "no", tone: needsHuman ? "warn" : "good" },
      ],
      draft: {
        title: "Drafted reply",
        body: needsHuman
          ? `Hi — thanks for flagging this. I've picked it up and I'm looking now; you'll have a real answer from me within [4 hours], not a ticket number.`
          : `Hi — got it, thanks. ${
              invoice ? "Sending this to accounts now and confirming once it's cleared." : "Noted on my end, nothing needed from you."
            }`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// [Proposal Builder]
// ---------------------------------------------------------------------------

function proposal(input: string): RunOutput {
  const company = guessCompany(input);
  const budget = readBudget(input);
  const scope = input
    .split(/[.,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, 3);

  const deliverables = scope.length
    ? scope.map((s) => `• ${titleCase(s.slice(0, 78))}`)
    : ["• [Scope line one]", "• [Scope line two]"];

  return {
    steps: [
      { id: "trigger", kind: "trigger", label: "Transcript in", detail: `${input.trim().length} chars`, ms: 240 },
      {
        id: "extract",
        kind: "agent",
        label: "Extract scope",
        detail: `${deliverables.length} deliverables · ${budget ? `budget ~${budget}` : "budget unstated"}`,
        ms: 900,
      },
      { id: "price", kind: "action", label: "Apply pricing rules", detail: "Your rate card, your minimums", ms: 520 },
      { id: "draft", kind: "output", label: "Draft proposal", detail: "Ready to send, follow-ups queued", ms: 400 },
    ],
    result: {
      verdict: "Proposal drafted",
      tone: "good",
      summary: `A scoped proposal for ${company}, with the assumptions written down instead of assumed.`,
      fields: [
        { label: "Client", value: company },
        { label: "Deliverables", value: String(deliverables.length) },
        { label: "Budget signal", value: budget ? `~${budget}` : "to confirm", tone: budget ? "good" : "warn" },
        { label: "Drafted in", value: "51s" },
      ],
      draft: {
        title: "Proposal outline",
        body: `Scope for ${company}\n${deliverables.join("\n")}\n\nAssumptions\n• [You provide access to the systems named above]\n• [One round of revisions included]\n\nInvestment: ${
          budget ? `~${budget}` : "[amount]"
        } · Timeline: [2 weeks]`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// [Ops Watchtower]
// ---------------------------------------------------------------------------

function watchtower(input: string): RunOutput {
  const timeout = /\b(timeout|timed out|econnreset|504|502|gateway)\b/i.test(input);
  const auth = /\b(401|403|unauthorized|forbidden|token|expired|credential)\b/i.test(input);
  const rate = /\b(429|rate limit|quota|throttl)\b/i.test(input);
  const data = /\b(null|undefined|schema|validation|parse|missing field)\b/i.test(input);

  const cause = timeout
    ? "Upstream timeout"
    : auth
      ? "Expired credential"
      : rate
        ? "Rate limited"
        : data
          ? "Bad payload shape"
          : "Unclassified failure";

  const safeRetry = timeout || rate;

  return {
    steps: [
      { id: "trigger", kind: "trigger", label: "Run failed", detail: "Caught from the error channel", ms: 210 },
      { id: "explain", kind: "agent", label: "Explain it", detail: `${cause} · compared against last good run`, ms: 820 },
      {
        id: "retry",
        kind: "action",
        label: safeRetry ? "Retry (idempotent)" : "Hold — not safe to retry",
        detail: safeRetry ? "Backoff 30s, 2m, 8m" : "Would double-write. Escalating instead.",
        ms: 560,
      },
      {
        id: "alert",
        kind: "output",
        label: "Alert with a verdict",
        detail: safeRetry ? "Resolved before anyone noticed" : "Pinged you with the fix",
        ms: 300,
      },
    ],
    result: {
      verdict: safeRetry ? "Retried and cleared" : "Escalated to you",
      tone: safeRetry ? "good" : "warn",
      summary: safeRetry
        ? `${cause}. Retried on backoff and it went through — you're reading this after the fact, not during.`
        : `${cause}. Retrying wasn't safe, so it didn't. Here's the one thing to fix.`,
      fields: [
        { label: "Likely cause", value: cause },
        { label: "Safe to retry", value: safeRetry ? "yes" : "no", tone: safeRetry ? "good" : "warn" },
        { label: "Blast radius", value: safeRetry ? "none" : "[1 workflow]" },
        { label: "Detected in", value: "9s" },
      ],
      draft: {
        title: "Alert as sent",
        body: safeRetry
          ? `${cause} on [workflow name]. Retried twice, second attempt succeeded at [12:04]. No action needed — logging it so you know it happened.`
          : `${cause} on [workflow name]. Not retried: the next step writes to [system], so a retry would duplicate. Fix: ${
              auth ? "rotate the credential and re-run." : "check the payload shape from the previous node."
            }`,
      },
    },
  };
}

// ---------------------------------------------------------------------------

const ENGINES: Record<DemoKind, (input: string) => RunOutput> = {
  qualifier: qualify,
  triage,
  proposal,
  watchtower,
};

export function simulate(kind: DemoKind, input: string): RunOutput {
  return ENGINES[kind](input.trim() || PROMPT_EXAMPLES[kind][0].text);
}

export interface PromptExample {
  /** What the chip says. Chips load an example — they never report a verdict. */
  label: string;
  text: string;
}

export const PROMPT_EXAMPLES: Record<DemoKind, PromptExample[]> = {
  qualifier: [
    {
      label: "good fit",
      text: "Hi, I run ops at Northwind (40 people, Series A). Our inbound form dumps into a spreadsheet and we're losing leads. Budget around $8k, need something live before our Q4 push.",
    },
    {
      label: "obvious no",
      text: "hey do you do backlinks? we offer cheap SEO packages and guest posts, partnership opportunity",
    },
    {
      label: "edge case",
      text: "Student here writing a thesis on workflow automation — could I get the tool for free to reference?",
    },
  ],
  triage: [
    {
      label: "on fire",
      text: "Subject: URGENT — the Zapier sync is down again and orders aren't reaching the warehouse. Third time this month.",
    },
    {
      label: "can wait",
      text: "Hi, just following up on invoice 2214 — was it paid last week? No rush.",
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
  watchtower: [
    {
      label: "transient",
      text: "Workflow 'order-sync' failed: ECONNRESET calling https://api.vendor.com/orders after 30000ms",
    },
    {
      label: "needs a human",
      text: "Node 'CRM upsert' failed with 401 Unauthorized — token expired",
    },
  ],
};
