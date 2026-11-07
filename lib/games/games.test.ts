import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

import { isProduct, levelsOf, priceOf } from "./catalog";
import { formatCode, newCode, normalizeCode } from "./code";
import { readCookies } from "./access";
import { verifyWebhook } from "./stripe";

describe("codes", () => {
  it("makes 8-character codes that survive formatting and retyping", () => {
    for (let i = 0; i < 200; i++) {
      const code = newCode();
      expect(code).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);
      expect(normalizeCode(` ${formatCode(code).toLowerCase()} `)).toBe(code);
    }
  });
  it("rejects anything that can't be a code", () => {
    for (const bad of ["", "ABCD", "ABCD-EFG0", "ABCDEFGHI", "abcd efgI", 12345678, null]) expect(normalizeCode(bad)).toBeNull();
  });
});

describe("catalog", () => {
  it("knows the products and what they unlock", () => {
    expect(isProduct("2")).toBe(true);
    expect(isProduct("bundle")).toBe(true);
    for (const bad of ["1", "9", "02", "", 2, "all"]) expect(isProduct(bad)).toBe(false);
    expect(levelsOf("bundle")).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(levelsOf("5")).toEqual([5]);
    expect(levelsOf("1")).toEqual([]);
    expect(priceOf("3")).toBe(3900);
    expect(priceOf("bundle")).toBe(14900);
  });
});

describe("webhook signature", () => {
  const secret = "whsec_test";
  const payload = '{"type":"charge.refunded"}';
  const sign = (t: number, body = payload, key = secret) =>
    `t=${t},v1=${crypto.createHmac("sha256", key).update(`${t}.${body}`).digest("hex")}`;
  const now = 1_800_000_000_000;
  it("accepts a fresh, correct signature", () => {
    expect(verifyWebhook(payload, sign(now / 1000), secret, 300, now)).toBe(true);
  });
  it("rejects wrong secret, changed body, old timestamp or junk", () => {
    expect(verifyWebhook(payload, sign(now / 1000, payload, "other"), secret, 300, now)).toBe(false);
    expect(verifyWebhook(payload + " ", sign(now / 1000), secret, 300, now)).toBe(false);
    expect(verifyWebhook(payload, sign(now / 1000 - 301), secret, 300, now)).toBe(false);
    expect(verifyWebhook(payload, "t=1,v1=zz", secret, 300, now)).toBe(false);
    expect(verifyWebhook(payload, null, secret, 300, now)).toBe(false);
  });
});

describe("cookies", () => {
  it("parses a cookie header", () => {
    expect(readCookies("a=1; dkp_codes=ABCDEFGH.JKMNPQRS")).toEqual({ a: "1", dkp_codes: "ABCDEFGH.JKMNPQRS" });
    expect(readCookies(null)).toEqual({});
  });
});
