import React from 'react'
import { SparkleIcon, CouponIcon, GiftCardIcon, BankIcon, CashbackIcon } from '../components/icons'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">

      {/* Professional status badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A4731]/40 border border-[#2DA44E]/25 text-[#2DA44E] text-xs font-semibold uppercase tracking-widest mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2DA44E] inline-block animate-pulse" />
        <span>Over ₹10,000+ calculated in user savings</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#B7BCC8] mb-5 leading-tight font-display">
        Never Pay Full Price Again.{' '}
        <br />
        <span className="text-[#2DA44E]">Stack Every Deal in One Click.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base text-[#8E95A3] w-full max-w-[90vw] md:max-w-2xl mb-9 leading-relaxed">
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

      {/* CTA Buttons & Trust Line */}
      <div className="flex flex-col items-center w-full max-w-sm sm:max-w-none mx-auto">
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col items-center w-full sm:w-auto">
            <a
              href="/dashboard"
              id="cta-get-started"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#238636] hover:bg-[#2DA44E] text-white font-semibold shadow-[0_2px_12px_rgba(35,134,54,0.3)] hover:shadow-[0_4px_16px_rgba(35,134,54,0.4)] transition-all flex items-center justify-center gap-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DA44E]"
            >
              <SparkleIcon size={18} />
              <span>Calculate My Savings Stack</span>
            </a>
            {/* Micro-copy beneath Primary CTA */}
            <p className="mt-2 text-sm text-[#8E95A3] sm:hidden">Instant calculation • No credit card required</p>
          </div>
          <a
            href="/register"
            className="w-full sm:w-auto px-7 py-2.5 sm:py-3 rounded-xl bg-transparent hover:bg-[#161B22] border border-[#30363D] hover:border-[#484F58] text-[#B7BCC8] font-semibold transition-all flex items-center justify-center text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DA44E]"
          >
            Create Account
          </a>
        </div>
        
        {/* Micro-copy for Desktop */}
        <p className="hidden sm:block mt-3 text-sm text-[#8E95A3]">Instant calculation • No credit card required</p>

        {/* Trust line exactly 24px below secondary button container */}
        <p className="mt-[24px] text-xs text-[#8E95A3] tracking-wide">
          Trusted by smart shoppers across India
        </p>
      </div>
    </main>
  )
}
