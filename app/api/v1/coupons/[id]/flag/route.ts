import { NextResponse } from 'next/server'
import { getOrSyncUser } from '../../../../../../lib/auth/jitSync'
import { db } from '../../../../../../lib/db'
import { coupons, couponFlags } from '../../../../../../db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getOrSyncUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gating Safeguard: Account age must be > 24 hours
    const userCreatedAt = new Date(user.createdAt)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (userCreatedAt > twentyFourHoursAgo) {
      return NextResponse.json(
        { error: 'Account must be at least 24 hours old to flag coupons' },
        { status: 403 }
      )
    }

    const { reason } = await req.json()
    const couponId = params.id

    // Insert unique user flag
    await db.insert(couponFlags).values({
      couponId,
      userId: user.id,
      reason: reason || 'EXPIRED',
    }).onConflictDoNothing()

    // Increment downvote count on coupons table
    const [updatedCoupon] = await db
      .update(coupons)
      .set({ downvotes: sql`${coupons.downvotes} + 1` })
      .where(eq(coupons.id, couponId))
      .returning()

    // Threshold check: if downvotes >= 3, set status = 'PENDING_REVIEW'
    if (updatedCoupon && updatedCoupon.downvotes >= 3) {
      await db
        .update(coupons)
        .set({ status: 'PENDING_REVIEW' })
        .where(eq(coupons.id, couponId))
    }

    return NextResponse.json({ success: true, downvotes: updatedCoupon?.downvotes })
  } catch (error) {
    console.error('Flag submission error:', error)
    return NextResponse.json({ error: 'Failed to record downvote flag' }, { status: 500 })
  }
}
