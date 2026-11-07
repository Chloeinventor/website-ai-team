import { canPlay, parseLevel, readLevelData, visitorFrom } from "@/lib/games/access";
import { json } from "@/lib/games/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The map data for a paid level, only for a device that owns it. */
export async function GET(request: Request) {
  const n = parseLevel(new URL(request.url).searchParams.get("n"));
  if (!n || n === 1) return json({ error: "Unknown level" }, { status: 404 });
  const v = visitorFrom(request);
  const { ok, owned } = await canPlay(v, n);
  if (!ok) return json({ error: "Not unlocked" }, { status: 403 });
  return new Response(await readLevelData(n), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      "X-Levels-Owned": owned.join(","),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
