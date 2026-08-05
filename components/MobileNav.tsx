'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CouponIcon, BankIcon, CameraIcon } from './icons'

function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-current" aria-hidden="true">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

interface MobileNavProps {
  onOpenUpload: () => void
}

export default function MobileNav({ onOpenUpload }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home',  href: '/dashboard', icon: <HomeIcon size={20} /> },
    { label: 'Vault', href: '/vault',     icon: <CouponIcon size={20} /> },
    { label: 'Cards', href: '/cards',     icon: <BankIcon size={20} /> },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0E1117]/95 border-t border-[#30363D] backdrop-blur-md px-4 py-2">
      <div className="flex items-center justify-around relative">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-[#2DA44E]' : 'text-[#484F58] hover:text-[#7D8590]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center FAB — Scan Coupon */}
        <button
          onClick={onOpenUpload}
          className="relative -top-5 w-12 h-12 rounded-full bg-[#238636] hover:bg-[#2DA44E] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(35,134,54,0.35)] border-2 border-[#0E1117] active:scale-95 transition-all"
          aria-label="Upload Coupon Screenshot"
          title="Scan Coupon with Gemini AI"
        >
          <CameraIcon size={22} />
        </button>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-[#2DA44E]' : 'text-[#484F58] hover:text-[#7D8590]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
