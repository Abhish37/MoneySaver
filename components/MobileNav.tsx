'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from './CartProvider'

interface MobileNavProps {
  onOpenUpload: () => void
}

export default function MobileNav({ onOpenUpload }: MobileNavProps) {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: '🏠' },
    { label: 'Store', href: '/store', icon: '🏪' },
    { label: 'Cart', href: '/cart', icon: '🛒' },
    { label: 'Vault', href: '/vault', icon: '🎟️' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 border-t border-slate-800 backdrop-blur-lg px-4 py-2">
      <div className="flex items-center justify-around relative">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center Floating Action Button (FAB) */}
        <button
          onClick={onOpenUpload}
          className="relative -top-5 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-600/40 border-2 border-slate-950 active:scale-95 transition-all"
          aria-label="Upload Coupon Screenshot"
        >
          +
        </button>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg relative">
                {item.icon}
                {item.href === '/cart' && itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.5 rounded-full bg-emerald-500 text-white font-bold font-mono text-[9px] min-w-[16px] text-center">
                    {itemCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
