'use client'

import React, { useState } from 'react'

interface BlinkitProduct {
  title?: string
  image_url?: string
  price?: number
  mrp?: number
  unit?: string
  brand?: string
  [key: string]: any
}

export default function InStorePage() {
  const [productId, setProductId] = useState('490670')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productData, setProductData] = useState<BlinkitProduct | null>(null)

  const fetchProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!productId.trim()) {
      setError('Please enter a valid Product ID')
      return
    }

    setLoading(true)
    setError(null)
    setProductData(null)

    try {
      // The user's Python scraper service runs on localhost:8000
      const response = await fetch('http://127.0.0.1:8000/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin: productId.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch from scraper (Status: ${response.status})`)
      }

      const data = await response.json()
      
      // Handle the case where the scraper returns an error inside the JSON payload
      if (data.error) {
        throw new Error(data.error)
      }

      setProductData(data)
    } catch (err: any) {
      console.error('In-Store Fetch Error:', err)
      setError(err.message || 'Failed to connect to the local scraper service. Is it running on http://127.0.0.1:8000?')
    } finally {
      setLoading(false)
    }
  }

  // Calculate discount percentage safely
  const discountPercentage = 
    productData?.mrp && productData?.price && productData.mrp > productData.price
      ? Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)
      : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          In-Store Scanner
        </h1>
        <p className="text-sm text-slate-400 font-medium max-w-2xl">
          Fetch real-time product details directly from Blinkit using our local scraping engine. Enter a Product ID below.
        </p>
      </div>

      {/* Search Input Section */}
      <form onSubmit={fetchProduct} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
            🏪
          </div>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. 490670"
            className="w-full h-14 pl-12 pr-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-lg shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <span>Fetch Product</span>
              <span className="text-xl">⚡</span>
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold">Error fetching product</p>
            <p className="opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Product Card Result */}
      {productData && !loading && (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm shadow-xl animate-fade-in relative overflow-hidden group">
          {/* Subtle glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Product Image */}
            <div className="w-full md:w-48 h-48 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 p-4">
              {productData.image_url ? (
                <img 
                  src={productData.image_url} 
                  alt={productData.title || 'Product Image'} 
                  className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <span className="text-4xl">🛍️</span>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-4">
              {/* Badges / Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                  Blinkit Verified
                </span>
                {productData.brand && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                    {productData.brand}
                  </span>
                )}
                {productData.unit && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
                    {productData.unit}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                {productData.title || 'Unknown Product Name'}
              </h2>

              {/* Pricing Section */}
              <div className="flex items-end gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 inline-flex">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Item Price</p>
                  <div className="flex items-baseline gap-1 text-emerald-400">
                    <span className="text-xl">₹</span>
                    <span className="text-4xl font-extrabold tracking-tight">
                      {productData.price?.toLocaleString('en-IN') || '---'}
                    </span>
                  </div>
                </div>
                
                {productData.mrp && productData.mrp > (productData.price || 0) && (
                  <div className="mb-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">MRP</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-slate-500 font-bold line-through decoration-slate-500/50">
                        ₹{productData.mrp.toLocaleString('en-IN')}
                      </span>
                      {discountPercentage > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                          {discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw JSON viewer for debug/metadata */}
              <details className="mt-4 group/details">
                <summary className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none font-medium transition-colors">
                  View Raw Data Payload
                </summary>
                <div className="mt-2 p-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-x-auto max-w-[calc(100vw-3rem)]">
                  <pre className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    {JSON.stringify(productData, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
