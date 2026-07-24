'use client'

import React, { useEffect, useState } from 'react'

interface Coupon {
  code: string
  discount: string
  terms: string
  type: string
  verified: boolean
}

interface CouponSlideOutProps {
  isOpen: boolean
  onClose: () => void
  retailerName: string
  productTitle?: string
}

export default function CouponSlideOut({ isOpen, onClose, retailerName, productTitle }: CouponSlideOutProps) {
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setError(null)
    
    // Smooth reset
    setTimeout(() => {
      if (isMounted) setCoupons([])
    }, 200)

    const fetchCoupons = async () => {
      try {
        const url = new URL('/api/v1/coupons/live', window.location.origin)
        url.searchParams.set('retailer', retailerName)
        if (productTitle) url.searchParams.set('product', productTitle)

        const res = await fetch(url.toString())
        if (!res.ok) throw new Error('Failed to fetch coupons')
        
        const data = await res.json()
        if (isMounted) {
          if (data.success && data.coupons) {
            setCoupons(data.coupons)
          } else {
            setError(data.error || 'No coupons found at this time.')
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unable to load live coupons.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCoupons()

    return () => {
      isMounted = false
    }
  }, [isOpen, retailerName, productTitle])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide Out Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏷️</span> Live Coupons
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Scraping deals for {retailerName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 animate-pulse">
              <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Booting scraper & finding codes...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <p className="text-xs text-slate-500 mt-2">Ensure the Playwright microservice is running.</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3 opacity-50">🕵️</span>
              <h3 className="text-slate-300 font-bold">No active codes found</h3>
              <p className="text-sm text-slate-500 mt-1">We couldn't find any verified promo codes for {retailerName} right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 group hover:border-emerald-500/30 transition-colors">
                  {/* Left accent strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500/80" />
                  
                  <div className="p-5 pl-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-emerald-400">{coupon.discount}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-400">
                          {coupon.type.replace('-', ' ')}
                        </span>
                      </div>
                      {coupon.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {coupon.terms}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-2.5 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/5 flex items-center justify-center font-mono font-bold text-slate-200 tracking-wider">
                        {coupon.code}
                      </div>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`h-full px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                          copiedCode === coupon.code 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
