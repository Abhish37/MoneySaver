'use client'

import React, { useState, useEffect, useCallback } from 'react'

type PromptState = 'hidden' | 'visible' | 'blocked' | 'loading' | 'success' | 'error'

const PREF_KEY = 'push_permission_preference'

export function PushNotificationPrompt() {
  const [state, setState] = useState<PromptState>('hidden')
  const [mounted, setMounted] = useState(false)

  // ── Determine initial visibility ────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)

    // Gate: Browser must support both Service Workers and Push API
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      return // silently stay hidden — unsupported browser
    }

    const pref = localStorage.getItem(PREF_KEY)

    // User already made a lasting choice
    if (pref === 'granted' || pref === 'dismissed') return

    // Native permission already granted elsewhere (e.g. Settings page)
    if (Notification.permission === 'granted') {
      localStorage.setItem(PREF_KEY, 'granted')
      return
    }

    // Native permission is hard-blocked in browser settings
    if (Notification.permission === 'denied') {
      setState('blocked')
      return
    }

    // Default state — show the prompt after a short delay so UI settles first
    const timer = setTimeout(() => setState('visible'), 1800)
    return () => clearTimeout(timer)
  }, [])

  // ── Allow: request permission → subscribe ───────────────────────────────────
  const handleAllow = useCallback(async () => {
    setState('loading')
    try {
      const result = await Notification.requestPermission()

      if (result === 'granted') {
        // Register / get existing service worker
        const registration = await navigator.serviceWorker.ready

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) {
          console.warn('[PushPrompt] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
          setState('error')
          return
        }

        // Subscribe to Push API using VAPID public key
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        // Persist subscription on server
        const res = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        })

        if (!res.ok) {
          console.warn('[PushPrompt] Server failed to save subscription')
        }

        localStorage.setItem(PREF_KEY, 'granted')
        setState('success')

        // Auto-hide success state
        setTimeout(() => setState('hidden'), 3000)
      } else if (result === 'denied') {
        localStorage.setItem(PREF_KEY, 'dismissed')
        setState('hidden')
      } else {
        // 'default' — user dismissed the native dialog without choosing
        setState('visible')
      }
    } catch (err) {
      console.error('[PushPrompt] Error during subscription:', err)
      setState('error')
    }
  }, [])

  // ── Dismiss: remember choice, hide prompt ───────────────────────────────────
  const handleDismiss = useCallback(() => {
    localStorage.setItem(PREF_KEY, 'dismissed')
    setState('hidden')
  }, [])

  // ── Retry after error ───────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setState('visible')
  }, [])

  // Nothing to render
  if (!mounted || state === 'hidden') return null

  return (
    <div
      role="dialog"
      aria-label="Push notification permission request"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 w-[340px] max-w-[calc(100vw-2.5rem)] animate-push-prompt-in"
      style={{ animation: 'pushPromptSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <style>{`
        @keyframes pushPromptSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes bellPulse {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15%       { transform: rotate(-12deg) scale(1.1); }
          30%       { transform: rotate(10deg) scale(1.1); }
          45%       { transform: rotate(-8deg); }
          60%       { transform: rotate(6deg); }
          75%       { transform: rotate(-3deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45,164,78,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(45,164,78,0); }
        }
      `}</style>

      {/* ── Card shell ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #161B22 0%, #0E1117 100%)',
          border: '1px solid rgba(45,164,78,0.30)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,164,78,0.08) inset',
        }}
      >
        {/* Green top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #2DA44E, transparent)' }}
        />

        {/* ── BLOCKED state ── */}
        {state === 'blocked' && (
          <div className="p-4 flex items-start gap-3">
            <div className="mt-0.5 text-lg">🔕</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#E6EDF3] mb-0.5">Notifications Blocked</p>
              <p className="text-[11px] text-[#7D8590] leading-relaxed">
                Enable push notifications in your browser settings to receive price alerts.
              </p>
            </div>
            <button
              onClick={() => setState('hidden')}
              aria-label="Close"
              className="text-[#484F58] hover:text-[#8E95A3] transition-colors text-lg leading-none mt-0.5 shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* ── SUCCESS state ── */}
        {state === 'success' && (
          <div className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(35,134,54,0.20)', border: '1px solid rgba(45,164,78,0.40)' }}
            >
              <span className="text-base">✓</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2DA44E]">Notifications Enabled!</p>
              <p className="text-[11px] text-[#7D8590] mt-0.5">
                You'll now receive real-time price & deal alerts.
              </p>
            </div>
          </div>
        )}

        {/* ── ERROR state ── */}
        {state === 'error' && (
          <div className="p-4 flex items-start gap-3">
            <div className="mt-0.5 text-lg">⚠️</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#E3B341] mb-0.5">Something went wrong</p>
              <p className="text-[11px] text-[#7D8590] leading-relaxed mb-3">
                Couldn't enable notifications. You can try again or skip for now.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #238636, #2DA44E)' }}
                >
                  Retry
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#7D8590] hover:text-[#B7BCC8] transition-colors"
                  style={{ background: '#1C2128', border: '1px solid #30363D' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VISIBLE / LOADING state (main prompt) ── */}
        {(state === 'visible' || state === 'loading') && (
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3.5">
              {/* Animated bell icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #1A4731 0%, #0D2818 100%)',
                  border: '1px solid rgba(45,164,78,0.35)',
                  animation: 'glowPulse 2.5s ease-in-out infinite',
                }}
              >
                <span
                  className="text-lg select-none"
                  style={{
                    animation: state === 'visible' ? 'bellPulse 2s ease-in-out infinite' : 'none',
                    display: 'inline-block',
                  }}
                >
                  🔔
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E6EDF3] leading-tight mb-0.5">
                  Stay ahead of deals
                </p>
                <p className="text-[11px] text-[#7D8590] leading-relaxed">
                  Get instant alerts when prices drop, coupons expire, or exclusive cashback offers are live.
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                aria-label="Dismiss notification prompt"
                disabled={state === 'loading'}
                className="text-[#484F58] hover:text-[#8E95A3] transition-colors text-xl leading-none mt-0.5 shrink-0 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {['💰 Price drops', '⏰ Coupon expiry', '🎯 Cashback alerts'].map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium text-[#7D8590]"
                  style={{ background: '#1C2128', border: '1px solid #30363D' }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                id="push-prompt-allow-btn"
                onClick={handleAllow}
                disabled={state === 'loading'}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-70 relative overflow-hidden"
                style={{
                  background: state === 'loading'
                    ? '#1A4731'
                    : 'linear-gradient(135deg, #238636 0%, #2DA44E 100%)',
                  boxShadow: state !== 'loading' ? '0 4px 15px rgba(35,134,54,0.35)' : 'none',
                }}
              >
                {state === 'loading' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <LoadingSpinner />
                    Enabling…
                  </span>
                ) : (
                  'Allow Notifications'
                )}
              </button>

              <button
                id="push-prompt-dismiss-btn"
                onClick={handleDismiss}
                disabled={state === 'loading'}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#7D8590] hover:text-[#B7BCC8] transition-colors disabled:opacity-40"
                style={{ background: '#1C2128', border: '1px solid #30363D' }}
              >
                Not Now
              </button>
            </div>

            {/* Privacy note */}
            <p className="text-[10px] text-[#484F58] mt-2 text-center">
              No spam. Only relevant MoneySaver alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

/**
 * Convert a VAPID base64 URL-encoded public key to a Uint8Array
 * required by pushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
