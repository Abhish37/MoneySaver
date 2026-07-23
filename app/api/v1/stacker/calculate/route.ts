import { NextResponse } from 'next/server'
import { calculateStack } from '../../../../../lib/engine/stacker'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { storeSlug, basePrice, userCardNames } = body

    if (!storeSlug || typeof basePrice !== 'number' || basePrice <= 0) {
      return NextResponse.json(
        { error: 'Valid storeSlug and positive basePrice are required' },
        { status: 400 }
      )
    }

    const stackResult = await calculateStack({
      storeSlug,
      basePrice,
      userCardNames: userCardNames || [],
    })

    return NextResponse.json({ success: true, data: stackResult })
  } catch (error) {
    console.error('Stacker Engine calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate savings stack' }, { status: 500 })
  }
}
