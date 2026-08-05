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
      className="group relative bg-[#161B22] border border-[#30363D] hover:border-[#484F58] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Logo + Savings Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="w-11 h-11 rounded-lg bg-[#1C2128] border border-[#30363D] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            {store.logo}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#1A4731]/50 border border-[#2DA44E]/30 text-[11px] font-semibold text-[#2DA44E]">
            Save {store.minimumSaving}–{store.maximumSaving}%
          </span>
        </div>

        {/* Brand Name & Category */}
        <h3 className="text-sm font-semibold text-[#E6EDF3] group-hover:text-[#2DA44E] transition-colors font-display tracking-tight flex items-center gap-1">
          {store.name}
          <span className="text-[#484F58] font-normal text-xs">↗</span>
        </h3>

        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]/80 mt-0.5">
          {store.category}
        </span>

        <p className="text-xs text-[#7D8590] mt-2 line-clamp-2 leading-relaxed">
          {store.description}
        </p>
      </div>

      {/* Footer Feature Badges */}
      <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-[#7D8590] font-mono">
          <CouponIcon size={11} className="text-[#C9A227]" />
          <strong className="text-[#E3B341]">{store.supportedCoupons}</strong> Coupons
        </span>
        <span className="px-2 py-0.5 rounded bg-[#1C2128] border border-[#30363D] text-[10px] text-[#7D8590] font-mono flex items-center gap-1">
          <GiftCardIcon size={10} className="text-[#7D8590]" />
          {store.giftCardDiscountPct}% Voucher
        </span>
      </div>
    </Link>
  )
}
