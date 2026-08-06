import type { BudgetSignal, Deadline, ScopeExtract } from "./types";

/**
 * 02 · AGENT — extractScope (heuristic path)
 *
 * The no-key default. Reads the notes with regexes rather than a model, so the
 * demo works with zero setup. Every field can come back empty or null: saying
 * "budget wasn't discussed" is the correct answer more often than any guess,
 * and the assumptions section downstream is built from exactly these gaps.
 *
 * `now` is injectable so relative deadlines ("in three weeks") are testable.
 */

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
};

const CURRENCY_MARKS: Record<string, string> = {
  "$": "USD", "€": "EUR", "£": "GBP", "₱": "PHP", "s$": "SGD",
};

/** Words that mark a sentence as the thing that hurts. */
const PAIN =
  /\b(losing|lost|drowning|manual|manually|by hand|wast\w+|manag\w+ to miss|miss\w*|manual\w*|slow|bottleneck|manual entry|spreadsheet|chas\w+|forget\w*|can'?t keep up|no way to|falls? through)\b/i;

const DELIVERABLE_VERB =
  /\b(want|wants|need|needs|looking for|build|set up|automate|integrate|route|routed|scor\w+|send|sync|summar\w+|report|track|migrate|notify|alert|generate|clean up)\b/i;

/**
 * "Wants it before the trade show in three weeks" contains a deliverable verb
 * but is a deadline, not a thing to build — and a deadline that reaches the
 * pricing table becomes a line item somebody gets invoiced for.
 */
const TIMING_ONLY =
  /^(?:wants?|needs?|would like)?\s*(?:it|this|that|them)?\s*(?:before|by|in|ahead of|in time for|asap)\b/i;

const CONSTRAINT =
  /\b(must|can'?t|cannot|only|without|already (?:use|using|on)|existing|has to|needs? to stay|no (?:budget|time|appetite) for|keep (?:using|the)|stuck (?:with|on)|compliance|gdpr|hipaa)\b/i;

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** "in three weeks" / "in 3 weeks" → days. */
function readRelativeDays(text: string): { days: number; raw: string } | null {
  const m = text.match(
    /\bin\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(day|week|month)s?\b/i,
  );
  if (!m) return null;

  const n = Number(m[1]) || NUMBER_WORDS[m[1].toLowerCase()];
  if (!n) return null;

  const unit = m[2].toLowerCase();
  const days = unit === "day" ? n : unit === "week" ? n * 7 : n * 30;
  return { days, raw: m[0] };
}

function readBudget(text: string): BudgetSignal {
  const absent: BudgetSignal = {
    amountMinor: null,
    currency: null,
    confidence: "absent",
    raw: null,
  };

  // A figure only counts as budget if it carries a currency mark or a k/m
  // suffix — otherwise "40 people" and "two reps" read as money.
  const m = text.match(
    /(?:(s\$|[$€£₱])\s?|\b(usd|eur|gbp|php|sgd)\s+)?(\d[\d,.]*)\s?([km])\b|(?:(s\$|[$€£₱])\s?|\b(usd|eur|gbp|php|sgd)\s+)(\d[\d,.]*)/i,
  );
  if (!m) return absent;

  const mark = (m[1] ?? m[5] ?? "").toLowerCase();
  const code = (m[2] ?? m[6] ?? "").toUpperCase();
  const digits = (m[3] ?? m[7] ?? "").replace(/,/g, "");
  const suffix = (m[4] ?? "").toLowerCase();

  const currency = code || CURRENCY_MARKS[mark] || null;
  // No currency mark at all ("6k") is still a budget signal, just an unlabelled one.
  const base = Number(digits);
  if (!Number.isFinite(base)) return absent;

  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : 1;
  const major = base * multiplier;

  // "hinted around", "maybe", "~", "ballpark" → they didn't commit to it.
  const hinted =
    /\b(hint\w*|around|about|roughly|maybe|ballpark|somewhere|ish|circa|~)\b/i.test(
      text.slice(Math.max(0, m.index! - 40), m.index! + m[0].length),
    );

  return {
    amountMinor: Math.round(major * 100),
    currency,
    confidence: hinted ? "hinted" : "stated",
    raw: m[0].trim(),
  };
}

function readDeadline(text: string, now: Date): Deadline {
  const empty: Deadline = { date: null, driver: null, raw: null };

  const relative = readRelativeDays(text);
  // "before the trade show", "ahead of the board meeting"
  const driverMatch = text.match(
    /\b(?:before|ahead of|in time for|by)\s+(?:the\s+|our\s+|their\s+)?([a-z][\w-]*(?:\s+[a-z][\w-]*){0,2})/i,
  );

  const driver = driverMatch
    ? driverMatch[1]
        .replace(/\b(end|start|beginning)\s+of\b/i, "")
        // The window is up to three words, so it can run past the driver into
        // whatever follows — "trade show in three weeks" → "trade show".
        .replace(/\s+(in|on|by|at|for|to|the|a|an|with|so|and)$/i, "")
        .trim()
        .replace(/[.,]$/, "")
    : null;

  if (!relative && !driver) return empty;

  const date = relative
    ? new Date(now.getTime() + relative.days * 86_400_000)
        .toISOString()
        .slice(0, 10)
    : null;

  return {
    date,
    driver: driver && !/^\d/.test(driver) ? driver : null,
    raw: relative?.raw ?? driverMatch?.[0] ?? null,
  };
}

function readDeliverables(text: string): string[] {
  const found: string[] = [];

  for (const sentence of sentences(text)) {
    if (!DELIVERABLE_VERB.test(sentence)) continue;

    // "X, plus Y, and Z" — one deliverable per clause.
    for (const clause of sentence.split(/,\s*(?:plus|and also|and then|and)?\s*|\s+plus\s+/i)) {
      const trimmed = clause
        .replace(/^(?:they|we|he|she|the client)\s+(?:want|wants|need|needs)s?\s+(?:to\s+)?/i, "")
        .replace(/^(?:and|plus|also)\s+/i, "")
        .trim();

      if (trimmed.length < 8) continue;
      if (TIMING_ONLY.test(trimmed)) continue;
      if (CONSTRAINT.test(trimmed) && !DELIVERABLE_VERB.test(trimmed)) continue;

      found.push(trimmed.replace(/[.;]$/, ""));
      if (found.length >= 5) return found;
    }
  }

  return found;
}

export function extractScope(notes: string, now: Date = new Date()): ScopeExtract {
  const text = notes.trim();

  if (!text) {
    return {
      problem: "",
      constraints: [],
      budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
      deadline: { date: null, driver: null, raw: null },
      deliverables: [],
    };
  }

  const all = sentences(text);
  const problem =
    all.find((s) => PAIN.test(s)) ?? all[0] ?? "";

  const constraints = all
    .filter((s) => CONSTRAINT.test(s))
    .map((s) => s.replace(/[.;]$/, ""))
    .slice(0, 4);

  return {
    problem: problem.replace(/[.;]$/, ""),
    constraints,
    budgetSignal: readBudget(text),
    deadline: readDeadline(text, now),
    deliverables: readDeliverables(text),
  };
}
