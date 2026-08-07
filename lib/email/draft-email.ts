import { clampHtml, clampText } from "@/lib/html";

/**
 * The emailed draft is rebuilt server-side from structured fields — the client
 * never supplies markup. Two reasons: escaping is guaranteed, and the caps below
 * bound what a stranger can push through a public endpoint into somebody's inbox.
 */

const CAPS = {
  problem: 400,
  intro: 900,
  line: 220,
  body: 1_600,
  listItems: 12,
  followUps: 5,
} as const;

export interface SafeRun {
  fit: string;
  source: string;
  problem: string;
  deliverables: string[];
  budget: string;
  deadline: string;
  intro: string;
  rows: { label: string; amount: string }[];
  total: string;
  note: string | null;
  assumptions: string[];
  terms: string[];
  followUps: { subject: string; when: string; body: string }[];
}

function money(minor: unknown, currency: unknown): string {
  const value = Number(minor);
  const code = String(currency ?? "EUR").slice(0, 3).toUpperCase();
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value / 100);
  } catch {
    return `${code} ${Math.round(value / 100)}`;
  }
}

function list(input: unknown, cap: number): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, CAPS.listItems)
    .map((item) => clampText(item, cap))
    .filter(Boolean);
}

/**
 * Validate and narrow whatever the client posted. Returns null when the shape
 * is unusable — the route turns that into a 400 rather than mailing nonsense.
 */
export function sanitizeRun(input: unknown): SafeRun | null {
  if (!input || typeof input !== "object") return null;

  const run = input as Record<string, any>;
  const doc = run.doc;
  const scope = run.scope;
  if (!doc || !scope || typeof doc !== "object" || typeof scope !== "object") {
    return null;
  }

  const pricing = doc.pricing ?? {};
  const rows = Array.isArray(pricing.rows) ? pricing.rows.slice(0, CAPS.listItems) : [];

  const budgetConfidence = ["stated", "hinted", "absent"].includes(
    scope.budgetSignal?.confidence,
  )
    ? scope.budgetSignal.confidence
    : "absent";

  const safe: SafeRun = {
    fit: ["good", "unclear", "poor"].includes(run.fit) ? run.fit : "unclear",
    source: run.source === "model" ? "claude-sonnet-5" : "offline draft",
    problem: clampText(scope.problem, CAPS.problem),
    deliverables: list(scope.deliverables, CAPS.line),
    budget:
      budgetConfidence === "absent"
        ? "not discussed"
        : `${clampText(scope.budgetSignal?.raw, 40) || "—"} (${budgetConfidence})`,
    deadline:
      [clampText(scope.deadline?.date, 40), clampText(scope.deadline?.driver, 60)]
        .filter(Boolean)
        .join(" · ") || "not discussed",
    intro: clampText(doc.intro, CAPS.intro),
    rows: rows.map((row: Record<string, unknown>) => ({
      label: clampText(row?.label, CAPS.line),
      amount: money(row?.amountMinor, pricing.currency),
    })),
    total: money(pricing.totalMinor, pricing.currency),
    note: clampText(pricing.note, CAPS.line) || null,
    assumptions: list(doc.assumptions, CAPS.line),
    terms: list(doc.terms, CAPS.line),
    followUps: (Array.isArray(run.followUps) ? run.followUps : [])
      .slice(0, CAPS.followUps)
      .map((item: Record<string, unknown>) => ({
        subject: clampText(item?.subject, CAPS.line),
        when: clampText(item?.sendDateLabel, 40),
        body: clampText(item?.body, CAPS.body),
      }))
      .filter((item) => item.subject || item.body),
  };

  // A draft with no content isn't worth mailing to anyone.
  if (!safe.intro && !safe.deliverables.length && !safe.rows.length) return null;

  return safe;
}

function bullets(items: string[]): string {
  if (!items.length) return "";
  return `<ul style="margin:8px 0 0;padding-left:18px;color:#3A4454;">${items
    .map((item) => `<li style="margin:4px 0;">${clampHtml(item, CAPS.line)}</li>`)
    .join("")}</ul>`;
}

