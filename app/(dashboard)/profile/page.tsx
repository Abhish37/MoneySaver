'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import { getAuthSession, logoutUser, UserProfile } from '../../../lib/auth/session'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }
  }, [router])

  const handleLogout = () => {
    logoutUser()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-3xl font-bold font-mono text-slate-950 shadow-xl">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-slate-100">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-semibold text-emerald-400">
                  ✓ Verified Member
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-slate-400">
                  Role: {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/40 font-semibold text-red-300 text-xs transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Savings</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                ₹{user.totalSavings || 1850}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Saved Coupons</span>
              <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                {user.savedCouponsCount || 4}
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Member Since</span>
              <div className="text-sm font-bold text-slate-200 mt-2">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
