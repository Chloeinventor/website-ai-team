import { escapeHtml } from "@/lib/html";
import type { ProposalRun } from "./types";

/**
 * "Download PDF" without a PDF library.
 *
 * The proposal is rendered as a standalone HTML document inside a hidden
 * iframe, which is then printed — every browser's print dialog offers "Save as
 * PDF" as the destination. Why this over jsPDF/pdf-lib:
 *
 *  - zero bundle cost on a landing page (those are ~350KB)
 *  - real text, selectable and searchable in the PDF, with proper hyphenation,
 *    widow/orphan control and page breaks — things a canvas-based generator
 *    reimplements badly
 *  - honours the user's paper size and margins
 *
 * The tradeoff is honest: it opens the print dialog rather than dropping a file
 * straight into ~/Downloads. If one-click download matters more than typography,
 * swap this module for pdf-lib — the UI calls one function.
 */

function money(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${currency} ${Math.round(minor / 100)}`;
  }
}

function list(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function buildPrintDocument(
  run: ProposalRun,
  meta: { siteName: string; title: string },
): string {
  const { scope, doc, followUps } = run;
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(meta.title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #151B26; background: #fff;
    font: 11pt/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  header { border-bottom: 2px solid #151B26; padding-bottom: 10pt; margin-bottom: 18pt; }
  .kicker { font-size: 8pt; letter-spacing: .16em; text-transform: uppercase; color: #67728A; }
  h1 { margin: 6pt 0 0; font-size: 20pt; letter-spacing: -.02em; }
  .meta { margin-top: 4pt; font-size: 9pt; color: #67728A; }
  h2 {
    margin: 20pt 0 6pt; font-size: 8.5pt; letter-spacing: .16em;
    text-transform: uppercase; color: #67728A; break-after: avoid;
  }
  p { margin: 0 0 8pt; }
  ul { margin: 0; padding-left: 14pt; }
  li { margin: 3pt 0; break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  th, td { text-align: left; padding: 6pt 0; border-bottom: .5pt solid #DDE3EE; vertical-align: top; }
  td.amount { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .detail { display: block; font-size: 9pt; color: #67728A; font-weight: 400; margin-top: 1pt; }
  tr.total th, tr.total td { border-bottom: 0; border-top: 1pt solid #151B26; font-size: 12pt; font-weight: 600; padding-top: 8pt; }
  .note { margin-top: 8pt; padding: 8pt 10pt; border: .5pt solid #E08A17; border-radius: 6pt; font-size: 10pt; }
  .followup { border: .5pt solid #DDE3EE; border-radius: 6pt; padding: 9pt 11pt; margin-top: 7pt; break-inside: avoid; }
  .followup .when { font-size: 8.5pt; color: #67728A; }
  .followup .body { margin-top: 4pt; font-size: 10pt; white-space: pre-line; }
  footer { margin-top: 22pt; padding-top: 8pt; border-top: .5pt solid #DDE3EE; font-size: 8.5pt; color: #67728A; }
  .facts { display: flex; gap: 22pt; margin-top: 8pt; font-size: 9.5pt; }
  .facts dt { font-size: 8pt; letter-spacing: .14em; text-transform: uppercase; color: #67728A; }
  .facts dd { margin: 2pt 0 0; font-weight: 600; }
</style></head>
<body>
  <header>
    <div class="kicker">Proposal · draft</div>
    <h1>${escapeHtml(meta.siteName)}</h1>
    <div class="meta">${escapeHtml(today)} · ${
      run.source === "model" ? "drafted with claude-sonnet-5" : "drafted offline"
    }</div>
  </header>

  <p>${escapeHtml(doc.intro)}</p>

  <dl class="facts">
    <div><dt>Budget signal</dt><dd>${escapeHtml(
      scope.budgetSignal.confidence === "absent"
        ? "not discussed"
        : `${scope.budgetSignal.raw ?? "—"} (${scope.budgetSignal.confidence})`,
    )}</dd></div>
    <div><dt>Deadline</dt><dd>${escapeHtml(
      [scope.deadline.date, scope.deadline.driver].filter(Boolean).join(" · ") ||
        "not discussed",
    )}</dd></div>
  </dl>

  <h2>Scope</h2>
  <ul>${list(doc.scope)}</ul>

  <h2>Investment</h2>
  <table>
    <tbody>
      ${doc.pricing.rows
        .map(
          (row) => `<tr>
            <th scope="row">${escapeHtml(row.label)}${
              row.detail ? `<span class="detail">${escapeHtml(row.detail)}</span>` : ""
            }</th>
            <td class="amount">${escapeHtml(money(row.amountMinor, doc.pricing.currency))}</td>
          </tr>`,
        )
        .join("")}
      <tr class="total">
        <th scope="row">Total</th>
        <td class="amount">${escapeHtml(money(doc.pricing.totalMinor, doc.pricing.currency))}</td>
      </tr>
    </tbody>
  </table>
  ${doc.pricing.note ? `<p class="note">${escapeHtml(doc.pricing.note)}</p>` : ""}

  <h2>Assumptions</h2>
  <ul>${list(doc.assumptions)}</ul>

  <h2>Terms</h2>
  <ul>${list(doc.terms)}</ul>

  <h2>Follow-up sequence</h2>
  ${followUps
    .map(
      (item) => `<div class="followup">
        <strong>${escapeHtml(item.subject)}</strong>
        <div class="when">${escapeHtml(item.sendDateLabel)} · +${Number(item.sendOffsetDays)} days</div>
        <div class="body">${escapeHtml(item.body)}</div>
      </div>`,
    )
    .join("")}

  <footer>
    Generated from call notes by ${escapeHtml(meta.siteName)}. Draft for discussion —
    figures are indicative until confirmed in writing.
  </footer>
</body></html>`;
}

/** Render into a hidden iframe and open the browser's print dialog. */
export function printProposal(
  run: ProposalRun,
  meta: { siteName: string; title: string },
): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("title", meta.title);
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;";

  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;

    // Give the print engine one frame to lay the document out.
    window.setTimeout(() => {
      win.focus();
      win.print();
      // The dialog is modal in most browsers, but not all — clean up on a timer
      // rather than assuming print() blocks.
      window.setTimeout(() => frame.remove(), 60_000);
    }, 60);
  };

  frame.srcdoc = buildPrintDocument(run, meta);
  document.body.appendChild(frame);
}