export function renderDraftEmail(
  run: SafeRun,
  meta: { siteName: string; origin: string },
): { subject: string; html: string; text: string } {
  const site = clampHtml(meta.siteName, 60);
  const origin = clampHtml(meta.origin, 200);

  // Subject is fixed. A visitor-controlled subject line is how a demo endpoint
  // becomes a phishing tool.
  const subject = `Your proposal draft from ${clampText(meta.siteName, 60)}`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#EDF0F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#151B26;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #DDE3EE;border-radius:14px;overflow:hidden;">
    <div style="padding:16px 20px;border-bottom:1px solid #DDE3EE;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">
      Proposal draft · ${clampHtml(run.source, 40)}
    </div>

    <div style="padding:20px;">
      <p style="margin:0;line-height:1.6;color:#3A4454;">${clampHtml(run.intro, CAPS.intro)}</p>

      <h2 style="margin:24px 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">Scope</h2>
      ${bullets(run.deliverables)}

      <h2 style="margin:24px 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">Investment</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        ${run.rows
          .map(
            (row) => `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #DDE3EE;">${clampHtml(row.label, CAPS.line)}</td>
              <td style="padding:8px 0;border-bottom:1px solid #DDE3EE;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${clampHtml(row.amount, 40)}</td>
            </tr>`,
          )
          .join("")}
        <tr>
          <td style="padding:10px 0;font-weight:600;">Total</td>
          <td style="padding:10px 0;text-align:right;font-weight:600;white-space:nowrap;">${clampHtml(run.total, 40)}</td>
        </tr>
      </table>
      ${
        run.note
          ? `<p style="margin:8px 0 0;padding:10px 12px;background:#FDF6EC;border:1px solid #E08A1755;border-radius:8px;font-size:14px;color:#3A4454;">${clampHtml(run.note, CAPS.line)}</p>`
          : ""
      }

      <h2 style="margin:24px 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">Assumptions</h2>
      ${bullets(run.assumptions)}

      <h2 style="margin:24px 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">Terms</h2>
      ${bullets(run.terms)}

      <h2 style="margin:24px 0 0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#67728A;">Follow-up sequence</h2>
      ${run.followUps
        .map(
          (item) => `<div style="margin-top:10px;padding:12px;border:1px solid #DDE3EE;border-radius:10px;">
            <div style="font-weight:600;">${clampHtml(item.subject, CAPS.line)}</div>
            <div style="font-size:12px;color:#67728A;margin-top:2px;">${clampHtml(item.when, 40)}</div>
            <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#3A4454;white-space:pre-line;">${clampHtml(item.body, CAPS.body)}</div>
          </div>`,
        )
        .join("")}
    </div>

    <div style="padding:14px 20px;border-top:1px solid #DDE3EE;background:#EDF0F6;font-size:12px;line-height:1.6;color:#67728A;">
      This draft was generated by a visitor trying the demo at ${origin}. It is a
      sample, not a real quote, and ${site} has no relationship with you unless
      you started one. Nobody is subscribed by this — it sends once, when the
      button is pressed.
    </div>
  </div>
</body></html>`;

  const text = [
    `PROPOSAL DRAFT (${run.source})`,
    "",
    run.intro,
    "",
    "SCOPE",
    ...run.deliverables.map((item) => `- ${item}`),
    "",
    "INVESTMENT",
    ...run.rows.map((row) => `- ${row.label}: ${row.amount}`),
    `TOTAL: ${run.total}`,
    ...(run.note ? ["", run.note] : []),
    "",
    "ASSUMPTIONS",
    ...run.assumptions.map((item) => `- ${item}`),
    "",
    "TERMS",
    ...run.terms.map((item) => `- ${item}`),
    "",
    "FOLLOW-UP SEQUENCE",
    ...run.followUps.map((item) => `[${item.when}] ${item.subject}\n${item.body}\n`),
    "",
    `Generated by a visitor trying the demo at ${meta.origin}. Sample only, sent once.`,
  ].join("\n");

  return { subject, html, text };
}
