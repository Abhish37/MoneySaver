import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const retailer = searchParams.get('retailer')
    const product = searchParams.get('product')

    if (!retailer) {
      return NextResponse.json({ error: 'Retailer parameter is required' }, { status: 400 })
    }

    // 1. Check Redis Cache First (6-hour TTL)
    const redis = getRedisClient()
    const cacheKey = `ms:coupons:${retailer.toLowerCase()}`
    
    if (redis) {
      try {
        const cachedCoupons = await redis.get(cacheKey)
        if (cachedCoupons) {
          console.log(`[API] Returning cached coupons for ${retailer}`)
          return NextResponse.json(cachedCoupons)
        }
      } catch (err) {
        console.error('[API] Redis Cache Read Error:', err)
        // Fail open: continue to fetch if cache fails
      }
    }

    // 2. Fetch from Playwright Microservice
    // In production, this would be your Railway URL. Locally, it's port 4000.
    const MICROSERVICE_URL = process.env.COUPON_SERVICE_URL || 'http://127.0.0.1:4000/api/scrape'
    
    const targetUrl = new URL(MICROSERVICE_URL)
    targetUrl.searchParams.set('retailer', retailer)
    if (product) targetUrl.searchParams.set('product', product)

    console.log(`[API] Fetching live coupons from: ${targetUrl.toString()}`)
    
    const response = await fetch(targetUrl.toString(), {
      // Short timeout so we don't hang the Vercel function
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`Microservice responded with status: ${response.status}`)
    }

    const data = await response.json()

    // 3. Cache the successful result
    if (redis && data.success && data.coupons?.length > 0) {
      try {
        // Cache store-wide coupons for 6 hours (21600 seconds)
        await redis.setex(cacheKey, 21600, JSON.stringify(data))
      } catch (err) {
        console.error('[API] Redis Cache Write Error:', err)
      }
    }

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('[API] Coupon Fetch Error:', error)
    
    // Fallback if microservice is down or times out
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch live coupons',
      coupons: [] // Return empty array so UI doesn't crash
    }, { status: 500 })
  }
}
