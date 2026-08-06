import { describe, expect, it } from "vitest";

import { classifyFit } from "./classify";
import { extractScope } from "./extract";
import { generateFollowUps } from "./follow-ups";
import { fillTemplate } from "./template";
import { runProposal } from "./index";
import type { ScopeExtract } from "./types";

/** Fixed clock so every relative deadline and send-date is assertable. */
const NOW = new Date("2026-08-06T12:00:00.000Z");

const SEED =
  "They want inbound leads scored and routed to two reps, plus a weekly summary in Slack. Budget hinted around $6k. Wants it before the trade show in three weeks.";

const VAGUE =
  "Chatted with Dan, they're drowning in admin and want 'AI to help somehow'. Didn't get to budget. Said they'd think about timing.";

function scopeWith(overrides: Partial<ScopeExtract> = {}): ScopeExtract {
  return {
    problem: "Leads are falling through a spreadsheet",
    constraints: [],
    deliverables: ["score inbound leads"],
    budgetSignal: { amountMinor: 600_000, currency: "USD", confidence: "stated", raw: "$6k" },
    deadline: { date: "2026-08-27", driver: "trade show", raw: "in three weeks" },
    ...overrides,
  };
}

describe("extractScope", () => {
  it("reads budget, deadline and deliverables out of the seed notes", () => {
    const scope = extractScope(SEED, NOW);

    expect(scope.budgetSignal.confidence).toBe("hinted");
    expect(scope.budgetSignal.amountMinor).toBe(600_000);
    expect(scope.budgetSignal.currency).toBe("USD");
    expect(scope.budgetSignal.raw).toContain("6k");

    // "in three weeks" from 6 Aug 2026 → 27 Aug 2026.
    expect(scope.deadline.date).toBe("2026-08-27");
    expect(scope.deadline.driver).toBe("trade show");

    expect(scope.deliverables.length).toBeGreaterThanOrEqual(2);
    expect(scope.deliverables.join(" ")).toMatch(/scored and routed/i);
    expect(scope.deliverables.join(" ")).toMatch(/slack/i);
  });

  it("reports absent rather than inventing a budget", () => {
    const scope = extractScope(VAGUE, NOW);

    expect(scope.budgetSignal.confidence).toBe("absent");
    expect(scope.budgetSignal.amountMinor).toBeNull();
    expect(scope.budgetSignal.currency).toBeNull();
    expect(scope.deadline.date).toBeNull();
  });

  it("does not read a headcount as money", () => {
    const scope = extractScope("They have 40 people and two reps handling inbound.", NOW);
    expect(scope.budgetSignal.confidence).toBe("absent");
  });

  it("separates a stated budget from a hinted one", () => {
    expect(extractScope("Our budget is $12,000 for this.", NOW).budgetSignal).toMatchObject({
      confidence: "stated",
      amountMinor: 1_200_000,
    });
    expect(extractScope("Maybe around €8k, they weren't sure.", NOW).budgetSignal).toMatchObject({
      confidence: "hinted",
      currency: "EUR",
    });
  });

  it("returns empty structures for empty input", () => {
    const scope = extractScope("   ", NOW);
    expect(scope).toEqual({
      problem: "",
      constraints: [],
      deliverables: [],
      budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
      deadline: { date: null, driver: null, raw: null },
    });
  });

  it("does not turn a deadline sentence into a billable deliverable", () => {
    const scope = extractScope(SEED, NOW);

    expect(scope.deliverables).toHaveLength(2);
    expect(scope.deliverables.join(" ")).not.toMatch(/trade show/i);
    // The deadline still lands where it belongs.
    expect(scope.deadline.driver).toBe("trade show");

    // And so it never reaches the pricing table.
    const doc = fillTemplate(scope);
    expect(doc.pricing.rows.map((r) => r.label).join(" ")).not.toMatch(/trade show/i);
  });

  it("captures constraints when they are stated", () => {
    const scope = extractScope(
      "They already use HubSpot and it has to stay. They want leads routed automatically.",
      NOW,
    );
    expect(scope.constraints.join(" ")).toMatch(/hubspot/i);
  });
});

describe("classifyFit", () => {
  it("is good when deliverables, budget and timing are all present", () => {
    expect(classifyFit(scopeWith())).toBe("good");
    expect(classifyFit(extractScope(SEED, NOW))).toBe("good");
  });

  it("is unclear when something is missing but there is still work to scope", () => {
    expect(
      classifyFit(
        scopeWith({
          budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
        }),
      ),
    ).toBe("unclear");
  });

  it("is poor when there is nothing to price", () => {
    expect(
      classifyFit(
        scopeWith({
          problem: "hmm",
          deliverables: [],
          budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
          deadline: { date: null, driver: null, raw: null },
        }),
      ),
    ).toBe("poor");
  });

  it("is deterministic — same scope, same verdict", () => {
    const scope = extractScope(SEED, NOW);
    expect(classifyFit(scope)).toBe(classifyFit(scope));
  });
});

