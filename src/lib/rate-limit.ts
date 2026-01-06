import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// For production, use Redis (Upstash) for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; reset: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  
  const now = Date.now();
  const key = `${ip}:${request.nextUrl.pathname}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupExpired(now);
  }

  const existing = rateLimitMap.get(key);
  
  if (!existing || now > existing.resetTime) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: existing.resetTime,
    };
  }

  existing.count++;
  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    reset: existing.resetTime,
  };
}

function cleanupExpired(now: number) {
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    { 
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    }
  );
}
