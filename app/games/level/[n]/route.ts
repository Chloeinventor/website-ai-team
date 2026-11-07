import { canPlay, parseLevel, readLevelFile, visitorCookies, visitorFrom } from "@/lib/games/access";
import { html, redirect } from "@/lib/games/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A level's page. Level 1 is free; a paid level opens only for a player who owns it. */
export async function GET(request: Request, { params }: { params: { n: string } }) {
  const n = parseLevel(params.n);
  if (!n) return redirect("/games/levels", request);
  const v = visitorFrom(request);
  const cookies = visitorCookies(request, v);
  const { ok } = await canPlay(v, n);
  if (!ok) return redirect(`/games/levels?level=${n}`, request, cookies);
  // The paid pages hold no map data: it is fetched from /api/games/level-data.
  return html(await readLevelFile(n, "html"), { cookies, cache: n === 1 ? "public, max-age=300" : "private, no-store" });
}
