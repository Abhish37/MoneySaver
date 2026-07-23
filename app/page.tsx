import React from 'react'

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/30 border border-red-900/40 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-6">
        <span>⚡ Utility-First Savings Engine</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4 leading-tight">
        Never Pay Full Price Again. <br />
        <span className="text-emerald-600 dark:text-emerald-400 font-mono">Stack Every Deal in 1-Click.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8">
        MoneySaver automatically layers store coupons, bank card instant discounts, affiliate cashbacks, and discounted gift vouchers into a transparent Net Payable Price Matrix.
      </p>

      {/* CTA Button */}
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="/dashboard"
          className="px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 min-h-[44px]"
        >
          <span>Calculate Savings Now</span>
          <span>→</span>
        </a>
      </div>
    </main>
  )
}
