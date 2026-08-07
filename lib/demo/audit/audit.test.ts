import { describe, expect, it } from "vitest";

import { parseInvoice, runAudit, toMinor, DEFAULT_RATE_CARD } from "./index";

const OVERCHARGED = `Carrier: Northwind Freight
Invoice: INV-88231
Ref: SHP-4471   Rotterdam → Felixstowe

Base freight                  1,450.00
Fuel surcharge (BAF)            218.00
Congestion fee                   95.00
Documentation                    45.00
Demurrage 3 days                360.00
Total                         2,168.00`;

const CLEAN = `Carrier: Northwind Freight
Invoice: INV-88240
Ref: SHP-4488   Rotterdam → Felixstowe

Base freight                  1,300.00
Fuel surcharge (BAF)            150.00
Documentation                    45.00
Total                         1,495.00`;

const BAD_MATHS = `Carrier: Harbour Lines
Invoice: HL-2201
Ref: SHP-5010   Shanghai → Felixstowe

Ocean freight                 2,850.00
Terminal handling               310.00
Documentation                    45.00
Documentation                    45.00
Total                         3,420.00`;

describe("toMinor", () => {
  it("reads the formats carriers actually print", () => {
    expect(toMinor("1,450.00")).toBe(145_000);
    expect(toMinor("£95")).toBe(9_500);
    expect(toMinor("2 168.00")).toBe(216_800);
    expect(toMinor("not a number")).toBeNull();
  });
});

describe("parseInvoice", () => {
  it("pulls the header fields and the charge lines", () => {
    const invoice = parseInvoice(OVERCHARGED);

    expect(invoice.carrier).toBe("Northwind Freight");
    expect(invoice.invoiceNumber).toBe("INV-88231");
    expect(invoice.lane).toEqual({ from: "Rotterdam", to: "Felixstowe" });
    expect(invoice.lines).toHaveLength(5);
    expect(invoice.statedTotalMinor).toBe(216_800);
  });

  it("keeps the total out of the charge lines", () => {
    const invoice = parseInvoice(OVERCHARGED);
    expect(invoice.lines.map((l) => l.label)).not.toContain("Total");
  });

  it("reads unit counts out of a label", () => {
    const invoice = parseInvoice(OVERCHARGED);
    expect(invoice.lines.find((l) => /demurrage/i.test(l.label))?.units).toBe(3);
  });

  it("survives text that isn't an invoice", () => {
    const invoice = parseInvoice("hello, this is not an invoice at all");
    expect(invoice.lines).toHaveLength(0);
  });
});

describe("runAudit", () => {
  it("finds every category of overcharge in one invoice", () => {
    const run = runAudit(OVERCHARGED);
    const kinds = run.variances.map((v) => v.kind);

    expect(kinds).toContain("over_rate"); // 1450 vs 1300 agreed
    expect(kinds).toContain("surcharge_cap"); // 218 vs 12% of 1300 = 156
    expect(kinds).toContain("unagreed_charge"); // congestion fee
    expect(kinds).toContain("free_time"); // 3 days inside 5 free
  });

  it("computes a recovery figure that reconciles by hand", () => {
    const run = runAudit(OVERCHARGED);

    // 150.00 over base + 62.00 over cap + 95.00 unagreed + 360.00 free time
    expect(run.recoverableMinor).toBe(15_000 + 6_200 + 9_500 + 36_000);
    expect(run.recoverableMinor).toBe(66_700);
    expect(run.verdict).toBe("recoverable");
  });

  it("is deterministic — same invoice, same number, every time", () => {
    expect(runAudit(OVERCHARGED).recoverableMinor).toBe(
      runAudit(OVERCHARGED).recoverableMinor,
    );
  });

  it("passes a compliant invoice without inventing a dispute", () => {
    const run = runAudit(CLEAN);
    expect(run.variances).toHaveLength(0);
    expect(run.recoverableMinor).toBe(0);
    expect(run.verdict).toBe("clean");
    expect(run.dispute.body).toBe("");
  });

  it("catches a duplicated line", () => {
    const run = runAudit(BAD_MATHS);
    const duplicate = run.variances.find((v) => v.kind === "duplicate");
    expect(duplicate).toBeDefined();
    expect(duplicate!.recoverableMinor).toBe(4_500);
  });

  it("catches a total that doesn't match its own lines", () => {
    const run = runAudit(BAD_MATHS);
    // 2850 + 310 + 45 + 45 = 3250, billed 3420 → 170 unexplained
    const arithmetic = run.variances.find((v) => v.kind === "arithmetic");
    expect(arithmetic).toBeDefined();
    expect(arithmetic!.recoverableMinor).toBe(17_000);
  });

  it("ranks the biggest recovery first", () => {
    const amounts = runAudit(OVERCHARGED).variances.map((v) => v.recoverableMinor);
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts);
  });

  it("caps fuel against the agreed base, not the inflated one", () => {
    // Billed base is 1,450 but the agreed lane rate is 1,300. A cap taken off
    // the billed base would permit 174.00 and hide the overcharge.
    const run = runAudit(OVERCHARGED);
    const fuel = run.variances.find((v) => v.kind === "surcharge_cap");
    expect(fuel!.expectedMinor).toBe(15_600);
  });

  it("separates contractual findings from things worth querying", () => {
    const run = runAudit(OVERCHARGED);
    const congestion = run.variances.find((v) => v.kind === "unagreed_charge");
    const freeTime = run.variances.find((v) => v.kind === "free_time");

    expect(congestion!.confidence).toBe("review");
    expect(freeTime!.confidence).toBe("high");
  });

  it("reports unreadable input rather than a false clean bill", () => {
    const run = runAudit("just some notes about a shipment");
    expect(run.verdict).toBe("unreadable");
    expect(run.recoverableMinor).toBe(0);
  });

  it("builds a dispute email and a sheet with a header row", () => {
    const run = runAudit(OVERCHARGED);

    expect(run.dispute.subject).toContain("INV-88231");
    expect(run.dispute.body).toContain("Northwind Freight");
    expect(run.dispute.body).toContain("£667.00");
    expect(run.sheetRows[0]).toEqual([
      "Invoice",
      "Line",
      "Issue",
      "Billed",
      "Expected",
      "Recoverable",
      "Confidence",
    ]);
    expect(run.sheetRows).toHaveLength(run.variances.length + 1);
  });

  it("honours a different rate card", () => {
    const generous = runAudit(OVERCHARGED, {
      rateCard: { ...DEFAULT_RATE_CARD, demurrageFreeDays: 0, surchargeCapPct: 20 },
    });
    const kinds = generous.variances.map((v) => v.kind);
    expect(kinds).not.toContain("surcharge_cap");
    expect(kinds).not.toContain("free_time");
  });
});
