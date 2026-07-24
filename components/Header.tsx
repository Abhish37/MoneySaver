'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { getAuthSession, logoutUser, UserProfile } from '../lib/auth/session'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    const activeUser = getAuthSession()
    setUser(activeUser)

    try {
      const existingReqs = localStorage.getItem('moneysaver_brand_requests')
      const reqList = existingReqs ? JSON.parse(existingReqs) : []
      setRequestCount(reqList.length)
    } catch (e) {}
  }, [pathname])

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    router.push('/')
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-mono font-extrabold text-xl tracking-wider group">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
            💰
          </span>
          <span className="text-emerald-400">Saver</span>
          <span className="text-amber-400">Stack</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`transition-colors ${pathname === '/dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Brand Discovery
              </Link>
              <Link
                href="/in-store"
                className={`transition-colors ${pathname === '/in-store' ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                In-Store
              </Link>
              <Link
                href="/vault"
                className={`transition-colors ${pathname === '/vault' ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Coupon Vault
              </Link>
              <Link
                href="/stacker"
                className={`transition-colors ${pathname === '/stacker' ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Savings Matrix
              </Link>
              <Link
                href="/cards"
                className={`transition-colors ${pathname === '/cards' ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Cards & UPI
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Developer Notification Ring Bell */}
              <div className="relative group cursor-pointer" title="Store Integration Requests">
                <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 block text-xs">
                  🔔
                </span>
                {requestCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px]">
                    {requestCount}
                  </span>
                )}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.firstName[0]}
                </span>
                <span>{user.firstName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-500/40 text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-md shadow-emerald-950"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
