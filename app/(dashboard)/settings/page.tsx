'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import { getAuthSession, UserProfile } from '../../../lib/auth/session'
import { useRouter } from 'next/navigation'
import { NotificationSettingsCard } from '@/components/notifications/NotificationSettingsCard'

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
    <div className="min-h-screen bg-[#0E1117] text-[#E6EDF3] pb-24 md:pb-12">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#E6EDF3] font-display">Account Settings</h1>
          <p className="text-xs text-[#7D8590] mt-1">Manage your preferences and notification settings</p>
        </div>

        {savedMsg && (
          <div className="mb-5 p-3 rounded-lg bg-[#1A4731]/40 border border-[#2DA44E]/30 text-xs text-[#2DA44E] font-medium text-center animate-fade-in">
            ✓ Settings saved successfully
          </div>
        )}

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
          
          {/* Notification Settings */}
          <div className="p-6 border-b border-[#21262D]">
            <NotificationSettingsCard />
          </div>

          {/* Payment Preferences */}
          <div className="p-6 border-b border-[#21262D]">
            <h3 className="text-sm font-semibold text-[#E6EDF3] mb-1 flex items-center gap-2">
              <span className="text-base">💳</span> Payment Preferences
            </h3>
            <p className="text-xs text-[#7D8590] mb-4">Manage your saved cards and UPI apps for instant discount calculations.</p>
            <button
              onClick={() => router.push('/cards')}
              className="px-4 py-2 rounded-lg bg-[#1C2128] hover:bg-[#21262D] border border-[#30363D] hover:border-[#484F58] font-medium text-xs text-[#E6EDF3] transition-all"
            >
              Manage Saved Cards &amp; UPI Apps →
            </button>
          </div>

          {/* Save Button */}
          <div className="p-6">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white transition-all shadow-[0_2px_10px_rgba(35,134,54,0.2)] min-h-[44px] text-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
