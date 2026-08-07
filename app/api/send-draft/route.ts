import { NextResponse } from "next/server";

import { renderDraftEmail, sanitizeRun } from "@/lib/email/draft-email";
import { checkRateLimit, clientKey } from "@/lib/email/rate-limit";
import { originFrom, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Send the draft to myself" — one email, to the address typed in the form.
 *
 * This is a public endpoint that puts mail in a stranger's inbox, so it is
 * deliberately narrow:
 *  - the body is rebuilt server-side from structured fields (no client markup)
 *  - the subject and from-address are fixed, never visitor-controlled
 *  - per-IP rate limit, and one recipient per request
 *  - RESEND_API_KEY lives server-side only and is never returned to the client
 *
 * The real backstop is Resend's own domain verification: until you verify a
 * domain, Resend will only deliver to your own account address, which makes
 * this safe to ship before it is safe to abuse.
 */

const MAX_BODY_BYTES = 32 * 1024;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email sending isn't configured on this deployment. Add RESEND_API_KEY to turn it on.",
        code: "not_configured",
      },
      { status: 503 },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That draft is too large to email." }, { status: 413 });
  }

  const body = (() => {
    try {
      return JSON.parse(raw) as { email?: unknown; run?: unknown };
    } catch {
      return null;
    }
  })();

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That email address looks off." }, { status: 400 });
  }

  const run = sanitizeRun(body?.run);
  if (!run) {
    return NextResponse.json(
      { error: "Run the draft first — there's nothing to send yet." },
      { status: 400 },
    );
  }

  // Rate limit on IP and on recipient, so neither a single source nor a single
  // victim can be hammered.
  const ip = clientKey(request.headers);
  for (const key of [`ip:${ip}`, `to:${email.toLowerCase()}`]) {
    const limit = checkRateLimit(key);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: `That's the limit for now — try again in about ${Math.ceil(
            (limit.retryAfter ?? 60) / 60,
          )} minutes.`,
          code: "rate_limited",
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter ?? 3600) } },
      );
    }
  }

  const origin = originFrom(request.headers);
  const { subject, html, text } = renderDraftEmail(run, {
    siteName: SITE.name,
    origin,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Fixed sender. Until a domain is verified in Resend, this must stay
        // onboarding@resend.dev and will only deliver to your own address.
        from: process.env.RESEND_FROM ?? "Proposal Builder <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
        text,
      }),
      cache: "no-store",
    });

    const result = (await res.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!res.ok) {
      // Surface Resend's own message — "you can only send to your own address"
      // is the most common one, and hiding it just confuses the operator.
      console.error(`[send-draft] resend rejected: ${result?.message ?? res.statusText}`);
      return NextResponse.json(
        { error: result?.message ?? "The email service rejected that.", code: result?.name },
        { status: 502 },
      );
    }

    console.info(`[send-draft] sent ${result?.id} to ${email} (ip ${ip})`);
    return NextResponse.json({ ok: true, id: result?.id });
  } catch (error) {
    console.error("[send-draft] transport error", error);
    return NextResponse.json(
      { error: "Couldn't reach the email service. Try again in a moment." },
      { status: 502 },
    );
  }
}
