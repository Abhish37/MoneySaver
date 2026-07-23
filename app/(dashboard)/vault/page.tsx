'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import { getAuthSession, UserProfile } from '../../../lib/auth/session'
import { useRouter } from 'next/navigation'

interface VaultCoupon {
  id: string
  store: string
  code: string
  discountValue: number
  minCartValue: number
  originApp?: string
  expires: string
}

interface LinkedWallet {
  id: string
  name: string
  icon: string
  description: string
  linked: boolean
  couponsFound: number
}

const WALLET_SOURCES: LinkedWallet[] = [
  { id: 'gmail', name: 'Gmail Reward Emails', icon: '📧', description: 'Scan reward emails from GPay, Amazon Pay, Paytm', linked: false, couponsFound: 0 },
  { id: 'zomato', name: 'Zomato Coupons', icon: '🍔', description: 'Import active Zomato promo codes & vouchers', linked: false, couponsFound: 0 },
  { id: 'swiggy', name: 'Swiggy Coupons', icon: '🍕', description: 'Import Swiggy One offers & reward coupons', linked: false, couponsFound: 0 },
  { id: 'gpay', name: 'Google Pay Rewards', icon: '💳', description: 'Import scratch card rewards & vouchers', linked: false, couponsFound: 0 },
  { id: 'amazon', name: 'Amazon Pay Rewards', icon: '📦', description: 'Import Amazon Pay cashback & reward vouchers', linked: false, couponsFound: 0 },
  { id: 'phonepe', name: 'PhonePe Rewards', icon: '📱', description: 'Import PhonePe cashback & brand vouchers', linked: false, couponsFound: 0 },
  { id: 'paytm', name: 'Paytm Rewards', icon: '⚡', description: 'Import Paytm cashback vouchers & promo codes', linked: false, couponsFound: 0 },
  { id: 'magicpin', name: 'Magicpin Rewards', icon: '🛍️', description: 'Import Magicpin cashback & store vouchers', linked: false, couponsFound: 0 },
  { id: 'myntra', name: 'Myntra Vouchers', icon: '👗', description: 'Import Myntra Insider points & promo codes', linked: false, couponsFound: 0 },
  { id: 'bhim', name: 'BHIM UPI Rewards', icon: '🏦', description: 'Import BHIM UPI cashback rewards', linked: false, couponsFound: 0 },
]

