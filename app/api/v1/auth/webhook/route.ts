import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/db'
import { users } from '../../../../../db/schema'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { type, data } = payload

    if (type === 'user.created') {
      const clerkId = data.id
      const email = data.email_addresses?.[0]?.email_address
      const fullName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim()
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      if (email && clerkId) {
        await db.insert(users).values({
          clerkId,
          email,
          fullName: fullName || 'MoneySaver User',
          referralCode,
        }).onConflictDoNothing()
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 })
  }
}
