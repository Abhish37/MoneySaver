/**
 * lib/hooks/useRequireAuth.ts
 * Single shared hook that guards all dashboard pages.
 * Replaces the 8-line auth block duplicated in every page.
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthSession, UserProfile } from '@/lib/auth/session'

export function useRequireAuth() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }
    setLoading(false)
  }, [router])

  return { user, loading }
}
