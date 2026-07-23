import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

/**
 * Upstash Redis Rate Limiting Helper (Phase 6 Safety)
 */

// Stacker API: 30 requests / 1 min per IP
export const stackerRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/stacker',
})

// OCR Upload API: 5 requests / 1 min per User ID
export const ocrRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/ocr',
})
