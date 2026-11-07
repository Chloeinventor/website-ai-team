import { levelsOf } from "@/lib/games/catalog";
import { normalizeCode } from "@/lib/games/code";
import { activatePurchase, claimDevice } from "@/lib/games/db";
import { visitorCookies, visitorFrom } from "@/lib/games/access";
import { html } from "@/lib/games/http";
import { unlockPage } from "@/lib/games/pages";
import { retrieveCheckoutSession } from "@/lib/games/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stripe sends the buyer here after paying: check the payment, unlock this device, show the code. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id") ?? "";
  const v = visitorFrom(request);
  try {
    const s = await retrieveCheckoutSession(id);
    const code = normalizeCode(s.code);
    if (!code) return html(unlockPage({ kind: "error" }), { status: 400 });
    if (!s.paid) return html(unlockPage({ kind: "pending" }), { cookies: visitorCookies(request, v) });
    // The webhook does this too; doing it here means the buyer never waits for it.
    await activatePurchase(code, { email: s.email, paymentIntent: s.paymentIntent });
    const claim = await claimDevice(code, v.device);
    if (!claim.ok) {
      if (claim.reason === "device_limit") return html(unlockPage({ kind: "device_limit", code }), { cookies: visitorCookies(request, v) });
      return html(unlockPage({ kind: "error" }), { status: 403 });
    }
    return html(unlockPage({ kind: "ok", code, levels: levelsOf(claim.product) }), { cookies: visitorCookies(request, v, code) });
  } catch (error) {
    console.error(`[games unlock] ${(error as Error).message}`);
    return html(unlockPage({ kind: "error" }), { status: 502 });
  }
}
