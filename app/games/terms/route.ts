import { html } from "@/lib/games/http";
import { termsPage } from "@/lib/games/pages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return html(termsPage(), { cache: "public, max-age=300" });
}
