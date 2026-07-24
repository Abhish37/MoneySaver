'use client'

import React, { useState, useEffect } from 'react'

interface LocationState {
  lat: number | null
  lng: number | null
  pincode: string
  city: string
  isSet: boolean
}

interface BlinkitProduct {
  title?: string
  image_url?: string
  price?: number
  mrp?: number
  unit?: string
  brand?: string
  eta?: string
  in_stock?: boolean
  [key: string]: any
}

const CATEGORIES = [
  'Fresh Fruits & Veggies 🍎',
  'Dairy & Breakfast 🥛',
  'Snacks & Munchies 🍿',
  'Instant Food 🍜',
  'Cold Drinks & Juices 🥤'
]

export default function InStorePage() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    pincode: '',
    city: '',
    isSet: false
  })
  
  const [locInput, setLocInput] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const [productId, setProductId] = useState('490670')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productData, setProductData] = useState<BlinkitProduct | null>(null)

  const requestGeolocation = () => {
    setLocLoading(true)
    setLocError(null)

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.")
      setLocLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          pincode: 'Current Location',
          city: 'Auto-detected',
          isSet: true
        })
        setLocLoading(false)
      },
      (err) => {
        setLocError("Location access denied or failed. Please enter manually.")
        setLocLoading(false)
      }
    )
  }

  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!locInput.trim()) return
    setLocation({
      lat: null, // We don't have lat/lng for manual pincode without a geocoding API
      lng: null,
      pincode: locInput.trim(),
      city: 'Custom',
      isSet: true
    })
  }

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
      const response = await fetch('http://127.0.0.1:8000/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          asin: productId.trim(),
          pincode: location.pincode,
          lat: location.lat,
          lng: location.lng
        }),
      })

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setProductData(data)
    } catch (err: any) {
      console.error('In-Store Fetch Error:', err)
      setError('Local Scraper Service Offline — Run `uvicorn main:app --host 0.0.0.0 --port 8000 --reload` to fetch live Blinkit prices.')
    } finally {
      setLoading(false)
    }
  }

  const discountPercentage = 
    productData?.mrp && productData?.price && productData.mrp > productData.price
      ? Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)
      : 0

  // 1. Location Initialization State
  if (!location.isSet) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white border border-green-200 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fade-in relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 z-0" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
            📍
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Set Delivery Location</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
            We need your location to fetch hyper-local real-time inventory and pricing.
          </p>

          <button
            onClick={requestGeolocation}
            disabled={locLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/30 active:scale-95 text-lg flex items-center justify-center gap-2 mb-6"
          >
            {locLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>🧭</span>
                Use Current Location
              </>
            )}
          </button>

          <div className="flex items-center gap-4 text-slate-400 text-sm font-semibold mb-6 uppercase tracking-wider">
            <div className="h-px bg-slate-200 flex-1" />
            <span>OR</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <form onSubmit={handleManualLocation} className="relative">
            <input
              type="text"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              placeholder="Enter Pincode (e.g. 400001)"
              className="w-full h-14 pl-5 pr-32 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Continue
            </button>
          </form>

          {locError && (
            <p className="text-red-500 text-sm font-semibold mt-4 bg-red-50 py-2 rounded-lg">{locError}</p>
          )}
        </div>
      </div>
    )
  }

  // 2. Main Dashboard Layout (Vibrant Green Theme)
  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      
      {/* Hyperlocal Top Banner */}
      <div className="bg-emerald-100 border-b border-emerald-200 py-2.5 px-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛵</span>
            <span className="text-emerald-800 font-bold text-sm sm:text-base">
              Delivery in 8–10 mins to <span className="font-black bg-emerald-200 px-2 py-0.5 rounded-md ml-1">{location.pincode}</span>
            </span>
          </div>
          <button 
            onClick={() => setLocation({ ...location, isSet: false })}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Change
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        
        {/* Hero Section */}
        <div className="space-y-6 text-center sm:text-left">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Insta<span className="text-emerald-600">Mart</span> Deals
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">
              Search the local inventory for real-time prices & offers.
            </p>
          </div>

          <form onSubmit={fetchProduct} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID (e.g. 490670)"
                className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-lg shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Search Local'
              )}
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 hide-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <button key={i} className="whitespace-nowrap px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-full text-sm font-bold text-slate-700 transition-all shadow-sm">
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl animate-pulse flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-48 h-48 bg-slate-200 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-4 py-2">
              <div className="w-20 h-6 bg-slate-200 rounded-lg" />
              <div className="w-3/4 h-8 bg-slate-200 rounded-xl" />
              <div className="w-1/2 h-6 bg-slate-200 rounded-lg" />
              <div className="w-32 h-10 bg-slate-200 rounded-xl mt-6" />
            </div>
          </div>
        )}

        {/* Explicit Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🚨</span>
              <div>
                <h3 className="text-red-800 font-bold text-lg leading-snug">Connection Failed</h3>
                <p className="text-red-700 mt-1 font-medium font-mono text-sm bg-red-100 p-2 rounded-lg inline-block border border-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Card Result */}
        {productData && !loading && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in relative overflow-hidden group hover:border-emerald-200 transition-colors">
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              
              {/* Image Container with Delivery Tag */}
              <div className="relative w-full md:w-56 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 group-hover:bg-emerald-50/30 transition-colors min-h-[224px]">
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white border border-emerald-100 shadow-sm rounded-lg flex items-center gap-1.5 z-10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    {productData.eta || '8 MINS'}
                  </span>
                </div>
                
                {productData.image_url ? (
                  <img 
                    src={productData.image_url} 
                    alt={productData.title || 'Product'} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span className="text-5xl">🛍️</span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 w-full space-y-4 py-1">
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase border border-slate-200">
                    {productData.brand || 'Blinkit Verified'}
                  </span>
                  
                  {/* Availability Badge */}
                  {productData.in_stock === false ? (
                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold tracking-wider uppercase border border-red-200">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider uppercase border border-emerald-200">
                      In Stock
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {productData.title || 'Unknown Product Name'}
                </h2>

                {productData.unit && (
                  <p className="text-slate-500 font-bold text-sm bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                    {productData.unit}
                  </p>
                )}

                {/* Pricing & CTA Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 mt-2 border-t border-slate-100">
                  
                  <div>
                    {productData.mrp && productData.mrp > (productData.price || 0) && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-400 font-bold line-through decoration-slate-300">
                          MRP ₹{productData.mrp.toLocaleString('en-IN')}
                        </span>
                        {discountPercentage > 0 && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                            {discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1 text-slate-900">
                      <span className="text-2xl font-bold">₹</span>
                      <span className="text-4xl font-black tracking-tighter">
                        {productData.price?.toLocaleString('en-IN') || '---'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200">
                      Compare Prices
                    </button>
                    <button 
                      disabled={productData.in_stock === false}
                      className="flex-1 sm:flex-none h-12 px-8 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-black rounded-xl transition-all shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] active:scale-95"
                    >
                      {productData.in_stock === false ? 'UNAVAILABLE' : 'ADD TO CART'}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
