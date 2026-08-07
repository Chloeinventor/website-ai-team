/**
 * Per-IP sliding-window limiter for the send-draft route.
 *
 * Same honest caveat as the order store: this map lives in one serverless
 * instance, so a determined abuser who lands on different instances gets more
 * than `limit` sends. It stops casual abuse and accidental double-clicks, not a
 * botnet. For anything beyond a demo, move the counter to Redis/KV — the
 * function signature is the whole surface that would change.
 */

interface Bucket {
  hits: number[];
}

const globalBuckets = globalThis as unknown as {
  __sendDraftBuckets?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  if (!globalBuckets.__sendDraftBuckets) {
    globalBuckets.__sendDraftBuckets = new Map();
  }
  return globalBuckets.__sendDraftBuckets;
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the next send is allowed. Only set when `ok` is false. */
  retryAfter?: number;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  { limit = 3, windowMs = 60 * 60 * 1000, now = Date.now() } = {},
): RateLimitResult {
  const store = buckets();
  const bucket = store.get(key) ?? { hits: [] };

  // Drop anything outside the window, then decide.
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = Math.min(...bucket.hits);
    store.set(key, bucket);
    return {
      ok: false,
      retryAfter: Math.ceil((windowMs - (now - oldest)) / 1000),
      remaining: 0,
    };
  }

  bucket.hits.push(now);
  store.set(key, bucket);

  // Keep the map from growing without bound on a long-lived instance.
  if (store.size > 5_000) {
    for (const [id, entry] of store) {
      if (entry.hits.every((at) => now - at >= windowMs)) store.delete(id);
    }
  }

  return { ok: true, remaining: limit - bucket.hits.length };
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Test hook — the limiter is module state, so tests need a way to reset it. */
export function resetRateLimits(): void {
  buckets().clear();
}
