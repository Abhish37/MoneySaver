'use client'

import React, { useState } from 'react'
import { SavingsStackOutput } from '../lib/engine/stacker'
import Link from 'next/link'

interface StackerCardProps {
  stack: SavingsStackOutput
  onCategoryChange?: (categoryName: string) => void
}

export default function StackerCard({ stack, onCategoryChange }: StackerCardProps) {
  const [upvotes, setUpvotes] = useState(142)
  const [downvotes, setDownvotes] = useState(2)
  const [voted, setVoted] = useState<'UP' | 'DOWN' | null>(null)
  const [showAsciToast, setShowAsciToast] = useState(false)
  const [tcModalData, setTcModalData] = useState<{ title: string; terms: string[] } | null>(null)

  const categories = [
    'Fashion & Apparel',
    'Beauty & Skincare',
    'Electronics & Laptops',
    'Mobiles & Accessories',
    'Recharges & Bill Payments',
  ]

  const handleUpvote = () => {
    if (voted === 'UP') return
    setUpvotes((prev) => prev + 1)
    if (voted === 'DOWN') setDownvotes((prev) => prev - 1)
    setVoted('UP')
  }

  const handleDownvote = () => {
    if (voted === 'DOWN') return
    setDownvotes((prev) => prev + 1)
    if (voted === 'UP') setUpvotes((prev) => prev - 1)
    setVoted('DOWN')
  }

  const handleShopNow = () => {
    setShowAsciToast(true)
    setTimeout(() => {
      window.open(`/r/${stack.storeSlug}`, '_blank')
      setShowAsciToast(false)
    }, 1200)
  }

  return (
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* ASCI Interstitial Toast */}
      {showAsciToast && (
        <div className="absolute inset-x-4 top-4 z-50 p-3.5 bg-slate-950 border border-emerald-500/50 rounded-2xl text-center shadow-2xl animate-fade-in">
          <p className="text-xs font-bold text-emerald-400">
            📢 Redirecting to {stack.storeSlug.toUpperCase()} via CashKaro/EarnKaro partner link...
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ASCI Disclosure: We may earn an affiliate commission at no extra cost to you.
          </p>
        </div>
      )}

      {/* Terms & Conditions Modal Overlay */}
      {tcModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setTcModalData(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-amber-400 text-xl">ℹ️</span>
              <h4 className="font-bold text-sm text-slate-100">{tcModalData.title} Terms & Conditions</h4>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {tcModalData.terms.map((term, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setTcModalData(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 rounded-xl transition-all"
            >
              Close T&C Details
            </button>
          </div>
        </div>
      )}

      {/* Header & Verification Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stack.storeSlug} REAL-TIME SAVINGS MATRIX
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
              ✓ Verified Live • Confidence: {(stack.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-50 mt-1">Mathematically Optimized Stacking Strategy</h3>
        </div>

        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all self-start sm:self-auto"
        >
          🚀 Share Strategy
        </button>
      </div>

      {/* Dynamic Product Category Cashback Selector */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <span>🏷️</span> Select Product Category for Accurate Tiered Cashback:
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">Active: {stack.selectedCategoryName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange && onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                stack.selectedCategoryName === cat
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Column Strategy Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1: MY VERIFIED STRATEGY (Strict Ownership Audit) */}
        <div className="bg-slate-950/90 border border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                1. {stack.userStack.title}
              </span>
              {stack.userStack.hasUserCards ? (
                <span className="text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  ✓ Cards Verified
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 bg-amber-950 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  ⚠️ No Cards Saved
                </span>
              )}
            </div>

            {/* Zero False Promise Card Ownership Prompt */}
            {!stack.userStack.hasUserCards && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-300 mb-3 space-y-1">
                <strong>Zero False Promises!</strong> You have no saved cards in your profile. Card discount is set to ₹0.
                <div className="pt-1">
                  <Link href="/cards" className="underline font-bold text-amber-200 hover:text-white">
                    + Add Your Cards in /cards to unlock instant bank offers ↗
                  </Link>
                </div>
              </div>
            )}

            {/* Strategy Reasoning Explainability Banner */}
            <p className="text-[11px] text-slate-300 mb-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              💡 <strong>Why Selected:</strong> {stack.userStack.explanation}
            </p>

            {/* Line Items Breakdown */}
            <div className="space-y-3">
              {stack.userStack.lineItems.map((item, idx) => (
                <div key={idx} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-100 flex items-center gap-1.5">
                      {item.layer === 'VAULT_COUPON' && '🔥'}
                      {item.name}
                    </span>
                    <span className="font-mono text-emerald-400 font-extrabold">- ₹{item.amountSaved.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.description}</p>

                  {/* Stackability Rules */}
                  {item.stackability && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span className={item.stackability.giftCard ? 'text-emerald-400' : 'text-slate-500'}>
                        🎁 Gift Card: {item.stackability.giftCard ? 'YES' : 'NO'}
                      </span>
                      <span>•</span>
                      <span className={item.stackability.bankOffer ? 'text-emerald-400' : 'text-slate-500'}>
                        💳 Bank Offer: {item.stackability.bankOffer ? 'YES' : 'NO'}
                      </span>
                      <span>•</span>
                      <span className={item.stackability.cashback ? 'text-emerald-400' : 'text-slate-500'}>
                        💰 Cashback: {item.stackability.cashback ? 'YES' : 'NO'}
                      </span>
                    </div>
                  )}

                  {/* Coupon Code Upvote & Verification */}
                  {item.code && (
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold">
                        {item.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={handleUpvote} className="text-slate-400 hover:text-emerald-400">
                          Works 👍 {upvotes}
                        </button>
                        <button onClick={handleDownvote} className="text-slate-400 hover:text-red-400">
                          Expired 👎 {downvotes}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 mb-3">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">YOUR OPTIMIZED NET PAYABLE</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                ₹{stack.userStack.netPayable.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-300 font-bold mt-1">
                You Save ₹{stack.userStack.totalSaved} ({stack.userStack.savingsPercent}% OFF)
              </div>
            </div>

            <button
              onClick={handleShopNow}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition-all shadow-lg shadow-emerald-950 mb-2 min-h-[44px]"
            >
              Shop with My Verified Strategy ↗
            </button>

            <button
              onClick={() => setTcModalData({ title: stack.userStack.title, terms: stack.userStack.termsAndConditions })}
              className="w-full text-center text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 py-1 transition-colors"
            >
              <span>ℹ️</span> <u>View Terms & Conditions (T&C)</u>
            </button>
          </div>
        </div>

        {/* COLUMN 2: MAXIMUM MARKET POTENTIAL STRATEGY */}
        <div className="bg-slate-950/90 border border-amber-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                2. {stack.maxMarketStack.title}
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-950 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                Max Market Offer
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              💡 <strong>Why Selected:</strong> {stack.maxMarketStack.explanation}
            </p>

            <div className="space-y-3">
              {stack.maxMarketStack.lineItems.map((item, idx) => (
                <div key={idx} className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-100">{item.name}</span>
                    <span className="font-mono text-amber-400 font-extrabold">- ₹{item.amountSaved.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.description}</p>

                  {item.stackability && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span className={item.stackability.giftCard ? 'text-amber-400' : 'text-slate-500'}>
                        🎁 Gift Card: {item.stackability.giftCard ? 'YES' : 'NO'}
                      </span>
                      <span>•</span>
                      <span className={item.stackability.bankOffer ? 'text-amber-400' : 'text-slate-500'}>
                        💳 Bank Offer: {item.stackability.bankOffer ? 'YES' : 'NO'}
                      </span>
                      <span>•</span>
                      <span className={item.stackability.cashback ? 'text-amber-400' : 'text-slate-500'}>
                        💰 Cashback: {item.stackability.cashback ? 'YES' : 'NO'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-2xl p-4 mb-3">
              <div className="text-[11px] text-amber-400 uppercase font-semibold">MAX MARKET NET PAYABLE</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
                ₹{stack.maxMarketStack.netPayable.toFixed(2)}
              </div>
              <div className="text-xs text-amber-300 font-bold mt-1">
                Max Savings ₹{stack.maxMarketStack.totalSaved} ({stack.maxMarketStack.savingsPercent}% OFF)
              </div>
            </div>

            <button
              onClick={handleShopNow}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs transition-all shadow-lg shadow-amber-950 mb-2 min-h-[44px]"
            >
              Shop with Max Market Offer ↗
            </button>

            <button
              onClick={() => setTcModalData({ title: stack.maxMarketStack.title, terms: stack.maxMarketStack.termsAndConditions })}
              className="w-full text-center text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 py-1 transition-colors"
            >
              <span>ℹ️</span> <u>View Terms & Conditions (T&C)</u>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
