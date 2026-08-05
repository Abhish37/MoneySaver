import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/session'
import { NotificationService } from '@/lib/notifications/service'
import { z } from 'zod'

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
})

export async function POST(req: NextRequest) {
  try {
    const user = getAuthSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = subscribeSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid subscription payload', details: result.error.errors }, { status: 400 })
    }

    const userAgent = req.headers.get('user-agent') || ''

    await NotificationService.subscribe(user.id, result.data.subscription, userAgent)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Notification Subscribe Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
