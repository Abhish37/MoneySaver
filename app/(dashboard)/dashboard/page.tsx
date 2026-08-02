'use client'

import React, { useState, useEffect, useRef } from 'react'
import Header from '../../../components/Header'
import MobileNav from '../../../components/MobileNav'
import OCRUploadModal from '../../../components/OCRUploadModal'
import BrandCard from '../../../components/BrandCard'
import ViewStackModal from '../../../components/ViewStackModal'
import { EXPANDED_STORES } from '../../../lib/data/stores'
import { searchRealtimeProducts, RealtimeProductResult, MerchantProductOffer } from '../../../lib/scraper/productSearch'
import { getAuthSession, UserProfile } from '../../../lib/auth/session'
import { getStorage, setStorage } from '../../../lib/utils/storage'
import { useRouter } from 'next/navigation'
import {
  SearchIcon, RocketIcon, SparkleIcon, FireIcon, ClockIcon, TrophyIcon,
  CouponIcon, GiftCardIcon, BankIcon, CashbackIcon, TagIcon,
  getCategoryIcon, BoxIcon,
} from '../../../components/icons'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [liveSearchResults, setLiveSearchResults] = useState<RealtimeProductResult[]>([])
  const [searchSource, setSearchSource] = useState<'SERP_LIVE' | 'KNOWLEDGE_BASE' | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [viewStackOpen, setViewStackOpen] = useState(false)
  const [viewStackOffer, setViewStackOffer] = useState<MerchantProductOffer | null>(null)
  const [viewStackProduct, setViewStackProduct] = useState<{ title: string; image: string }>({ title: '', image: '' })
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [requestBrandName, setRequestBrandName] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const activeUser = getAuthSession()
    if (!activeUser) {
      router.push('/login')
    } else {
      setUser(activeUser)
    }
    setRecentSearches(getStorage<string[]>('moneysaver_recent_searches', []))
  }, [router])

  // ── Single unified search runner ───────────────────────────────────────────
  const runSearch = async (query: string) => {
    const q = query.trim()
    if (q.length < 2) return

    setIsSearching(true)
    setSubmittedQuery(q)
    setSearchQuery(q)
    setLiveSearchResults([])
    setSearchSource(null)

    try {
      const results = await searchRealtimeProducts(q)
      setLiveSearchResults(results)
      setSearchSource(results[0]?.source ?? null)

      if (q.length >= 3 && !recentSearches.includes(q)) {
        const updated = [q, ...recentSearches.slice(0, 4)]
        setRecentSearches(updated)
        setStorage('moneysaver_recent_searches', updated)
      }
    } catch (err) {
      console.error('[Dashboard] Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = () => runSearch(searchQuery)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') runSearch(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSubmittedQuery('')
    setLiveSearchResults([])
    setSearchSource(null)
    inputRef.current?.focus()
  }

  const handleTrendingClick = (term: string) => runSearch(term)

  // Filter stores for brand discovery grid
  const filteredStores = EXPANDED_STORES.filter((store) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !query ||
      store.name.toLowerCase().includes(query) ||
      store.category.toLowerCase().includes(query) ||
      store.aliases.some((alias) => alias.toLowerCase().includes(query))
    const matchesCategory =
      selectedCategory === 'ALL' || store.category.toUpperCase() === selectedCategory.toUpperCase()
    return matchesSearch && matchesCategory
  })

  const categories = ['ALL', 'Fashion', 'Beauty & Skincare', 'Health & Wellness', 'Electronics', 'Food & Grocery', 'Travel']

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestBrandName) return
    const reqList = getStorage<object[]>('moneysaver_brand_requests', [])
    reqList.push({ id: Math.random().toString(36).substring(2, 9), brandName: requestBrandName, votes: 1, createdAt: new Date().toISOString() })
    setStorage('moneysaver_brand_requests', reqList)
    setRequestSubmitted(true)
    setTimeout(() => { setRequestSubmitted(false); setIsRequestOpen(false); setRequestBrandName('') }, 2000)
  }

  const handleViewStack = (product: RealtimeProductResult, offer: MerchantProductOffer) => {
    setViewStackProduct({ title: product.title, image: product.imageUrl })
    setViewStackOffer(offer)
    setViewStackOpen(true)
  }

  if (!user) return null

  const showResults = !isSearching && liveSearchResults.length > 0
  const showEmpty   = !isSearching && liveSearchResults.length === 0 && submittedQuery.length >= 2
  const showGrid    = !submittedQuery

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24 md:pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-3xl relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <RocketIcon size={13} className="text-emerald-400" />
              <span>Real-Time Savings Intelligence</span>
              <span className="text-emerald-600">•</span>
              <span>Live prices from Amazon, Flipkart &amp; more</span>
            </div>

            {/* Hero heading with tight tracking */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight font-['Outfit',sans-serif]">
              Find the best price,{' '}
              <span className="text-emerald-400">{user.firstName}</span>
              <span className="inline-flex items-center ml-2 text-amber-400">
                <SparkleIcon size={24} />
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
              Search any product — we fetch real prices across stores, then stack coupons, gift cards, bank offers &amp; cashback to show you the actual lowest price.
            </p>

            {/* Savings layer badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: <CouponIcon size={11} />, label: 'Best Coupon', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
                { icon: <GiftCardIcon size={11} />, label: 'Gift Cards', color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
                { icon: <BankIcon size={11} />, label: 'Bank Offers', color: 'text-blue-400 bg-blue-950/40 border-blue-500/30' },
                { icon: <CashbackIcon size={11} />, label: 'Cashback', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
              ].map(({ icon, label, color }) => (
                <span key={label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold ${color}`}>
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Bar ───────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                <SearchIcon size={18} />
              </div>
              <input
                ref={inputRef}
                id="product-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search any product (e.g. Hyaluronic Acid Moisturizer, iPhone 15, Nike Shoes)..."
                className="w-full pl-12 pr-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:border-emerald-500 focus:outline-none transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-200 text-sm font-bold"
                >✕</button>
              )}
            </div>
            {/* Search Button */}
            <button
              id="search-button"
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="shrink-0 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white text-sm transition-all shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              {isSearching ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Searching...</span></>
              ) : (
                <><SearchIcon size={15} /><span>Search</span><span className="text-emerald-300 text-xs hidden sm:inline">↵</span></>
              )}
            </button>
          </div>

          {/* Trending & Recent */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
              <FireIcon size={12} className="text-orange-400" /> Try:
            </span>
            {['Hyaluronic Acid', 'iPhone 15', 'MuscleBlaze Whey', 'Nike Shoes', 'Samsung Buds'].map((item) => (
              <button
                key={item}
                onClick={() => handleTrendingClick(item)}
                className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition-colors"
              >{item}</button>
            ))}
            {recentSearches.length > 0 && (
              <>
                <span className="text-slate-600 font-bold ml-2 flex items-center gap-1">
                  <ClockIcon size={11} /> Recent:
                </span>
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleTrendingClick(item)}
                    className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 whitespace-nowrap font-mono text-[11px]"
                  >{item}</button>
                ))}
              </>
            )}
          </div>

          {/* Category Filter Pills — only show when browsing brands */}
          {showGrid && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedCategory.toUpperCase() === cat.toUpperCase()
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat === 'ALL'
                    ? <><SparkleIcon size={11} /> All Categories</>
                    : <>{getCategoryIcon(cat, '', 11)} {cat}</>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <SearchIcon size={14} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-300">Searching across stores...</p>
              <p className="text-xs text-slate-500 mt-1">Fetching live prices + stacking best coupons &amp; cashback</p>
            </div>
          </div>
        )}

        {/* ── LIVE PRODUCT RESULTS ─────────────────────────────────────────── */}
        {showResults && (
          <div className="space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-300">
                  {liveSearchResults.length} result{liveSearchResults.length !== 1 ? 's' : ''} for
                  <span className="text-emerald-400 ml-1">"{submittedQuery}"</span>
                </h2>
                {searchSource === 'SERP_LIVE' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
                {searchSource === 'KNOWLEDGE_BASE' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                    Reference Prices
                  </span>
                )}
              </div>
              <button onClick={handleClearSearch} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ← Back to Browse
              </button>
            </div>

            {liveSearchResults.map((product) => {
              const sortedOffers = [...product.offers].sort((a, b) => a.netFinalPayable - b.netFinalPayable)
              const bestOffer = sortedOffers[0]
              const maxSavePct = bestOffer
                ? Math.round(((bestOffer.mrp - bestOffer.netFinalPayable) / bestOffer.mrp) * 100)
                : 0

              return (
                <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">

                  {/* Product Header */}
                  <div className="p-5 flex items-center gap-4 border-b border-slate-800">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-700 flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <BoxIcon size={28} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{product.category}</span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{product.brand}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 leading-tight truncate">{product.title}</h3>
                      {product.correctedQuery && (
                        <span className="text-[11px] text-amber-400 italic">Showing results for: "{product.correctedQuery}"</span>
                      )}
                    </div>
                    {maxSavePct > 0 && (
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Best deal</div>
                        <div className="text-lg font-extrabold text-emerald-400">{maxSavePct}% OFF</div>
                      </div>
                    )}
                  </div>

                  {/* Retailer Listings */}
                  <div className="divide-y divide-slate-800/60">
                    {sortedOffers.map((offer, idx) => (
                      <div
                        key={idx}
                        className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                          idx === 0 ? 'bg-emerald-950/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Retailer name + savings badges */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-100 text-sm">{offer.merchantName}</span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-slate-950 font-extrabold text-[10px] flex items-center gap-1">
                                <TrophyIcon size={10} /> BEST PRICE
                              </span>
                            )}
                            {offer.rating && (
                              <span className="text-[10px] text-yellow-400 font-semibold">⭐ {offer.rating.toFixed(1)}</span>
                            )}
                            {offer.reviews && (
                              <span className="text-[10px] text-slate-500">({offer.reviews.toLocaleString('en-IN')} reviews)</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">{offer.deliveryEstimate}</span>
                            {/* Raw offers from retailer */}
                            {offer.rawOffers && offer.rawOffers.slice(0, 2).map((raw, ri) => (
                              <span key={ri} className="px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-500/20 text-amber-400 text-[10px]">{raw}</span>
                            ))}
                            {/* Coupon badge */}
                            {offer.couponDiscount > 0 && offer.couponCode && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 font-mono text-[10px] flex items-center gap-1">
                                <CouponIcon size={10} /> {offer.couponCode} −₹{offer.couponDiscount}
                              </span>
                            )}
                            {/* Bank offer badge */}
                            {offer.bankOfferDiscount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-400 font-mono text-[10px] flex items-center gap-1">
                                <BankIcon size={10} /> −₹{offer.bankOfferDiscount}
                              </span>
                            )}
                            {/* Cashback badge */}
                            {offer.cashbackAmount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                                <CashbackIcon size={10} /> ₹{offer.cashbackAmount} back
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            {offer.mrp > offer.netFinalPayable && (
                              <div className="text-xs text-slate-500 line-through font-mono">₹{offer.mrp.toLocaleString('en-IN')}</div>
                            )}
                            <div className="text-lg font-extrabold text-emerald-400 font-mono">₹{offer.netFinalPayable.toLocaleString('en-IN')}</div>
                            {offer.mrp > offer.netFinalPayable && (
                              <div className="text-[10px] text-emerald-300 font-semibold">
                                Save ₹{(offer.mrp - offer.netFinalPayable).toLocaleString('en-IN')} ({Math.round(((offer.mrp - offer.netFinalPayable) / offer.mrp) * 100)}% OFF)
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <a
                              href={offer.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-md whitespace-nowrap text-center"
                            >
                              Buy Now ↗
                            </a>
                            <button
                              onClick={() => handleViewStack(product, offer)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-xs text-slate-300 transition-all whitespace-nowrap"
                            >
                              View Stack
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live data disclaimer */}
                  <div className="px-5 py-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                      {searchSource === 'SERP_LIVE' ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live prices. Click Buy Now to verify at checkout.</>
                      ) : (
                        <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Reference prices. Actual prices may vary.</>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-600">{sortedOffers.length} store{sortedOffers.length !== 1 ? 's' : ''} compared</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Empty state after search ─────────────────────────────────────── */}
        {showEmpty && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <SearchIcon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">No results found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                No listings found for <span className="text-slate-200 font-semibold">"{submittedQuery}"</span>.
                Try a more specific product name or request this brand.
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleClearSearch} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-all">
                Try Another Search
              </button>
              <button
                onClick={() => { setRequestBrandName(submittedQuery); setIsRequestOpen(true) }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs transition-all shadow-lg flex items-center gap-1.5"
              >
                <TagIcon size={12} /> Request Integration
              </button>
            </div>
          </div>
        )}

        {/* ── Brand Discovery Grid (varied layouts) ────────────────────────── */}
        {showGrid && filteredStores.length > 0 && (
          <div className="space-y-12">
            {categories
              .filter((c) => c !== 'ALL' && (selectedCategory === 'ALL' || selectedCategory.toUpperCase() === c.toUpperCase()))
              .map((categoryName, catIdx) => {
                const categoryStores = filteredStores.filter((s) => s.category.toUpperCase() === categoryName.toUpperCase())
                if (categoryStores.length === 0) return null

                const isFashion = categoryName.toLowerCase().includes('fashion')
                const isBeauty  = categoryName.toLowerCase().includes('beauty')

                return (
                  <div key={categoryName} className="space-y-5">
                    {/* Category heading */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2.5 font-['Outfit',sans-serif] tracking-tight">
                        <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                          {getCategoryIcon(categoryName, '', 16)}
                        </span>
                        <span>{categoryName}</span>
                        <span className="text-xs text-slate-500 font-normal">({categoryStores.length})</span>
                      </h2>
                    </div>

                    {/* Fashion: Featured hero card + grid */}
                    {isFashion ? (
                      <div className="space-y-4">
                        {categoryStores.length > 0 && (
                          <>
                            {/* Featured Store — large hero card */}
                            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl group">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                              <div className="flex items-start gap-6">
                                <span className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                                  {categoryStores[0].logo}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Featured Store</span>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold font-mono text-emerald-400">
                                      Save {categoryStores[0].minimumSaving}–{categoryStores[0].maximumSaving}%
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-extrabold text-slate-100 tracking-tight font-['Outfit',sans-serif]">
                                    {categoryStores[0].name}
                                  </h3>
                                  <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-lg">{categoryStores[0].description}</p>
                                  <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><CouponIcon size={11} className="text-amber-400" /> <strong className="text-amber-400">{categoryStores[0].supportedCoupons}</strong> Coupons</span>
                                    <span className="flex items-center gap-1"><GiftCardIcon size={11} className="text-purple-400" /> <strong className="text-purple-400">{categoryStores[0].giftCardDiscountPct}%</strong> Gift Card</span>
                                  </div>
                                </div>
                                <a
                                  href={`/deals/${categoryStores[0].slug}`}
                                  className="hidden sm:flex shrink-0 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-xl"
                                >
                                  Explore Deals ↗
                                </a>
                              </div>
                            </div>

                            {/* Remaining stores in 3-col grid */}
                            {categoryStores.length > 1 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {categoryStores.slice(1).map((store) => (
                                  <BrandCard key={store.id} store={store} />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : isBeauty ? (
                      /* Beauty: Horizontal scroll carousel */
                      <div className="-mx-4 sm:-mx-6 px-4 sm:px-6">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                          {categoryStores.map((store) => (
                            <div key={store.id} className="flex-none w-64 snap-start">
                              <BrandCard store={store} />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-600 text-center mt-1">← Scroll for more →</p>
                      </div>
                    ) : (
                      /* All other categories: alternating 2-col and 4-col grids */
                      <div className={`grid gap-4 ${
                        catIdx % 2 === 0
                          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                      }`}>
                        {categoryStores.map((store) => (
                          <BrandCard key={store.id} store={store} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </main>

      {/* ── Brand Request Modal ──────────────────────────────────────────────── */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setIsRequestOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 text-lg font-bold">✕</button>
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <TagIcon size={16} className="text-amber-400" /> Request Store Integration
            </h3>
            <p className="text-xs text-slate-400 mb-4">Help us prioritize future integrations.</p>
            {requestSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
                <SparkleIcon size={14} /> Request submitted!
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400">Brand / Store Name</label>
                  <input type="text" value={requestBrandName} onChange={(e) => setRequestBrandName(e.target.value)} placeholder="e.g. Sephora, Decathlon" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 mt-1 focus:border-emerald-500 focus:outline-none" required />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all text-xs">Submit Request</button>
              </form>
            )}
          </div>
        </div>
      )}

      {viewStackOffer && (
        <ViewStackModal
          isOpen={viewStackOpen}
          onClose={() => { setViewStackOpen(false); setViewStackOffer(null) }}
          productTitle={viewStackProduct.title}
          productImage={viewStackProduct.image}
          offer={viewStackOffer}
        />
      )}

      <MobileNav onOpenUpload={() => setIsUploadOpen(true)} />
      <OCRUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  )
}
