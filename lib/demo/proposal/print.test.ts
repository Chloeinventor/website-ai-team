import { describe, expect, it } from "vitest";

import { buildPrintDocument } from "./print";
import { runProposal } from "./index";
import type { ProposalRun } from "./types";

const NOW = new Date("2026-08-06T12:00:00.000Z");
const SEED =
  "They want inbound leads scored and routed to two reps, plus a weekly summary in Slack. Budget hinted around $6k. Wants it before the trade show in three weeks.";

const META = { siteName: "[Autoworks]", title: "Proposal draft" };

async function seedRun(): Promise<ProposalRun> {
  return runProposal(SEED, { now: NOW });
}

describe("buildPrintDocument", () => {
  it("emits a complete standalone document with print rules", async () => {
    const html = buildPrintDocument(await seedRun(), META);

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("@page");
    expect(html).toContain("size: A4");
    // Real text, not a canvas — this is why it beats a JS PDF generator.
    expect(html).not.toContain("<canvas");
  });

  it("carries every section of the proposal", async () => {
    const html = buildPrintDocument(await seedRun(), META);

    for (const heading of ["Scope", "Investment", "Assumptions", "Terms", "Follow-up sequence"]) {
      expect(html).toContain(`<h2>${heading}</h2>`);
    }
    expect(html).toContain("Discovery &amp; mapping");
    expect(html).toContain("Handover &amp; documentation");
  });

  it("prints the same total the screen shows", async () => {
    const run = await seedRun();
    const html = buildPrintDocument(run, META);

    expect(run.doc.pricing.totalMinor).toBe(290_000);
    expect(html).toContain("2,900");
  });

  it("keeps rows from splitting across pages", async () => {
    const html = buildPrintDocument(await seedRun(), META);
    expect(html).toContain("break-inside: avoid");
    expect(html).toContain("break-after: avoid");
  });

  it("escapes untrusted content from the notes", async () => {
    const run = await runProposal(
      'They want <script>alert("x")</script> and a "quoted" thing built. Budget $4k in two weeks.',
      { now: NOW },
    );
    const html = buildPrintDocument(run, META);

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("labels the draft rather than passing as a final quote", async () => {
    const html = buildPrintDocument(await seedRun(), META);
    expect(html).toMatch(/draft for discussion/i);
    expect(html).toMatch(/indicative until confirmed/i);
  });
});
