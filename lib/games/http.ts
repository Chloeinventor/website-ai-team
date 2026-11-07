/** Small response helpers for the games routes. */
export function html(body: string, init: { status?: number; cookies?: string[]; cache?: string } = {}): Response {
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": init.cache ?? "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
  });
  for (const c of init.cookies ?? []) headers.append("Set-Cookie", c);
  return new Response(body, { status: init.status ?? 200, headers });
}

export function json(data: unknown, init: { status?: number; cookies?: string[]; headers?: Record<string, string> } = {}): Response {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "private, no-store", ...(init.headers ?? {}) });
  for (const c of init.cookies ?? []) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify(data), { status: init.status ?? 200, headers });
}

export function redirect(to: string, request: Request, cookies: string[] = []): Response {
  const headers = new Headers({ Location: new URL(to, request.url).toString(), "Cache-Control": "private, no-store" });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(null, { status: 303, headers });
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
