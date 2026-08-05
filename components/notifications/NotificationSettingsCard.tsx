'use client'

import React from 'react'
import { useNotificationPermission, usePushSubscription } from '@/lib/notifications/hooks'
import { PermissionStatusBadge } from './PermissionStatusBadge'

export function NotificationSettingsCard() {
  const { permission, requestPermission } = useNotificationPermission()
  const { isSubscribed, subscribe, unsubscribe, isLoading } = usePushSubscription()

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Push Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">Receive alerts for price drops, expiry, and messages.</p>
        </div>
        <PermissionStatusBadge />
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
        {permission === 'denied' ? (
          <p className="text-xs text-red-400 font-semibold">
            You have blocked notifications. Please enable them in your browser settings to receive alerts.
          </p>
        ) : isSubscribed ? (
          <button
            onClick={unsubscribe}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-red-950/40 hover:border-red-500/30 text-slate-300 hover:text-red-400 font-bold text-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Unsubscribe'}
          </button>
        ) : (
          <button
            onClick={async () => {
              if (permission !== 'granted') await requestPermission()
              await subscribe()
            }}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Subscribe to Notifications'}
          </button>
        )}
      </div>
    </div>
  )
}
