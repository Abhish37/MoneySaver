'use client'

import React from 'react'
import { useNotificationPermission, usePushSubscription } from '@/lib/notifications/hooks'

export function EnableNotificationButton({ className = '' }: { className?: string }) {
  const { permission, requestPermission } = useNotificationPermission()
  const { isSubscribed, subscribe, isLoading } = usePushSubscription()

  if (permission === 'denied') {
    return (
      <button disabled className={`px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed ${className}`}>
        Notifications Blocked
      </button>
    )
  }

  if (isSubscribed) {
    return (
      <button disabled className={`px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-xs ${className}`}>
        Notifications Enabled
      </button>
    )
  }

  const handleEnable = async () => {
    const perm = await requestPermission()
    if (perm === 'granted') {
      await subscribe()
    }
  }

  return (
    <button
      onClick={handleEnable}
      disabled={isLoading}
      className={`px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950 ${className} disabled:opacity-50`}
    >
      {isLoading ? 'Enabling...' : 'Enable Notifications'}
    </button>
  )
}
