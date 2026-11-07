import crypto from "node:crypto";

/** No 0/O, 1/I/L: a code is read off a receipt and typed by hand. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A new purchase code: 8 characters (~39 bits), stored without the dash. */
export function newCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

/** "abcd-efgh " → "ABCDEFGH"; null if it can't be a code. */
export function normalizeCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.toUpperCase().replace(/[\s-]/g, "");
  if (code.length !== 8) return null;
  for (const ch of code) if (!ALPHABET.includes(ch)) return null;
  return code;
}

/** "ABCDEFGH" → "ABCD-EFGH" */
export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** A device id: random, kept in an httpOnly cookie. */
export function newDeviceId(): string {
  return crypto.randomUUID();
}

export function isDeviceId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value);
}
