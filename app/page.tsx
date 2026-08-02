import React from 'react'
import { SparkleIcon, CouponIcon, GiftCardIcon, BankIcon, CashbackIcon } from '../components/icons'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
        <SparkleIcon size={12} />
        <span>Savings Intelligence Engine</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-50 mb-5 leading-tight font-['Outfit',sans-serif]">
        Never Pay Full Price Again.{' '}
        <br />
        <span className="text-emerald-400">Stack Every Deal in 1-Click.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
        MoneySaver automatically layers store coupons, bank card instant discounts, affiliate cashbacks,
        and discounted gift vouchers into a transparent Net Payable Price Matrix.
      </p>

      {/* Savings Layer Badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {[
          { icon: <CouponIcon size={14} />, label: 'Best Coupon', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
          { icon: <GiftCardIcon size={14} />, label: 'Gift Cards', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
          { icon: <BankIcon size={14} />, label: 'Bank Offers', color: 'text-blue-400 bg-blue-950/40 border-blue-500/30' },
          { icon: <CashbackIcon size={14} />, label: 'Cashback', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
        ].map(({ icon, label, color }) => (
          <span key={label} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
            {icon} {label}
          </span>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="/dashboard"
          id="cta-get-started"
          className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 min-h-[44px] text-sm"
        >
          <SparkleIcon size={16} />
          <span>Calculate Savings Now</span>
          <span>→</span>
        </a>
      </div>
    </main>
  )
}
