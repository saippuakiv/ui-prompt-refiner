import { NextResponse } from 'next/server';

const windowMs = 60_000; // 1 minute
const maxRequests = 10;

const hits: number[] = [];

export function ratelimit(): NextResponse | null {
  const now = Date.now();

  // Remove expired entries
  while (hits.length > 0 && hits[0] <= now - windowMs) {
    hits.shift();
  }

  if (hits.length >= maxRequests) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    );
  }

  hits.push(now);
  return null;
}
