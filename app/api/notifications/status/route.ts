import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const user = getAuthSession()
    if (!user) {
      return NextResponse.json({ isSubscribed: false, error: 'Unauthorized' }, { status: 401 })
    }

    const endpoint = req.nextUrl.searchParams.get('endpoint')

    if (endpoint) {
      const sub = await db.query.pushSubscriptions.findFirst({
        where: and(
          eq(pushSubscriptions.userId, user.id),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      })
      return NextResponse.json({ isSubscribed: !!sub })
    }

    const subs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, user.id)
    })
    
    return NextResponse.json({ isSubscribed: subs.length > 0, subscriptionCount: subs.length })
  } catch (error: any) {
    console.error('[Notification Status Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
