/**
 * Who may play what. A browser carries two httpOnly cookies: a random device id
 * and the purchase codes it has unlocked. A level is open only when one of
 * those codes is active, covers the level and has this device registered, so a
 * copied code stops working once its device limit is reached.
 */
import { FREE_LEVEL, levelsOf } from "./catalog";
import { isDeviceId, newDeviceId, normalizeCode } from "./code";
import { deviceProducts, isDbConfigured } from "./db";

export const DEVICE_COOKIE = "dkp_dev";
export const CODES_COOKIE = "dkp_codes";
const MAX_CODES = 10;
const TWO_YEARS = 60 * 60 * 24 * 730;

export function readCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export interface Visitor {
  device: string;
  isNewDevice: boolean;
  codes: string[];
}

export function visitorFrom(request: Request): Visitor {
  const c = readCookies(request.headers.get("cookie"));
  const known = isDeviceId(c[DEVICE_COOKIE]);
  const codes = (c[CODES_COOKIE] ?? "").split(".").map(normalizeCode).filter((x): x is string => !!x).slice(0, MAX_CODES);
  return { device: known ? c[DEVICE_COOKIE] : newDeviceId(), isNewDevice: !known, codes };
}

function cookie(name: string, value: string, secure: boolean): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${TWO_YEARS}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

function isSecure(request: Request): boolean {
  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

/** Set-Cookie headers that store the device id and (optionally) one more code. */
export function visitorCookies(request: Request, v: Visitor, addCode?: string): string[] {
  const secure = isSecure(request);
  const out: string[] = [];
  if (v.isNewDevice) out.push(cookie(DEVICE_COOKIE, v.device, secure));
  if (addCode && !v.codes.includes(addCode)) {
    const codes = [addCode, ...v.codes].slice(0, MAX_CODES);
    out.push(cookie(CODES_COOKIE, codes.join("."), secure));
  }
  return out;
}

/** The paid levels this visitor owns, checked against the database. */
export async function ownedLevels(v: Visitor): Promise<number[]> {
  if (!v.codes.length || v.isNewDevice || !isDbConfigured()) return [];
  try {
    const products = await deviceProducts(v.codes, v.device);
    return [...new Set(products.flatMap(levelsOf))].sort((a, b) => a - b);
  } catch (error) {
    console.error(`[games] access check failed: ${(error as Error).message}`);
    return [];
  }
}

export function parseLevel(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 8 ? n : null;
}

export async function canPlay(v: Visitor, n: number): Promise<{ ok: boolean; owned: number[] }> {
  const owned = await ownedLevels(v);
  return { ok: n === FREE_LEVEL || owned.includes(n), owned };
}

/**
 * The built levels (tools/danish-rail-finder/build_levels.py) live in
 * games-private/, not public/. They are imported as JSON, so they are bundled
 * into the server code on any host and only these routes can hand them out.
 */
export async function readLevelPage(n: number): Promise<string> {
  const mod = await import(`@/games-private/level${n}.page.json`);
  return (mod.default ?? mod).html as string;
}

export async function readLevelData(n: number): Promise<string> {
  const mod = await import(`@/games-private/level${n}.json`);
  return JSON.stringify(mod.default ?? mod);
}
