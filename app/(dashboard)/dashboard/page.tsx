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
    <div className="min-h-screen bg-[#0E1117] text-[#E6EDF3] pb-24 md:pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-7 space-y-7">

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle directional accent — not a glow, just a tinted corner */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#1A4731]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-3xl relative">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A4731]/40 border border-[#2DA44E]/20 text-xs font-semibold text-[#2DA44E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DA44E] animate-pulse inline-block" />
              <RocketIcon size={11} className="text-[#2DA44E]" />
              <span>Real-Time Savings Intelligence</span>
              <span className="text-[#2DA44E]/40">·</span>
              <span className="text-[#7D8590]">Live prices from Amazon, Flipkart & more</span>
            </div>

            {/* Hero heading */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E6EDF3] tracking-tight leading-tight font-display">
              Find the best price,{' '}
              <span className="text-[#2DA44E]">{user.firstName}</span>
              <span className="inline-flex items-center ml-2 text-[#E3B341]">
                <SparkleIcon size={20} />
              </span>
            </h1>

            <p className="text-sm text-[#7D8590] leading-relaxed max-w-lg">
              Search any product — we fetch real prices across stores, then stack coupons, gift cards, bank offers &amp; cashback to show you the actual lowest price.
            </p>

            {/* Savings layer indicators */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: <CouponIcon size={11} />,   label: 'Best Coupon', color: 'text-[#E3B341] bg-[#C9A227]/10 border-[#C9A227]/25' },
                { icon: <GiftCardIcon size={11} />, label: 'Gift Cards',  color: 'text-[#7D8590] bg-[#21262D] border-[#30363D]' },
                { icon: <BankIcon size={11} />,     label: 'Bank Offers', color: 'text-[#388BFD] bg-[#388BFD]/08 border-[#388BFD]/20' },
                { icon: <CashbackIcon size={11} />, label: 'Cashback',    color: 'text-[#2DA44E] bg-[#1A4731]/40 border-[#2DA44E]/25' },
              ].map(({ icon, label, color }) => (
                <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${color}`}>
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Bar ───────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex gap-2.5 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#484F58]">
                <SearchIcon size={17} />
              </div>
              <input
                ref={inputRef}
                id="product-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search any product (e.g. Hyaluronic Acid Moisturizer, iPhone 15, Nike Shoes)..."
                className="w-full pl-11 pr-10 py-3.5 bg-[#161B22] border border-[#30363D] rounded-lg text-[#E6EDF3] placeholder-[#484F58] text-sm focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-3.5 flex items-center text-[#484F58] hover:text-[#7D8590] text-sm"
                >✕</button>
              )}
            </div>
            {/* Search Button */}
            <button
              id="search-button"
              onClick={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="shrink-0 px-5 py-3.5 rounded-lg bg-[#238636] hover:bg-[#2DA44E] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white text-sm transition-all shadow-[0_2px_10px_rgba(35,134,54,0.25)] flex items-center gap-2 whitespace-nowrap"
            >
              {isSearching ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Searching…</span></>
              ) : (
                <><SearchIcon size={15} /><span>Search</span><span className="text-[#3FB950]/70 text-xs hidden sm:inline">↵</span></>
              )}
            </button>
          </div>

          {/* Trending & Recent */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#484F58] font-medium whitespace-nowrap flex items-center gap-1">
              <FireIcon size={11} className="text-[#D29922]" /> Trending:
            </span>
            {['Hyaluronic Acid', 'iPhone 15', 'MuscleBlaze Whey', 'Nike Shoes', 'Samsung Buds'].map((item) => (
              <button
                key={item}
                onClick={() => handleTrendingClick(item)}
                className="px-2.5 py-1 rounded-full bg-[#161B22] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#484F58] text-[#7D8590] hover:text-[#E6EDF3] whitespace-nowrap transition-all"
              >{item}</button>
            ))}
            {recentSearches.length > 0 && (
              <>
                <span className="text-[#30363D] font-medium ml-1 flex items-center gap-1">
                  <ClockIcon size={10} className="text-[#484F58]" /> <span className="text-[#484F58]">Recent:</span>
                </span>
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleTrendingClick(item)}
                    className="px-2 py-1 rounded-full bg-[#0E1117] border border-[#21262D] text-[#484F58] hover:text-[#7D8590] whitespace-nowrap font-mono text-[11px] transition-colors"
                  >{item}</button>
                ))}
              </>
            )}
          </div>

          {/* Category Filter Pills — only show when browsing brands */}
          {showGrid && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedCategory.toUpperCase() === cat.toUpperCase()
                      ? 'bg-[#1A4731]/50 border-[#2DA44E]/50 text-[#2DA44E]'
                      : 'bg-[#161B22] border-[#30363D] text-[#7D8590] hover:text-[#E6EDF3] hover:border-[#484F58]'
                  }`}
                >
                  {cat === 'ALL'
                    ? <><SparkleIcon size={10} /> All Categories</>
                    : <>{getCategoryIcon(cat, '', 10)} {cat}</>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-14 gap-4">
            <div className="relative">
              <div className="w-9 h-9 border-2 border-[#30363D] border-t-[#2DA44E] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#2DA44E]">
                <SearchIcon size={13} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#E6EDF3]">Searching across stores…</p>
              <p className="text-xs text-[#7D8590] mt-1">Fetching live prices · Stacking best coupons &amp; cashback</p>
            </div>
          </div>
        )}

        {/* ── LIVE PRODUCT RESULTS ─────────────────────────────────────────── */}
        {showResults && (
          <div className="space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#E6EDF3]">
                  {liveSearchResults.length} result{liveSearchResults.length !== 1 ? 's' : ''} for{' '}
                  <span className="text-[#2DA44E]">"{submittedQuery}"</span>
                </h2>
                {searchSource === 'SERP_LIVE' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#1A4731]/40 border border-[#2DA44E]/25 text-[10px] font-semibold text-[#2DA44E] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2DA44E] animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
                {searchSource === 'KNOWLEDGE_BASE' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/25 text-[10px] font-semibold text-[#E3B341]">
                    Reference Prices
                  </span>
                )}
              </div>
              <button onClick={handleClearSearch} className="text-xs text-[#7D8590] hover:text-[#E6EDF3] transition-colors">
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
                <div key={product.id} className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">

                  {/* Product Header */}
                  <div className="p-5 flex items-center gap-4 border-b border-[#21262D]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-14 h-14 rounded-lg object-contain bg-white border border-[#30363D] flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#1C2128] border border-[#30363D] flex items-center justify-center text-[#484F58] flex-shrink-0">
                        <BoxIcon size={26} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-[#2DA44E] uppercase tracking-wider">{product.category}</span>
                        <span className="text-[10px] text-[#30363D]">·</span>
                        <span className="text-[10px] text-[#7D8590]">{product.brand}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#E6EDF3] leading-tight truncate">{product.title}</h3>
                      {product.correctedQuery && (
                        <span className="text-[11px] text-[#E3B341] italic">Showing results for: "{product.correctedQuery}"</span>
                      )}
                    </div>
                    {maxSavePct > 0 && (
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] text-[#7D8590] uppercase tracking-wider">Best deal</div>
                        <div className="text-lg font-bold text-[#2DA44E] font-display">{maxSavePct}% OFF</div>
                      </div>
                    )}
                  </div>

                  {/* Retailer Listings */}
                  <div className="divide-y divide-[#21262D]">
                    {sortedOffers.map((offer, idx) => (
                      <div
                        key={idx}
                        className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                          idx === 0
                            ? 'bg-[#1A4731]/10 border-l-2 border-l-[#2DA44E]'
                            : 'hover:bg-[#1C2128]/60'
                        }`}
                      >
                        {/* Retailer name + savings badges */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#E6EDF3] text-sm">{offer.merchantName}</span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded bg-[#238636] text-white font-semibold text-[10px] flex items-center gap-1">
                                <TrophyIcon size={9} /> BEST PRICE
                              </span>
                            )}
                            {offer.rating && (
                              <span className="text-[10px] text-[#D29922] font-medium">⭐ {offer.rating.toFixed(1)}</span>
                            )}
                            {offer.reviews && (
                              <span className="text-[10px] text-[#484F58]">({offer.reviews.toLocaleString('en-IN')} reviews)</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-[#7D8590]">{offer.deliveryEstimate}</span>
                            {offer.rawOffers && offer.rawOffers.slice(0, 2).map((raw, ri) => (
                              <span key={ri} className="px-1.5 py-0.5 rounded bg-[#C9A227]/10 border border-[#C9A227]/25 text-[#E3B341] text-[10px]">{raw}</span>
                            ))}
                            {offer.couponDiscount > 0 && offer.couponCode && (
                              <span className="px-1.5 py-0.5 rounded bg-[#C9A227]/10 border border-[#C9A227]/25 text-[#E3B341] font-mono text-[10px] flex items-center gap-1">
                                <CouponIcon size={9} /> {offer.couponCode} −₹{offer.couponDiscount}
                              </span>
                            )}
                            {offer.bankOfferDiscount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#388BFD]/08 border border-[#388BFD]/20 text-[#388BFD] font-mono text-[10px] flex items-center gap-1">
                                <BankIcon size={9} /> −₹{offer.bankOfferDiscount}
                              </span>
                            )}
                            {offer.cashbackAmount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1A4731]/40 border border-[#2DA44E]/25 text-[#2DA44E] font-mono text-[10px] flex items-center gap-1">
                                <CashbackIcon size={9} /> ₹{offer.cashbackAmount} back
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            {offer.mrp > offer.netFinalPayable && (
                              <div className="text-xs text-[#484F58] line-through font-mono">₹{offer.mrp.toLocaleString('en-IN')}</div>
                            )}
                            <div className="text-lg font-bold text-[#2DA44E] font-mono">₹{offer.netFinalPayable.toLocaleString('en-IN')}</div>
                            {offer.mrp > offer.netFinalPayable && (
                              <div className="text-[10px] text-[#3FB950] font-medium">
                                Save ₹{(offer.mrp - offer.netFinalPayable).toLocaleString('en-IN')} ({Math.round(((offer.mrp - offer.netFinalPayable) / offer.mrp) * 100)}% OFF)
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <a
                              href={offer.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-xs text-white transition-all shadow-sm whitespace-nowrap text-center"
                            >
                              Buy Now ↗
                            </a>
                            <button
                              onClick={() => handleViewStack(product, offer)}
                              className="px-4 py-2 rounded-lg bg-[#1C2128] hover:bg-[#21262D] border border-[#30363D] hover:border-[#484F58] font-medium text-xs text-[#7D8590] hover:text-[#E6EDF3] transition-all whitespace-nowrap"
                            >
                              View Stack
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live data disclaimer */}
                  <div className="px-5 py-2.5 border-t border-[#21262D] flex items-center justify-between bg-[#0E1117]/40">
                    <span className="text-[10px] text-[#484F58] flex items-center gap-1">
                      {searchSource === 'SERP_LIVE' ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] inline-block" /> Live prices. Verify at checkout.</>
                      ) : (
                        <><span className="w-1.5 h-1.5 rounded-full bg-[#D29922] inline-block" /> Reference prices. Actual prices may vary.</>
                      )}
                    </span>
                    <span className="text-[10px] text-[#484F58]">{sortedOffers.length} store{sortedOffers.length !== 1 ? 's' : ''} compared</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Empty state after search ─────────────────────────────────────── */}
        {showEmpty && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8 text-center space-y-5 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#1C2128] border border-[#30363D] flex items-center justify-center text-[#484F58] mx-auto">
              <SearchIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E6EDF3]">No results found</h3>
              <p className="text-xs text-[#7D8590] mt-1 max-w-md mx-auto leading-relaxed">
                No listings found for <span className="text-[#E6EDF3] font-medium">"{submittedQuery}"</span>.
                Try a more specific product name or request this brand.
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={handleClearSearch} className="px-5 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] font-medium text-xs text-[#E6EDF3] transition-all">
                Try Another Search
              </button>
              <button
                onClick={() => { setRequestBrandName(submittedQuery); setIsRequestOpen(true) }}
                className="px-5 py-2 rounded-lg bg-[#C9A227]/15 hover:bg-[#C9A227]/25 border border-[#C9A227]/35 font-semibold text-[#E3B341] text-xs transition-all flex items-center gap-1.5"
              >
                <TagIcon size={11} /> Request Integration
              </button>
            </div>
          </div>
        )}

        {/* ── Brand Discovery Grid ──────────────────────────────────────────── */}
        {showGrid && filteredStores.length > 0 && (
          <div className="space-y-10">
            {categories
              .filter((c) => c !== 'ALL' && (selectedCategory === 'ALL' || selectedCategory.toUpperCase() === c.toUpperCase()))
              .map((categoryName, catIdx) => {
                const categoryStores = filteredStores.filter((s) => s.category.toUpperCase() === categoryName.toUpperCase())
                if (categoryStores.length === 0) return null

                const isFashion = categoryName.toLowerCase().includes('fashion')
                const isBeauty  = categoryName.toLowerCase().includes('beauty')

                return (
                  <div key={categoryName} className="space-y-4">
                    {/* Category heading */}
                    <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                      <h2 className="text-base font-semibold text-[#E6EDF3] flex items-center gap-2.5 font-display tracking-tight">
                        <span className="p-1.5 rounded-lg bg-[#1C2128] border border-[#30363D] text-[#7D8590]">
                          {getCategoryIcon(categoryName, '', 14)}
                        </span>
                        <span>{categoryName}</span>
                        <span className="text-xs text-[#484F58] font-normal font-sans">({categoryStores.length})</span>
                      </h2>
                    </div>

                    {/* Fashion: Featured hero card + grid */}
                    {isFashion ? (
                      <div className="space-y-4">
                        {categoryStores.length > 0 && (
                          <>
                            {/* Featured Store — hero card */}
                            <div className="relative bg-[#161B22] border border-[#30363D] hover:border-[#484F58] rounded-xl p-6 sm:p-8 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] group transition-all">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-[#1A4731]/10 rounded-full blur-2xl pointer-events-none" />
                              <div className="flex items-start gap-6">
                                <span className="w-14 h-14 rounded-xl bg-[#1C2128] border border-[#30363D] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                                  {categoryStores[0].logo}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-[10px] font-semibold text-[#2DA44E] uppercase tracking-wider">Featured Store</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#1A4731]/50 border border-[#2DA44E]/30 text-[11px] font-semibold text-[#2DA44E]">
                                      Save {categoryStores[0].minimumSaving}–{categoryStores[0].maximumSaving}%
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold text-[#E6EDF3] tracking-tight font-display">
                                    {categoryStores[0].name}
                                  </h3>
                                  <p className="text-sm text-[#7D8590] mt-1 leading-relaxed max-w-lg">{categoryStores[0].description}</p>
                                  <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-[#7D8590]">
                                    <span className="flex items-center gap-1"><CouponIcon size={11} className="text-[#E3B341]" /> <strong className="text-[#E3B341]">{categoryStores[0].supportedCoupons}</strong> Coupons</span>
                                    <span className="flex items-center gap-1"><GiftCardIcon size={11} className="text-[#7D8590]" /> <strong className="text-[#E6EDF3]">{categoryStores[0].giftCardDiscountPct}%</strong> Gift Card</span>
                                  </div>
                                </div>
                                <a
                                  href={`/deals/${categoryStores[0].slug}`}
                                  className="hidden sm:flex shrink-0 px-5 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white text-sm transition-all shadow-sm"
                                >
                                  Explore Deals ↗
                                </a>
                              </div>
                            </div>

                            {/* Remaining stores in 3-col grid */}
                            {categoryStores.length > 1 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                          {categoryStores.map((store) => (
                            <div key={store.id} className="flex-none w-60 snap-start">
                              <BrandCard store={store} />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#484F58] text-center mt-1">← Scroll for more →</p>
                      </div>
                    ) : (
                      /* All other categories */
                      <div className={`grid gap-3 ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1117]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.7)] relative">
            <button onClick={() => setIsRequestOpen(false)} className="absolute right-4 top-4 text-[#484F58] hover:text-[#7D8590] font-medium">✕</button>
            <h3 className="text-base font-semibold text-[#E6EDF3] mb-1 flex items-center gap-2">
              <TagIcon size={15} className="text-[#E3B341]" /> Request Store Integration
            </h3>
            <p className="text-xs text-[#7D8590] mb-4">Help us prioritize future integrations.</p>
            {requestSubmitted ? (
              <div className="p-4 rounded-lg bg-[#1A4731]/40 border border-[#2DA44E]/30 text-center text-xs text-[#2DA44E] font-semibold flex items-center justify-center gap-2">
                <SparkleIcon size={13} /> Request submitted!
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[#7D8590] font-medium">Brand / Store Name</label>
                  <input
                    type="text"
                    value={requestBrandName}
                    onChange={(e) => setRequestBrandName(e.target.value)}
                    placeholder="e.g. Sephora, Decathlon"
                    className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-2.5 text-sm text-[#E6EDF3] mt-1 focus:border-[#2DA44E] focus:outline-none focus:ring-2 focus:ring-[#2DA44E]/10"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2DA44E] font-semibold text-white transition-all text-xs">
                  Submit Request
                </button>
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
