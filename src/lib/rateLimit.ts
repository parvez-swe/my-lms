import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  timestamps: number[];
};

const cache = new LRUCache<string, RateLimitEntry>({
  max: 10_000,
  ttl: 60 * 60 * 1000,
});

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = cache.get(key) ?? { timestamps: [] };
  const windowStart = now - windowMs;

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    cache.set(key, entry, { ttl: windowMs });
    return true;
  }

  entry.timestamps.push(now);
  cache.set(key, entry, { ttl: windowMs });
  return false;
}

/**
 * Returns a 429 response when the limit is exceeded, otherwise null.
 */
export function withRateLimit(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(req);
  const rateLimitKey = `${key}:${ip}`;

  if (isRateLimited(rateLimitKey, limit, windowMs)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null;
}
