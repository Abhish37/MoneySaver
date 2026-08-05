import React from 'react'
import { SparkleIcon, CouponIcon, GiftCardIcon, BankIcon, CashbackIcon } from '../components/icons'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">

      {/* Professional status badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A4731]/40 border border-[#2DA44E]/25 text-[#2DA44E] text-xs font-semibold uppercase tracking-widest mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2DA44E] inline-block animate-pulse" />
        <span>Savings Intelligence Platform</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#E6EDF3] mb-5 leading-tight font-display">
        Never Pay Full Price Again.{' '}
        <br />
        <span className="text-[#2DA44E]">Stack Every Deal in One Click.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base text-[#7D8590] max-w-2xl mb-9 leading-relaxed">
        MoneySaver automatically layers store coupons, bank card instant discounts, affiliate cashbacks,
        and discounted gift vouchers into a transparent Net Payable Price Matrix.
      </p>

      {/* Savings Layer Badges */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-10">
        {[
          { icon: <CouponIcon size={13} />, label: 'Best Coupon',  color: 'text-[#E3B341] bg-[#C9A227]/10 border-[#C9A227]/30' },
          { icon: <GiftCardIcon size={13} />, label: 'Gift Cards', color: 'text-[#7D8590] bg-[#30363D]/40 border-[#484F58]/40' },
          { icon: <BankIcon size={13} />,    label: 'Bank Offers', color: 'text-[#388BFD] bg-[#388BFD]/08 border-[#388BFD]/25' },
          { icon: <CashbackIcon size={13} />, label: 'Cashback',   color: 'text-[#2DA44E] bg-[#1A4731]/40 border-[#2DA44E]/30' },
        ].map(({ icon, label, color }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
            {icon} {label}
          </span>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href="/dashboard"
          id="cta-get-started"
          className="px-7 py-3 rounded-lg bg-[#238636] hover:bg-[#2DA44E] text-white font-semibold shadow-[0_2px_12px_rgba(35,134,54,0.3)] hover:shadow-[0_4px_16px_rgba(35,134,54,0.4)] transition-all flex items-center gap-2 text-sm"
        >
          <SparkleIcon size={15} />
          <span>Calculate Savings Now</span>
          <span className="text-[#3FB950]">→</span>
        </a>
        <a
          href="/register"
          className="px-7 py-3 rounded-lg bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#484F58] text-[#E6EDF3] font-semibold transition-all text-sm"
        >
          Create Free Account
        </a>
      </div>

      {/* Trust line */}
      <p className="mt-8 text-xs text-[#484F58] tracking-wide">
        Trusted by smart shoppers across India · No card required
      </p>
    </main>
  )
}