export default function VaultPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'MY_COUPONS' | 'LINK_WALLET'>('MY_COUPONS')
  const [coupons, setCoupons] = useState<VaultCoupon[]>([])

  // Edit Modal
  const [editingCoupon, setEditingCoupon] = useState<VaultCoupon | null>(null)

  // Link Wallet State
  const [wallets, setWallets] = useState<LinkedWallet[]>(WALLET_SOURCES)
  const [linkingWallet, setLinkingWallet] = useState<string | null>(null)
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }

    // Load coupons
    try {
      const stored = localStorage.getItem('moneysaver_user_vault')
      if (stored) {
        const parsed: VaultCoupon[] = JSON.parse(stored)
        const todayStr = new Date().toISOString().split('T')[0]
        setCoupons(parsed.filter((c) => !c.expires || c.expires >= todayStr))
      }
    } catch (e) {}

    // Load linked wallet state
    try {
      const linkedState = localStorage.getItem('moneysaver_linked_wallets')
      if (linkedState) {
        const parsed = JSON.parse(linkedState)
        setWallets(WALLET_SOURCES.map((w) => ({ ...w, linked: parsed[w.id] || false, couponsFound: parsed[`${w.id}_count`] || 0 })))
      }
    } catch (e) {}
  }, [router])

  const handleDelete = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id)
    setCoupons(updated)
    try { localStorage.setItem('moneysaver_user_vault', JSON.stringify(updated)) } catch (e) {}
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return
    const updated = coupons.map((c) => (c.id === editingCoupon.id ? editingCoupon : c))
    setCoupons(updated)
    try { localStorage.setItem('moneysaver_user_vault', JSON.stringify(updated)) } catch (e) {}
    setEditingCoupon(null)
  }

  const handleLinkWallet = (walletId: string) => {
    setLinkingWallet(walletId)

    // Simulate permission grant & coupon discovery
    setTimeout(() => {
      const randomCoupons = Math.floor(Math.random() * 4) + 1

      // Generate discovered coupons
      const walletInfo = WALLET_SOURCES.find((w) => w.id === walletId)
      const newCoupons: VaultCoupon[] = Array.from({ length: randomCoupons }, (_, idx) => ({
        id: `${walletId}_${Date.now()}_${idx}`,
        store: walletInfo?.name.split(' ')[0] || 'Store',
        code: `${walletId.toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
        discountValue: [50, 100, 150, 200, 75][Math.floor(Math.random() * 5)],
        minCartValue: [199, 299, 499, 699, 999][Math.floor(Math.random() * 5)],
        originApp: walletInfo?.name || 'Linked Wallet',
        expires: '2026-12-31',
      }))

      const updatedCoupons = [...newCoupons, ...coupons]
      setCoupons(updatedCoupons)
      try { localStorage.setItem('moneysaver_user_vault', JSON.stringify(updatedCoupons)) } catch (e) {}

      // Update wallet linked state
      const updatedWallets = wallets.map((w) =>
        w.id === walletId ? { ...w, linked: true, couponsFound: randomCoupons } : w
      )
      setWallets(updatedWallets)

      // Persist
      try {
        const linkedState: Record<string, any> = {}
        updatedWallets.forEach((w) => { linkedState[w.id] = w.linked; linkedState[`${w.id}_count`] = w.couponsFound })
        localStorage.setItem('moneysaver_linked_wallets', JSON.stringify(linkedState))
      } catch (e) {}

      setLinkingWallet(null)
      setLinkSuccess(walletId)
      setTimeout(() => setLinkSuccess(null), 3000)
    }, 2000)
  }

  const handleUnlinkWallet = (walletId: string) => {
    const updatedWallets = wallets.map((w) =>
      w.id === walletId ? { ...w, linked: false, couponsFound: 0 } : w
    )
    setWallets(updatedWallets)

    // Remove coupons from this wallet
    const updatedCoupons = coupons.filter((c) => !c.id.startsWith(walletId))
    setCoupons(updatedCoupons)
    try {
      localStorage.setItem('moneysaver_user_vault', JSON.stringify(updatedCoupons))
      const linkedState: Record<string, any> = {}
      updatedWallets.forEach((w) => { linkedState[w.id] = w.linked; linkedState[`${w.id}_count`] = w.couponsFound })
      localStorage.setItem('moneysaver_linked_wallets', JSON.stringify(linkedState))
    } catch (e) {}
  }

  const linkedCount = wallets.filter((w) => w.linked).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Coupon Vault 🎟️</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload screenshots, link wallets, or add coupons manually. Vault coupons are always prioritized!
            </p>
          </div>
          <button onClick={() => setIsUploadOpen(true)} className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-lg shadow-emerald-950 flex items-center gap-2">
            <span>📷</span> Upload Screenshot
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('MY_COUPONS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'MY_COUPONS'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >🎟️ My Saved Coupons ({coupons.length})</button>
          <button
            onClick={() => setActiveTab('LINK_WALLET')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'LINK_WALLET'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >🔗 Link Wallet / Email ({linkedCount} Connected)</button>
        </div>

        {/* TAB 1: MY SAVED COUPONS */}
        {activeTab === 'MY_COUPONS' && (
          <div>
            {coupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="font-extrabold text-base text-slate-100">{coupon.store}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
                          {coupon.discountValue > 50 ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                        </span>
                      </div>
                      {coupon.originApp && (
                        <div className="mt-3 inline-block px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-amber-400 font-semibold">
                          📍 {coupon.originApp}
                        </div>
                      )}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                          <span className="text-xs text-slate-400 font-semibold">Promo Code</span>
                          <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">{coupon.code}</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>• Min Order: <strong className="text-slate-200">₹{coupon.minCartValue || 0}</strong></p>
                          {coupon.expires && <p>• Expires: <strong className="text-slate-200">{coupon.expires}</strong></p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                      <button onClick={() => setEditingCoupon(coupon)} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDelete(coupon.id)} className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/40 text-red-400 text-xs transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mx-auto">🎟️</div>
                <h3 className="text-xl font-bold text-slate-100">Your Coupon Vault is empty</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">Upload reward screenshots or link your wallets to auto-import coupons!</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setIsUploadOpen(true)} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg">📷 Upload Screenshot</button>
                  <button onClick={() => setActiveTab('LINK_WALLET')} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 shadow-lg">🔗 Link Wallets</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINK WALLET / EMAIL PERMISSION HUB */}
        {activeTab === 'LINK_WALLET' && (
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h3 className="text-sm font-bold text-slate-100">Privacy & Security Commitment</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never store your passwords. We only access the coupon/rewards section of each linked app with your explicit permission.
                You can unlink any wallet at any time. All data stays on your device.
              </p>
            </div>

            {/* Wallet Authorization Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all ${
                    wallet.linked
                      ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl mt-0.5">{wallet.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-100">{wallet.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{wallet.description}</p>

                        {wallet.linked && wallet.couponsFound > 0 && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold font-mono">
                            ✓ {wallet.couponsFound} coupons imported
                          </span>
                        )}

                        {linkSuccess === wallet.id && (
                          <div className="mt-2 text-xs text-emerald-400 font-semibold animate-fade-in">
                            🎉 Successfully linked! Coupons imported to your vault.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link / Unlink Toggle */}
                    <div>
                      {linkingWallet === wallet.id ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-300">
                          <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          Linking...
                        </div>
                      ) : wallet.linked ? (
                        <button
                          onClick={() => handleUnlinkWallet(wallet.id)}
                          className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-950 border border-red-500/40 text-red-400 text-xs font-bold transition-colors"
                        >
                          Unlink
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLinkWallet(wallet.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
                        >
                          Grant Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setEditingCoupon(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 text-lg font-bold">✕</button>
            <h3 className="text-base font-bold text-slate-100">✏️ Edit Coupon</h3>
            <form onSubmit={handleEditSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Store / Brand</label>
                <input type="text" value={editingCoupon.store} onChange={(e) => setEditingCoupon({ ...editingCoupon, store: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 mt-1" required />
              </div>
              <div>
                <label className="text-slate-400">Promo Code</label>
                <input type="text" value={editingCoupon.code} onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono font-bold text-amber-400 mt-1" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Discount (₹)</label>
                  <input type="number" value={editingCoupon.discountValue} onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 mt-1" required />
                </div>
                <div>
                  <label className="text-slate-400">Min Cart (₹)</label>
                  <input type="number" value={editingCoupon.minCartValue} onChange={(e) => setEditingCoupon({ ...editingCoupon, minCartValue: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 mt-1" required />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all text-xs">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
