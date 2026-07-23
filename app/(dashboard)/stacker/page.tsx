'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Standalone stacker page is deprecated.
 * Savings matrix is now embedded inside brand pages and product search results.
 * Redirects to Dashboard.
 */
export default function StackerRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Redirecting to Dashboard...</p>
      </div>
    </div>
  )
}
