import { NextRequest, NextResponse } from 'next/server'
import { NotificationService, NotificationPayload } from '@/lib/notifications/service'
import { z } from 'zod'

const broadcastSchema = z.object({
  notification: z.object({
    title: z.string(),
    body: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    url: z.string().optional(),
    data: z.any().optional(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    // In production, this should be protected by an admin API key or internal network check
    const body = await req.json()
    const result = broadcastSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { notification } = result.data

    await NotificationService.broadcast(notification as NotificationPayload)

    return NextResponse.json({ success: true, queued: true })
  } catch (error: any) {
    console.error('[Notification Broadcast Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
