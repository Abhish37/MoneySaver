import { NextRequest, NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { NotificationService } from '@/lib/notifications/service'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, payload } = body

    if (type === 'SEND_TO_USER') {
      const { userId, notification } = payload
      const subs = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, userId)
      })

      for (const sub of subs) {
        if (!sub.isActive) continue
        await NotificationService.sendRaw(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
          notification
        ).catch(console.error)
      }
    } 
    else if (type === 'SEND_TO_USERS') {
      const { userIds, notification } = payload
      const subs = await db.query.pushSubscriptions.findMany({
        where: inArray(pushSubscriptions.userId, userIds)
      })

      for (const sub of subs) {
        if (!sub.isActive) continue
        await NotificationService.sendRaw(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
          notification
        ).catch(console.error)
      }
    }
    else if (type === 'BROADCAST') {
      const { notification } = payload
      // For large scale, you'd want to paginate this in a real worker.
      // For Next.js limit, we fetch active subscriptions.
      const subs = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.isActive, true)
      })

      for (const sub of subs) {
        await NotificationService.sendRaw(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
          notification
        ).catch(console.error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[QStash Worker Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Verify the request came from QStash
export const POST = verifySignatureAppRouter(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || 'dummy_current_key',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || 'dummy_next_key',
})
