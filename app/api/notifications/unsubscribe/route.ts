import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/session'
import { NotificationService } from '@/lib/notifications/service'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = unsubscribeSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await NotificationService.unsubscribe(result.data.endpoint)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Notification Unsubscribe Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
