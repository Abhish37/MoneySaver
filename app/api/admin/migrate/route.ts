import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrate } from 'drizzle-orm/neon-http/migrator'

export async function GET(req: NextRequest) {
  try {
    // Only allow in development or with a secret
    const secret = req.nextUrl.searchParams.get('secret')
    if (process.env.NODE_ENV === 'production' && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await migrate(db, { migrationsFolder: './db/migrations' })

    return NextResponse.json({ success: true, message: 'Database migrations applied successfully.' })
  } catch (error: any) {
    console.error('[Migration Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
