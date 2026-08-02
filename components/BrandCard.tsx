'use client'

import React from 'react'
import Link from 'next/link'
import { Store } from '../lib/data/stores'
import { CouponIcon, GiftCardIcon } from './icons'

interface BrandCardProps {
  store: Store
}

export default function BrandCard({ store }: BrandCardProps) {
  return (
    <Link
      href={`/deals/${store.slug}`}
      className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
    >
      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {store.logo}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold font-mono text-emerald-400 shadow-sm">
            Save {store.minimumSaving}–{store.maximumSaving}%
          </span>
        </div>

        {/* Brand Name & Category */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors font-['Outfit',sans-serif] tracking-tight flex items-center gap-1.5">
          {store.name}
          <span className="text-xs text-slate-500 font-normal">↗</span>
        </h3>

        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 mt-0.5">
          {store.category}
        </span>

        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {store.description}
        </p>
      </div>

      {/* Footer Feature Badges */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <CouponIcon size={12} className="text-amber-400" />
          <strong className="text-amber-400">{store.supportedCoupons}</strong> Coupons
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1">
          <GiftCardIcon size={11} className="text-purple-400" />
          {store.giftCardDiscountPct}% Voucher
        </span>
      </div>
    </Link>
  )
}
