'use client'

import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import { useRequireAuth } from '../../../lib/hooks/useRequireAuth'
import { getStorage, setStorage } from '../../../lib/utils/storage'

interface VaultCoupon {
  id: string
  store: string
  code: string
  discount?: string
  discountValue: number
  minCartValue: number
  originApp?: string
  source?: string
  expires: string
  createdAt?: string
  termsAndConditions?: string[]
}





export default function VaultPage() {
  const { user } = useRequireAuth()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'MY_COUPONS' | 'LINK_WALLET'>('MY_COUPONS')
  const [coupons, setCoupons] = useState<VaultCoupon[]>([])

  // Detail view, edit, delete confirm
  const [viewingCoupon, setViewingCoupon] = useState<VaultCoupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<VaultCoupon | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  
  const loadCoupons = () => {
    const rawCoupons = getStorage<VaultCoupon[]>('moneysaver_user_vault', [])
    const todayStr = new Date().toISOString().split('T')[0]
    setCoupons(rawCoupons.filter((c) => !c.expires || c.expires >= todayStr))
  }

  useEffect(() => {
    // Load coupons on mount
    loadCoupons()

    

    // Re-load coupons whenever the OCR modal (or any other source) saves a new one
    window.addEventListener('vaultUpdated', loadCoupons)
    return () => window.removeEventListener('vaultUpdated', loadCoupons)
  }, [])


  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirmed = () => {
    if (!deleteConfirmId) return
    const updated = coupons.filter((c) => c.id !== deleteConfirmId)
    setCoupons(updated)
    setStorage('moneysaver_user_vault', updated)
    setDeleteConfirmId(null)
    if (viewingCoupon?.id === deleteConfirmId) setViewingCoupon(null)
    window.dispatchEvent(new Event('vaultUpdated'))
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCoupon) return
    const updated = coupons.map((c) => (c.id === editingCoupon.id ? editingCoupon : c))
    setCoupons(updated)
    setStorage('moneysaver_user_vault', updated)
    setEditingCoupon(null)
    window.dispatchEvent(new Event('vaultUpdated'))
  }

  

  

  const linkedCount = 0

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
                  <div
                    key={coupon.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between space-y-4 hover:border-emerald-500/50 hover:shadow-emerald-950/30 transition-all cursor-pointer group"
                    onClick={() => setViewingCoupon(coupon)}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="font-extrabold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">{coupon.store}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
                          {coupon.discount || (coupon.discountValue > 50 ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`)}
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
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setEditingCoupon(coupon)} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDelete(coupon.id)} className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/40 text-red-400 text-xs transition-colors">🗑️</button>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded-md">Click to view</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mx-auto">🚧</div>
            <h3 className="text-xl font-bold text-slate-100">This feature is coming soon</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Automated wallet linking is currently under development. Stay tuned for updates!</p>
          </div>
        )}
      </main>

      {/* ── Coupon Detail Modal ── */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setViewingCoupon(null)}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">{viewingCoupon.store}</h3>
                {viewingCoupon.originApp && (
                  <span className="text-[11px] text-amber-400 font-semibold">📍 {viewingCoupon.originApp}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm">
                  {viewingCoupon.discount || (viewingCoupon.discountValue > 50 ? `₹${viewingCoupon.discountValue} OFF` : `${viewingCoupon.discountValue}% OFF`)}
                </span>
                <button onClick={() => setViewingCoupon(null)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-sm font-bold transition-colors">✕</button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Promo code with copy */}
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div>
                  <p className="text-[11px] text-slate-500 mb-0.5">PROMO CODE</p>
                  <p className="font-mono font-extrabold text-amber-400 text-xl tracking-widest">{viewingCoupon.code || '—'}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(viewingCoupon.code || ''); }}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-colors"
                >📋 Copy</button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-0.5">MIN ORDER</p>
                  <p className="text-sm font-bold text-slate-200">₹{viewingCoupon.minCartValue || 0}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-0.5">VALID TILL</p>
                  <p className="text-sm font-bold text-slate-200">{viewingCoupon.expires || '—'}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-0.5">SOURCE</p>
                  <p className="text-sm font-bold text-slate-200">{viewingCoupon.source === 'GEMINI_VISION' ? '📷 Scanned' : viewingCoupon.source === 'USER_MANUAL' ? '✏️ Manual' : '—'}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-0.5">ADDED ON</p>
                  <p className="text-sm font-bold text-slate-200">{viewingCoupon.createdAt ? new Date(viewingCoupon.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                </div>
              </div>

              {/* Terms & Conditions */}
              {viewingCoupon.termsAndConditions && viewingCoupon.termsAndConditions.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border border-slate-600 text-slate-400 flex items-center justify-center text-[10px] font-bold">i</span>
                    Terms &amp; Conditions
                  </p>
                  <ul className="space-y-1.5">
                    {viewingCoupon.termsAndConditions.map((t, i) => (
                      <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                        <span className="text-slate-600 mt-0.5">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => { setViewingCoupon(null); setEditingCoupon(viewingCoupon) }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >✏️ Edit</button>
              <button
                onClick={() => handleDelete(viewingCoupon.id)}
                className="py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-950 border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold text-xs transition-colors"
              >🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-2xl mx-auto">🗑️</div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100">Delete this coupon?</h3>
              <p className="text-xs text-slate-400 mt-1">This action cannot be undone. The coupon will be permanently removed from your vault.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors"
              >No, Keep It</button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-950"
              >Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Coupon Modal ── */}
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
