'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'

const BANK_CARDS = [
  { bankName: 'SBI Card', cardName: 'Cashback SBI Card', cardType: 'CREDIT', icon: '💳' },
  { bankName: 'HDFC Bank', cardName: 'Millennia Credit Card', cardType: 'CREDIT', icon: '💳' },
  { bankName: 'ICICI Bank', cardName: 'Amazon Pay ICICI Card', cardType: 'CREDIT', icon: '💳' },
  { bankName: 'Axis Bank', cardName: 'ACE Credit Card', cardType: 'CREDIT', icon: '💳' },
]

const UPI_APPS = [
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

export default function CardsPage() {
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectedUpi, setSelectedUpi] = useState<string[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load saved preferences from localStorage on page mount
  useEffect(() => {
    try {
      const savedCards = localStorage.getItem('moneysaver_user_cards')
      const savedUpi = localStorage.getItem('moneysaver_user_upi')
      if (savedCards) {
        setSelectedCards(JSON.parse(savedCards))
      } else {
        setSelectedCards(['Cashback SBI Card', 'Millennia Credit Card'])
      }
      if (savedUpi) {
        setSelectedUpi(JSON.parse(savedUpi))
      } else {
        setSelectedUpi(['Google Pay (GPay)', 'PhonePe', 'Navi UPI'])
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

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
    setSaving(true)
    try {
      // 1. Save to browser localStorage so calculation views use these exact selections
      localStorage.setItem('moneysaver_user_cards', JSON.stringify(selectedCards))
      localStorage.setItem('moneysaver_user_upi', JSON.stringify(selectedUpi))

      // 2. Sync to API endpoint
      const cardsToSave = BANK_CARDS.filter((c) => selectedCards.includes(c.cardName))
      await fetch('/api/v1/user/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToSave, upi: selectedUpi }),
      })

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Payment Methods & UPI Apps</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select what you hold. Save them to automatically customize net price calculations & comparisons across all stores.
            </p>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>{saving ? 'Saving...' : '💾 Save Payment Preferences'}</span>
          </button>
        </div>

        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-4 mb-8 text-center text-emerald-400 font-bold text-sm shadow-xl animate-fade-in">
            🎉 Payment preferences saved successfully! All store comparisons now use your selected cards & UPI apps.
          </div>
        )}

        {/* Section 1: Bank Credit & Debit Cards */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span>💳</span> Bank Credit & Debit Cards
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">{selectedCards.length} Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BANK_CARDS.map((card) => {
              const isSelected = selectedCards.includes(card.cardName)
              return (
                <button
                  key={card.cardName}
                  onClick={() => toggleCard(card.cardName)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/50'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">{card.cardName}</div>
                    <div className="text-xs text-slate-500">{card.bankName}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Section 2: UPI & Payment Apps */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span>📱</span> UPI & Payment Apps
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">{selectedUpi.length} Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UPI_APPS.map((upi) => {
              const isSelected = selectedUpi.includes(upi.name)
              return (
                <button
                  key={upi.name}
                  onClick={() => toggleUpi(upi.name)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/50'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{upi.icon}</span>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">{upi.name}</div>
                    <div className="text-xs text-slate-500">{upi.category}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </main>

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
