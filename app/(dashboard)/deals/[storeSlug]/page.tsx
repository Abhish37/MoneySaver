'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../../components/Header'
import MobileNav from '../../../../components/MobileNav'
import OCRUploadModal from '../../../../components/OCRUploadModal'
import StackerCard from '../../../../components/StackerCard'
import { EXPANDED_STORES, Store } from '../../../../lib/data/stores'
import { calculate3StrategySavingsStack, VaultCouponInput } from '../../../../lib/engine/stacker'
import { getAuthSession, UserProfile } from '../../../../lib/auth/session'
import { useRouter, useParams } from 'next/navigation'

export default function BrandDetailPage() {
  const router = useRouter()
  const params = useParams()
  const storeSlug = params?.storeSlug as string

  const [user, setUser] = useState<UserProfile | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [cartInput, setCartInput] = useState<string>('1500')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Fashion & Apparel')
  const [userCardNames, setUserCardNames] = useState<string[]>([])
  const [userUpiApps, setUserUpiApps] = useState<string[]>([])
  const [userVaultCoupons, setUserVaultCoupons] = useState<VaultCouponInput[]>([])
  const [showMatrix, setShowMatrix] = useState<boolean>(true) // Show matrix by default on brand page!
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }

    if (storeSlug) {
      const found = EXPANDED_STORES.find((s) => s.slug === storeSlug.toLowerCase())
      if (found) {
        setStore(found)
        if (found.category === 'Beauty & Skincare') setSelectedCategoryName('Beauty & Skincare')
        else if (found.category === 'Electronics') setSelectedCategoryName('Electronics & Laptops')
      } else {
        setStore(EXPANDED_STORES[0]) // Default to Myntra
      }
    }

    // Load User Saved Cards & Payment Preferences
    try {
      const savedCards = localStorage.getItem('moneysaver_user_cards')
      if (savedCards) setUserCardNames(JSON.parse(savedCards))

      const savedUpi = localStorage.getItem('moneysaver_user_upi')
      if (savedUpi) setUserUpiApps(JSON.parse(savedUpi))

      const existingVault = localStorage.getItem('moneysaver_user_vault')
      if (existingVault) setUserVaultCoupons(JSON.parse(existingVault))
    } catch (e) {}
  }, [router, storeSlug])

  if (!user || !store) return null

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    if (Number(cartInput) > 0) {
      setShowMatrix(true)
    }
  }

  // Calculate Real-Time Savings Intelligence Matrix with Card Ownership & Category Cashback
  const calculatedStack = calculate3StrategySavingsStack({
    basePrice: Number(cartInput) || 1500,
    storeSlug: store.slug,
    selectedCategoryName,
    storeCouponPct: store.minimumSaving,
    storeCouponMinCart: 999,
    bankOfferPct: store.bankOfferPct,
    bankMinCart: 1000,
    cashbackPct: store.cashbackPct,
    giftCardDiscountPct: store.giftCardDiscountPct,
    userCardNames,
    userUpiApps,
    userVaultCoupons,
  })

  const stackOutput = {
    ...calculatedStack,
    storeSlug: store.slug,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back to Brand Discovery Catalog
        </button>

        {/* Brand Banner Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
              {store.logo}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{store.name}</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-bold font-mono text-emerald-400">
                  Save {store.minimumSaving}–{store.maximumSaving}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">{store.description}</p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  🎟️ {store.supportedCoupons} Verified Coupons
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  🎫 {store.giftCardDiscountPct}% Off Gift Card
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  💳 {store.bankOfferPct}% Instant Bank Offer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Amount Input & Strategy Generator Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🛒</span> Enter Your Cart Total to Recalculate Savings Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Enter your planned checkout cart value to evaluate your personal vault coupons, merchant promos & saved card offers for {store.name}.
          </p>

          <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:flex-1">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={cartInput}
                onChange={(e) => {
                  setCartInput(e.target.value)
                  setShowMatrix(true)
                }}
                placeholder="1500"
                min="100"
                max="1000000"
                className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-lg shadow-emerald-950 whitespace-nowrap min-h-[46px]"
            >
              Recalculate Savings Matrix 🚀
            </button>
          </form>
        </div>

        {/* Embedded Savings Matrix Component */}
        {showMatrix && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                Embedded Real-Time Strategy Matrix for ₹{cartInput} Order
              </h3>
              <span className="text-xs font-mono text-emerald-400">✓ Evaluated User Vault & Saved Cards</span>
            </div>

            <StackerCard
              stack={stackOutput}
              onCategoryChange={(catName) => setSelectedCategoryName(catName)}
            />
          </div>
        )}
      </main>

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
