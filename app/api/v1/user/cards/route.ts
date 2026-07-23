import { NextResponse } from 'next/server'
import { getOrSyncUser } from '../../../../../lib/auth/jitSync'
import { db } from '../../../../../lib/db'
import { userCards } from '../../../../../db/schema'

export async function POST(req: Request) {
  try {
    const user = await getOrSyncUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cards } = await req.json()
    if (!Array.isArray(cards)) {
      return NextResponse.json({ error: 'Invalid card payload' }, { status: 400 })
    }

    // Insert user cards
    for (const card of cards) {
      await db.insert(userCards).values({
        userId: user.id,
        bankName: card.bankName,
        cardName: card.cardName,
        cardType: card.cardType || 'CREDIT',
      }).onConflictDoNothing()
    }

    return NextResponse.json({ success: true, count: cards.length })
  } catch (error) {
    console.error('Error saving user cards:', error)
    return NextResponse.json({ error: 'Failed to save card preferences' }, { status: 500 })
  }
}
