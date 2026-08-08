'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthSession, logoutUser, UserProfile } from '../lib/auth/session'
import { CoinStackIcon, BellIcon } from './icons'

interface VaultCoupon {
  id: string
  store: string
  code: string
  discount?: string
  discountValue: number
  expires: string
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expiringCoupons, setExpiringCoupons] = useState<(VaultCoupon & { daysLeft: number })[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const loadNotifications = () => {
    try {
      const existingVault = localStorage.getItem('moneysaver_user_vault')
      const vaultList: VaultCoupon[] = existingVault ? JSON.parse(existingVault) : []
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const trackingRaw = localStorage.getItem('moneysaver_notified_coupons')
      const notifiedTracking: Record<string, number> = trackingRaw ? JSON.parse(trackingRaw) : {}
      let trackingUpdated = false

      const expiring = vaultList
        .filter((c) => c.expires)
        .map((c) => {
          let expDate = new Date(c.expires)
          const ddmmyyyy = c.expires.match(/^(\d{2})-(\d{2})-(\d{4})$/)
          if (ddmmyyyy) {
            expDate = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}T00:00:00`)
          } else {
            expDate = new Date(`${c.expires}T00:00:00`)
            if (isNaN(expDate.getTime())) {
              expDate = new Date(c.expires)
            }
          }

          const diffTime = expDate.getTime() - today.getTime()
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return { ...c, daysLeft }
        })
        .filter((c) => {
          if (c.daysLeft > 10) return false
          if (!notifiedTracking[c.id]) {
            notifiedTracking[c.id] = Date.now()
            trackingUpdated = true
          }
          const timeInBar = Date.now() - notifiedTracking[c.id]
          const daysInBar = timeInBar / (1000 * 60 * 60 * 24)
          return daysInBar <= 30
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)

      if (trackingUpdated) {
        localStorage.setItem('moneysaver_notified_coupons', JSON.stringify(notifiedTracking))
      }

      setExpiringCoupons(expiring)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setMounted(true)
    const activeUser = getAuthSession()
    setUser(activeUser)
    
    loadNotifications()
    window.addEventListener('vaultUpdated', loadNotifications)
    return () => window.removeEventListener('vaultUpdated', loadNotifications)
  }, [pathname])

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    router.push('/')
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#30363D] bg-[#0E1117]/96 backdrop-blur-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group" aria-label="Money Saver Home">
          <span className="p-1.5 rounded-lg bg-[#1A4731]/60 border border-[#2DA44E]/25 text-[#2DA44E] group-hover:bg-[#1A4731]/90 transition-all duration-200">
            <CoinStackIcon size={18} />
          </span>
          <span className="font-bold text-lg tracking-tight font-display">
            <span className="text-[#2DA44E]">Money</span>
            <span className="text-[#E3B341]">Saver</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`transition-colors ${pathname === '/dashboard' ? 'text-[#2DA44E] font-semibold' : 'text-[#8E95A3] hover:text-[#B7BCC8]'}`}
              >
                Brand Discovery
              </Link>
              <Link
                href="/vault"
                className={`transition-colors ${pathname === '/vault' ? 'text-[#2DA44E] font-semibold' : 'text-[#8E95A3] hover:text-[#B7BCC8]'}`}
              >
                Coupon Vault
              </Link>
              <Link
                href="/cards"
                className={`transition-colors ${pathname === '/cards' ? 'text-[#2DA44E] font-semibold' : 'text-[#8E95A3] hover:text-[#B7BCC8]'}`}
              >
                Cards &amp; UPI
              </Link>
            </>
          ) : (
            <>
              <Link href="#how-it-works" className="text-[#8E95A3] hover:text-[#B7BCC8] transition-colors">
                How It Works
              </Link>
              <Link href="#supported-stores" className="text-[#8E95A3] hover:text-[#B7BCC8] transition-colors">
                Supported Stores
              </Link>
              <Link href="#savings-calculator" className="text-[#8E95A3] hover:text-[#B7BCC8] transition-colors">
                Savings Calculator
              </Link>
              <Link href="#faq" className="text-[#8E95A3] hover:text-[#B7BCC8] transition-colors">
                FAQ
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Coupon Expiry Notification Bell */}
              <div className="relative" title="Coupon Expiry Notifications">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg bg-[#161B22] border border-[#30363D] text-[#7D8590] hover:text-[#E6EDF3] hover:border-[#484F58] flex items-center justify-center w-8 h-8 transition-all relative"
                >
                  <BellIcon size={15} />
                  {expiringCoupons.length > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full bg-[#C9A227] text-[#0E1117] font-bold text-[9px] min-w-[16px] text-center leading-none">
                      {expiringCoupons.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-[#161B22] border border-[#30363D] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-[#30363D] bg-[#0E1117]/60 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#E6EDF3]">Expiring Coupons</h4>
                        <span className="px-2 py-0.5 rounded bg-[#21262D] text-[10px] text-[#7D8590] font-medium border border-[#30363D]">{expiringCoupons.length}</span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {expiringCoupons.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {expiringCoupons.map((coupon) => (
                              <div key={coupon.id} className="p-3 rounded-lg hover:bg-[#1C2128] transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 text-base">⏳</div>
                                  <div>
                                    <p className="text-xs text-[#7D8590] leading-relaxed">
                                      <strong className="text-[#2DA44E]">{coupon.store}</strong> —{' '}
                                      <strong className="text-[#E3B341]">
                                        {coupon.discount || (coupon.discountValue > 50 ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`)}
                                      </strong>{' '}
                                      expires in{' '}
                                      <strong className="text-[#E6EDF3]">{coupon.daysLeft} days</strong>.
                                    </p>
                                    <p className="text-[10px] text-[#484F58] font-mono mt-1">Code: {coupon.code}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <div className="text-2xl mb-2 opacity-40">✓</div>
                            <p className="text-xs text-[#7D8590]">No coupons expiring soon</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SuperMart Access */}
              <Link
                href="/store"
                className="px-3 py-1.5 rounded-lg bg-[#1A4731]/40 border border-[#2DA44E]/25 hover:bg-[#1A4731]/70 hover:border-[#2DA44E]/50 text-[#2DA44E] text-xs font-semibold transition-all"
              >
                SuperMart
              </Link>

              {/* User Profile Pill */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#484F58] text-xs font-medium text-[#E6EDF3] transition-all"
              >
                <span className="w-5 h-5 rounded-full bg-[#238636] text-white font-bold flex items-center justify-center text-[9px]">
                  {user.firstName[0]}
                </span>
                <span className="text-[#7D8590]">{user.firstName}</span>
              </Link>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#DA3633]/10 border border-[#30363D] hover:border-[#DA3633]/40 text-xs font-medium text-[#7D8590] hover:text-[#DA3633] transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#484F58] text-xs font-semibold text-[#E6EDF3] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-xs text-white transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
