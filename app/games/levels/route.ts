import { isDbConfigured } from "@/lib/games/db";
import { ownedLevels, parseLevel, visitorCookies, visitorFrom } from "@/lib/games/access";
import { html } from "@/lib/games/http";
import { levelsPage } from "@/lib/games/pages";
import { isStripeConfigured } from "@/lib/games/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The shop: every level, what this visitor owns, buy buttons, enter a code. */
export async function GET(request: Request) {
  const v = visitorFrom(request);
  const owned = await ownedLevels(v);
  const focus = parseLevel(new URL(request.url).searchParams.get("level"));
  return html(levelsPage({ owned, focus, canBuy: isStripeConfigured() && isDbConfigured() }), {
    cookies: visitorCookies(request, v),
  });
}
