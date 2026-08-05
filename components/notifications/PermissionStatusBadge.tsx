'use client'

import React from 'react'
import { useNotificationPermission } from '@/lib/notifications/hooks'

export function PermissionStatusBadge() {
  const { permission } = useNotificationPermission()

  if (permission === 'granted') {
    return <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-bold text-emerald-400">Allowed</span>
  }
  if (permission === 'denied') {
    return <span className="px-2.5 py-1 rounded-full bg-red-950 border border-red-500/40 text-[10px] font-bold text-red-400">Blocked</span>
  }
  return <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">Not Requested</span>
}
