import 'server-only';

/**
 * Minimal in-process sliding-window rate limiter.
 *
 * This is intentionally dependency-free. It is a *best-effort* layer: in a
 * multi-instance deployment each instance keeps its own counters, so the
 * authoritative limit for a given phone number is the database-backed check in
 * the OTP routes. Use this to blunt broad abuse (SMS bombing from one source).
 */
type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    // Drop hits older than a day; anything still inside its own window has
    // already been filtered at check time.
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying. */
  retryAfter: number;
}

export interface RateLimitOptions {
  /**
   * Whether the call counts against the budget.
   *
   * `false` checks the bucket without recording a hit. It is used when the
   * request may still fail for a reason that is not the caller's fault - a
   * server that cannot reach the SMS provider, for example - so the counter
   * is only bumped once the request actually succeeded.
   */
  consume?: boolean;
}

/**
 * Rate limit a key.
 *
 * This is intentionally dependency-free. It is a *best-effort* layer: in a
 * multi-instance deployment each instance keeps its own counters, so the
 * authoritative limit for a given phone number is the database-backed check in
 * the OTP routes. Use this to blunt broad abuse (SMS bombing from one source).
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  options: RateLimitOptions = {},
): RateLimitResult {
  const consume = options.consume ?? true;
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.timestamps[0]!;
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }

  if (consume) {
    bucket.timestamps.push(now);
    buckets.set(key, bucket);
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * Best-effort client IP for a request. Honours the usual proxy headers.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? 'unknown';
}
