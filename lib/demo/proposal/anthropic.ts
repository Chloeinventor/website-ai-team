import { extractScope } from "./extract";
import { generateFollowUps } from "./follow-ups";
import type { FollowUp, ScopeExtract } from "./types";

/**
 * The optional model path — runs in the visitor's browser, against the
 * visitor's own key, and never touches a server we control.
 *
 * Model: claude-sonnet-5. Notes on the request shape, since a few of these are
 * easy to get wrong:
 *  - `anthropic-dangerous-direct-browser-access` is what makes the API answer a
 *    browser at all (CORS). The name is the warning: a key in a browser is a key
 *    the page can read, which is why this is opt-in and session-scoped.
 *  - Structured output goes through `output_config.format`, not a tool and not
 *    a "reply with JSON" instruction. Nulls are legal in the schema on purpose.
 *  - No `temperature` — non-default sampling parameters are rejected on
 *    Sonnet 5. Steer with the prompt instead.
 *  - Thinking is on by default on Sonnet 5; these are short extraction calls, so
 *    it's disabled with low effort to keep the demo snappy.
 *  - `max_tokens` is deliberately small: the outputs here are a few hundred
 *    tokens of JSON, not prose.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

function nullable(schema: Record<string, unknown>) {
  return { anyOf: [schema, { type: "null" }] };
}

const SCOPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["problem", "constraints", "budgetSignal", "deadline", "deliverables"],
  properties: {
    problem: { type: "string", description: "The thing that hurts, in one sentence." },
    constraints: {
      type: "array",
      items: { type: "string" },
      description: "Hard limits they stated. Empty array if none were mentioned.",
    },
    deliverables: {
      type: "array",
      items: { type: "string" },
      description: "Discrete things to build. Empty array if none are clear.",
    },
    budgetSignal: {
      type: "object",
      additionalProperties: false,
      required: ["amountMinor", "currency", "confidence", "raw"],
      properties: {
        amountMinor: nullable({ type: "integer", description: "Minor units (cents)." }),
        currency: nullable({ type: "string", description: "ISO code, e.g. EUR." }),
        confidence: { type: "string", enum: ["stated", "hinted", "absent"] },
        raw: nullable({ type: "string", description: "Verbatim, as it appeared." }),
      },
    },
    deadline: {
      type: "object",
      additionalProperties: false,
      required: ["date", "driver", "raw"],
      properties: {
        date: nullable({ type: "string", description: "ISO date (YYYY-MM-DD)." }),
        driver: nullable({ type: "string", description: "Why that date exists." }),
        raw: nullable({ type: "string" }),
      },
    },
  },
};

const FOLLOW_UPS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["followUps"],
  properties: {
    followUps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["subject", "sendOffsetDays", "body"],
        properties: {
          subject: { type: "string" },
          sendOffsetDays: { type: "integer" },
          body: { type: "string" },
        },
      },
    },
  },
};

const EXTRACT_SYSTEM = `You read messy notes from a sales call and extract what a proposal needs.

Rules that matter more than completeness:
- Null and empty are correct answers. If budget was not discussed, confidence is "absent" and every other budget field is null. Never infer an amount from company size, deliverable count, or what feels reasonable.
- "hinted" means they gestured at a number without committing ("around 6k", "maybe five figures"). "stated" means they named it.
- deliverables are things to build, not restatements of the problem.
- constraints are limits they actually said out loud, not risks you anticipate.
- Quote raw fields verbatim from the notes.`;

const FOLLOW_UPS_SYSTEM = `You write three follow-up emails for a proposal that has been sent.

Voice: a competent solo builder, not a sales sequence. Plain verbs, no filler, sentence case, no exclamation points. Never "just checking in", "circling back", or "touching base".
Structure: email 1 at +3 days confirms it arrived. Email 2 at +7 days offers to re-cut the scope to fit a number. Email 3 at +14 days closes the loop and stops.
Each body is 2-4 sentences. Reference their actual deliverables and deadline where they exist; never invent details that aren't in the scope.`;

interface AnthropicResponse {
  content?: { type: string; text?: string }[];
  stop_reason?: string;
  error?: { message?: string };
}

async function callModel(
  apiKey: string,
  system: string,
  userContent: string,
  schema: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const res = await fetch(API_URL, {
    method: "POST",
    signal,
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "disabled" },
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  const body = (await res.json().catch(() => null)) as AnthropicResponse | null;

  if (!res.ok) {
    throw new Error(
      body?.error?.message ?? `Anthropic API returned ${res.status}`,
    );
  }

  // A refusal is a 200 with no usable content — check it before reading content.
  if (body?.stop_reason === "refusal") {
    throw new Error("The model declined this input.");
  }

  const text = body?.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("No content returned.");

  return JSON.parse(text);
}

export async function extractScopeWithModel(
  notes: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<ScopeExtract> {
  const parsed = (await callModel(
    apiKey,
    EXTRACT_SYSTEM,
    notes,
    SCOPE_SCHEMA,
    signal,
  )) as ScopeExtract;

  // Trust the schema for shape, not the model for sanity.
  return {
    problem: String(parsed.problem ?? ""),
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
    budgetSignal: {
      amountMinor:
        typeof parsed.budgetSignal?.amountMinor === "number"
          ? parsed.budgetSignal.amountMinor
          : null,
      currency: parsed.budgetSignal?.currency ?? null,
      confidence: parsed.budgetSignal?.confidence ?? "absent",
      raw: parsed.budgetSignal?.raw ?? null,
    },
    deadline: {
      date: parsed.deadline?.date ?? null,
      driver: parsed.deadline?.driver ?? null,
      raw: parsed.deadline?.raw ?? null,
    },
  };
}

export async function generateFollowUpsWithModel(
  scope: ScopeExtract,
  apiKey: string,
  now: Date,
  signal?: AbortSignal,
): Promise<FollowUp[]> {
  const parsed = (await callModel(
    apiKey,
    FOLLOW_UPS_SYSTEM,
    JSON.stringify(scope, null, 2),
    FOLLOW_UPS_SCHEMA,
    signal,
  )) as { followUps?: Omit<FollowUp, "sendDateLabel">[] };

  const written = parsed.followUps?.slice(0, 3) ?? [];
  if (written.length < 3) return generateFollowUps(scope, now);

  // Dates are computed here, not by the model — a model that can write a date
  // can write the wrong one, and the schedule is arithmetic.
  return written.map((item) => {
    const offset = Number(item.sendOffsetDays) || 3;
    return {
      subject: item.subject,
      body: item.body,
      sendOffsetDays: offset,
      sendDateLabel: new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(now.getTime() + offset * 86_400_000)),
    };
  });
}

/** Cheap client-side shape check before we spend the visitor's money. */
export function looksLikeApiKey(value: string): boolean {
  return /^sk-ant-[\w-]{20,}$/.test(value.trim());
}

export { extractScope };
