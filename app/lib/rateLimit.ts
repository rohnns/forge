// Rate limiter with Upstash Redis backend for production.
//
// FIX #2: The original in-memory Map resets on every serverless cold start,
// making the rate limit trivially bypassable on Vercel/serverless platforms.
// Use Upstash Redis (HTTP-based, works in edge/serverless) in production.
// In-memory fallback is kept for local dev only and logs a warning.
//
// Setup:
//   1. Create a free Upstash Redis database at https://upstash.com
//   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
//   3. npm install @upstash/redis

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else if (process.env.NODE_ENV === "production") {
  // Hard-fail at startup in production rather than silently falling back to
  // in-memory, which would give a false sense of rate-limit protection.
  throw new Error(
    "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production. " +
    "Create a free database at https://upstash.com and add the credentials to your environment."
  );
} else {
  console.warn(
    "[rateLimit] Upstash Redis not configured — using in-memory fallback. " +
    "This is fine for local dev but MUST NOT be used in production."
  );
}

// ---------------------------------------------------------------------------
// Dev fallback: in-memory (single-process only, resets on restart)
// ---------------------------------------------------------------------------

const devStore = new Map<string, { count: number; resetAt: number }>();

if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of devStore.entries()) {
      if (now > val.resetAt) devStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const windowSec = Math.ceil(windowMs / 1000);

  if (redis) {
    return rateLimitRedis(key, limit, windowSec);
  }
  return rateLimitMemory(key, limit, windowMs);
}

async function rateLimitRedis(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisKey = `rl:${key}`;
  const count = await redis!.incr(redisKey);
  if (count === 1) {
    await redis!.expire(redisKey, windowSec);
  }
  const ttl = await redis!.ttl(redisKey);
  const resetAt = Date.now() + ttl * 1000;
  if (count > limit) {
    return { allowed: false, remaining: 0, resetAt };
  }
  return { allowed: true, remaining: limit - count, resetAt };
}

function rateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = devStore.get(key);
  if (!record || now > record.resetAt) {
    devStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}
