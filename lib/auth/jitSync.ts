import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * JIT (Just-In-Time) User Sync Safeguard (TRD-AMD-03)
 * Guarantees a valid row exists in `users` table before executing dependent queries.
 * Prevents foreign key failures if Clerk webhook is delayed during cold starts.
 */
export async function getOrSyncUser() {
  const { userId } = auth()
  if (!userId) return null

  // 1. Try fetching existing user from Neon DB
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })

  if (dbUser) return dbUser

  // 2. Fallback: Fetch Clerk user details and provision DB row on-the-fly
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@user.clerk.com`
  const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Saver User'
  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email: primaryEmail,
      fullName: fullName,
      referralCode: referralCode,
    })
    .onConflictDoNothing()
    .returning()

  if (newUser) return newUser

  // Fetch again if conflict occurred
  return await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
}
