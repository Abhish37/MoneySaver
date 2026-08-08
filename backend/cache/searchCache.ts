import { redis } from '../../lib/redis'

/**
 * Search Cache Layer
 *
 * Wraps Redis (Upstash) with typed get/set helpers.
 * TTL values from the refactoring spec:
 *   - Search results:  15 minutes (900s)
 *   - Product page:    30 minutes (1800s)
 *   - Store metadata:  24 hours   (86400s)
 *
 * Cache key format: ms:search:{normalizedQuery}
 */

const TTL = {
  SEARCH: 900,    // 15 min
  PRODUCT: 1800,  // 30 min
  STORE: 86400,   // 24 hr
} as const

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

export async function getCachedSearch<T = object>(query: string): Promise<T | null> {
  try {
    const key = `ms:search:v2:${normalizeQuery(query)}`
    const cached = await redis.get<T>(key)
    return cached ?? null
  } catch (error) {
    // Cache miss is not fatal — log and continue to live search
    console.warn('[SearchCache] Redis GET failed:', error)
    return null
  }
}

export async function setCachedSearch(
  query: string,
  data: object,
  ttl: number = TTL.SEARCH
): Promise<void> {
  try {
    const key = `ms:search:v2:${normalizeQuery(query)}`
    await redis.set(key, data, { ex: ttl })
  } catch (error) {
    console.warn('[SearchCache] Redis SET failed:', error)
  }
}

export async function getCachedProduct<T>(productId: string): Promise<T | null> {
  try {
    const key = `ms:product:${productId}`
    const cached = await redis.get<T>(key)
    return cached ?? null
  } catch (error) {
    console.warn('[SearchCache] Redis product GET failed:', error)
    return null
  }
}

export async function setCachedProduct<T>(
  productId: string,
  data: T,
  ttl: number = TTL.PRODUCT
): Promise<void> {
  try {
    const key = `ms:product:${productId}`
    await redis.set(key, data, { ex: ttl })
  } catch (error) {
    console.warn('[SearchCache] Redis product SET failed:', error)
  }
}

export async function invalidateSearchCache(query: string): Promise<void> {
  try {
    const key = `ms:search:v2:${normalizeQuery(query)}`
    await redis.del(key)
  } catch (error) {
    console.warn('[SearchCache] Redis DEL failed:', error)
  }
}