describe("fillTemplate", () => {
  it("prices one row per deliverable plus discovery and handover", () => {
    const doc = fillTemplate(scopeWith({ deliverables: ["a lead scorer", "a slack digest"] }));

    expect(doc.pricing.rows).toHaveLength(4);
    expect(doc.pricing.rows[0].label).toBe("Discovery & mapping");
    expect(doc.pricing.rows.at(-1)?.label).toBe("Handover & documentation");
    expect(doc.pricing.totalMinor).toBe(
      doc.pricing.rows.reduce((sum, row) => sum + row.amountMinor, 0),
    );
  });

  it("is deterministic — the same scope always prices the same", () => {
    const scope = scopeWith();
    expect(fillTemplate(scope).pricing.totalMinor).toBe(
      fillTemplate(scope).pricing.totalMinor,
    );
  });

  it("uses the budget currency, falling back to EUR", () => {
    expect(fillTemplate(scopeWith()).pricing.currency).toBe("USD");
    expect(
      fillTemplate(
        scopeWith({
          budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
        }),
      ).pricing.currency,
    ).toBe("EUR");
  });

  it("flags a quote that overshoots a stated budget", () => {
    const doc = fillTemplate(
      scopeWith({
        deliverables: ["one", "two", "three", "four"],
        budgetSignal: { amountMinor: 100_000, currency: "EUR", confidence: "stated", raw: "€1k" },
      }),
    );
    expect(doc.pricing.note).toMatch(/above the €1k/i);
  });

  it("turns every gap in the scope into a written assumption", () => {
    const doc = fillTemplate(
      scopeWith({
        constraints: [],
        budgetSignal: { amountMinor: null, currency: null, confidence: "absent", raw: null },
        deadline: { date: null, driver: null, raw: null },
      }),
    );

    const assumptions = doc.assumptions.join(" ");
    expect(assumptions).toMatch(/budget was not discussed/i);
    expect(assumptions).toMatch(/no delivery date/i);
    expect(assumptions).toMatch(/no technical constraints/i);
  });

  it("never ships an empty scope section", () => {
    const doc = fillTemplate(scopeWith({ deliverables: [] }));
    expect(doc.scope.length).toBeGreaterThan(0);
    expect(doc.scope[0]).toMatch(/\[/); // a bracketed placeholder, visibly unfinished
  });
});

describe("generateFollowUps", () => {
  it("returns three touches at +3, +7 and +14 days", () => {
    const followUps = generateFollowUps(scopeWith(), NOW);

    expect(followUps).toHaveLength(3);
    expect(followUps.map((f) => f.sendOffsetDays)).toEqual([3, 7, 14]);
    expect(followUps[0].sendDateLabel).toBe("Sun 9 Aug");
    expect(followUps[2].sendDateLabel).toBe("Thu 20 Aug");
  });

  it("mentions the deadline driver when there is one", () => {
    const followUps = generateFollowUps(scopeWith(), NOW);
    expect(followUps[1].body).toMatch(/trade show/i);
  });

  it("omits urgency framing when no deadline was captured", () => {
    const followUps = generateFollowUps(
      scopeWith({ deadline: { date: null, driver: null, raw: null } }),
      NOW,
    );
    expect(followUps[1].body).not.toMatch(/given|with .* as the target/i);
  });

  it("never ends a subject line on a dangling conjunction", () => {
    const followUps = generateFollowUps(
      { ...scopeWith(), deliverables: ["inbound leads scored and routed to two reps"] },
      NOW,
    );
    for (const item of followUps) {
      expect(item.subject).not.toMatch(/\b(and|or|plus|to|for|with|the|a|an|in|on|of|by)$/i);
    }
  });

  it("avoids the sales-sequence clichés", () => {
    const bodies = generateFollowUps(scopeWith(), NOW)
      .map((f) => `${f.subject} ${f.body}`)
      .join(" ");
    expect(bodies).not.toMatch(/just checking in|circling back|touching base|!/i);
  });
});

describe("runProposal", () => {
  it("runs the whole pipeline offline with no key", async () => {
    const run = await runProposal(SEED, { now: NOW });

    expect(run.source).toBe("heuristic");
    expect(run.fit).toBe("good");
    expect(run.followUps).toHaveLength(3);
    expect(run.doc.pricing.totalMinor).toBeGreaterThan(0);
    expect(run.warning).toBeUndefined();
  });

  it("falls back to the heuristic path and reports why when the model call fails", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;

    try {
      const run = await runProposal(SEED, { apiKey: "sk-ant-test", now: NOW });
      expect(run.source).toBe("heuristic");
      expect(run.warning).toMatch(/network down/);
      expect(run.doc.pricing.totalMinor).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("uses the model path when the API answers", async () => {
    const originalFetch = globalThis.fetch;
    const payloads = [
      {
        problem: "Leads sit in a spreadsheet nobody opens",
        constraints: [],
        deliverables: ["Score inbound leads", "Post a weekly digest to Slack"],
        budgetSignal: { amountMinor: 600_000, currency: "USD", confidence: "hinted", raw: "$6k" },
        deadline: { date: "2026-08-27", driver: "trade show", raw: "in three weeks" },
      },
      {
        followUps: [
          { subject: "Re: lead scoring", sendOffsetDays: 3, body: "It's with you." },
          { subject: "Still worth doing?", sendOffsetDays: 7, body: "Happy to re-cut it." },
          { subject: "Closing the loop", sendOffsetDays: 14, body: "Last one from me." },
        ],
      },
    ];

    let call = 0;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify(payloads[call++]) }],
        }),
        { status: 200 },
      )) as typeof fetch;

    try {
      const run = await runProposal(SEED, { apiKey: "sk-ant-test", now: NOW });

      expect(run.source).toBe("model");
      expect(run.fit).toBe("good");
      expect(run.scope.problem).toMatch(/spreadsheet/);
      expect(run.followUps[0].subject).toBe("Re: lead scoring");
      // Dates stay ours even on the model path.
      expect(run.followUps[0].sendDateLabel).toBe("Sun 9 Aug");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("treats a refusal as a failed call, not as content", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ stop_reason: "refusal", content: [] }), {
        status: 200,
      })) as typeof fetch;

    try {
      const run = await runProposal(SEED, { apiKey: "sk-ant-test", now: NOW });
      expect(run.source).toBe("heuristic");
      expect(run.warning).toMatch(/declined/i);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
