'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import { getAuthSession, UserProfile } from '../../../lib/auth/session'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [notifyCoupons, setNotifyCoupons] = useState(true)
  const [notifyCards, setNotifyCards] = useState(true)
  const [savedMsg, setSavedMsg] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }
  }, [router])

  const handleSave = () => {
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        {savedMsg && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-semibold text-center animate-fade-in">
            ✓ Settings saved successfully!
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800">
              🔔 Notification Preferences
            </h3>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span>Notify me when saved vault coupons are about to expire</span>
                <input
                  type="checkbox"
                  checked={notifyCoupons}
                  onChange={(e) => setNotifyCoupons(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <span>Notify me when new high-cashback bank offers are released</span>
                <input
                  type="checkbox"
                  checked={notifyCards}
                  onChange={(e) => setNotifyCards(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-emerald-500"
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800">
              💳 Payment Preferences Shortcut
            </h3>
            <button
              onClick={() => router.push('/cards')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-colors"
            >
              Manage Saved Cards & UPI Apps ↗
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 min-h-[44px]"
          >
            Save Settings 💾
          </button>
        </div>
      </main>

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
