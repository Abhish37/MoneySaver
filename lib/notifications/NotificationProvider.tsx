'use client'

import React, { useEffect } from 'react'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register Service Worker for Notifications
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully', registration.scope)
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error)
        })
    }
  }, [])

  return <>{children}</>
}
