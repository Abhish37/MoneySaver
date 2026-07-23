import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import { watchlist } from '../../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/v1/watchlist
 * GET  /api/v1/watchlist
 *
 * Phase 2 Implementation: Wired to the Neon Postgres DB.
 * Uses the `userId` provided in headers/body (since auth is currently client-side localStorage).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productVariantId, targetPrice, notificationChannel = 'IN_APP', userId } = body

    if (!productVariantId || !userId) {
      return NextResponse.json(
        { error: 'productVariantId and userId are required.' },
        { status: 400 }
      )
    }

    // Insert into watchlist table
    const [newItem] = await db.insert(watchlist).values({
      userId,
      productVariantId,
      targetPrice: targetPrice?.toString(),
      notificationChannel,
    }).returning()

    return NextResponse.json({
      success: true,
      message: 'Product added to watchlist.',
      watchlistItem: newItem,
    }, { status: 201 })
  } catch (error) {
    console.error('[Watchlist POST] Error:', error)
    return NextResponse.json({ error: 'Failed to add to watchlist.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const items = await db.select().from(watchlist).where(eq(watchlist.userId, userId))

    return NextResponse.json({
      watchlist: items,
      retrievedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Watchlist GET] Error:', error)
    return NextResponse.json({ error: 'Failed to retrieve watchlist.' }, { status: 500 })
  }
}
