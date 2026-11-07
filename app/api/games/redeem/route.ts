import { levelsOf } from "@/lib/games/catalog";
import { normalizeCode } from "@/lib/games/code";
import { claimDevice, isDbConfigured } from "@/lib/games/db";
import { visitorCookies, visitorFrom } from "@/lib/games/access";
import { clientIp, json } from "@/lib/games/http";
import { checkRateLimit } from "@/lib/email/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unlock this device with a purchase code (counts toward the code's device limit). */
export async function POST(request: Request) {
  if (!checkRateLimit(`games-redeem:${clientIp(request)}`, { limit: 10 }).ok) {
    return json({ ok: false, reason: "busy" }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = normalizeCode(body?.code);
  if (!code) return json({ ok: false, reason: "unknown" }, { status: 400 });
  if (!isDbConfigured()) return json({ ok: false, reason: "unavailable" }, { status: 503 });

  const v = visitorFrom(request);
  try {
    const result = await claimDevice(code, v.device);
    if (!result.ok) return json(result, { status: 403, cookies: visitorCookies(request, v) });
    return json({ ok: true, levels: levelsOf(result.product) }, { cookies: visitorCookies(request, v, code) });
  } catch (error) {
    console.error(`[games redeem] ${(error as Error).message}`);
    return json({ ok: false, reason: "unavailable" }, { status: 502 });
  }
}
