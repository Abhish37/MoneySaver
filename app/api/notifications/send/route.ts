import { NextRequest, NextResponse } from 'next/server'
import { NotificationService, NotificationPayload } from '@/lib/notifications/service'
import { z } from 'zod'

const sendSchema = z.object({
  userId: z.string(),
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
    const result = sendSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { userId, notification } = result.data

    await NotificationService.sendToUser(userId, notification as NotificationPayload)

    return NextResponse.json({ success: true, queued: true })
  } catch (error: any) {
    console.error('[Notification Send Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
