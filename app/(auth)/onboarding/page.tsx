'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const POPULAR_CARDS = [
  { bankName: 'SBI Card', cardName: 'Cashback SBI Card', cardType: 'CREDIT', icon: '💳' },
  { bankName: 'HDFC Bank', cardName: 'Millennia Credit Card', cardType: 'CREDIT', icon: '💳' },
  { bankName: 'ICICI Bank', cardName: 'Amazon Pay ICICI Card', cardType: 'CREDIT', icon: '💳' },
]

const POPULAR_UPI = [
  { name: 'Google Pay (GPay)', category: 'UPI App', icon: '📱' },
  { name: 'PhonePe', category: 'UPI App', icon: '📱' },
  { name: 'Paytm UPI', category: 'UPI App', icon: '📱' },
  { name: 'Amazon Pay UPI', category: 'UPI App', icon: '🛒' },
  { name: 'Super.money UPI', category: 'Neo UPI', icon: '⚡' },
  { name: 'POP Club UPI', category: 'Rewards UPI', icon: '🍿' },
  { name: 'Navi UPI', category: 'Flat Cashback UPI', icon: '🚀' },
  { name: 'MobiKwik UPI', category: 'UPI Wallet', icon: '💼' },
  { name: 'BharatPe UPI', category: 'Merchant UPI', icon: '🇮🇳' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedCards, setSelectedCards] = useState<string[]>(['Cashback SBI Card'])
  const [selectedUpi, setSelectedUpi] = useState<string[]>(['Google Pay (GPay)', 'PhonePe', 'Navi UPI'])
  const [loading, setLoading] = useState(false)

  const toggleCard = (cardName: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardName) ? prev.filter((c) => c !== cardName) : [...prev, cardName]
    )
  }

  const toggleUpi = (upiName: string) => {
    setSelectedUpi((prev) =>
      prev.includes(upiName) ? prev.filter((u) => u !== upiName) : [...prev, upiName]
    )
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      const cardsToSave = POPULAR_CARDS.filter((c) => selectedCards.includes(c.cardName))
      await fetch('/api/v1/user/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToSave, upi: selectedUpi }),
      })
      setStep(2)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold">Welcome to MoneySaver</h1>
            <p className="text-sm text-slate-400">Step {step} of 2 — Quick Personalization</p>
          </div>
          <div className="flex gap-1.5">
            <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <span className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-lg font-semibold mb-1">Select your Bank Cards & UPI Apps</h2>
            <p className="text-sm text-slate-400 mb-6">
              We calculate your exact net price and recommend higher-saving cards or UPI apps if you can save more.
            </p>

            {/* Sub-section 1: Cards */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">💳 Bank Credit Cards</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {POPULAR_CARDS.map((card) => {
                  const isSelected = selectedCards.includes(card.cardName)
                  return (
                    <button
                      key={card.cardName}
                      onClick={() => toggleCard(card.cardName)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/50'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{card.icon}</span>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs truncate">{card.cardName}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sub-section 2: UPI Apps */}
            <div className="mb-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">📱 UPI & Payment Apps</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_UPI.map((upi) => {
                  const isSelected = selectedUpi.includes(upi.name)
                  return (
                    <button
                      key={upi.name}
                      onClick={() => toggleUpi(upi.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/50'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{upi.icon}</span>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs truncate">{upi.name}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Saving Preferences...' : 'Continue to Step 2 →'}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload your first reward card (Optional)</h2>
            <p className="text-sm text-slate-400 mb-6">
              Got an unused scratch card from Google Pay, PhonePe, or Paytm? Upload a screenshot to parse it with Vision AI.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-950/40 mb-8 cursor-pointer transition-all">
              <div className="text-3xl mb-2">📸</div>
              <div className="text-sm font-semibold text-slate-200">Drop reward screenshot here</div>
              <div className="text-xs text-slate-500 mt-1">Supports PNG, JPG up to 10MB</div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-all min-h-[44px]"
              >
                Skip for Now
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-900/30 min-h-[44px]"
              >
                Go to Dashboard 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
