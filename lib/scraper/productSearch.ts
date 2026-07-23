/**
 * productSearch.ts — Client-side search wrapper
 *
 * Previously: Generated 100% hardcoded fake prices locally.
 * Now:        Calls /api/v1/products/search which hits SerpAPI for
 *             REAL product listings from Amazon.in, Flipkart, Nykaa, etc.
 */

import type { SearchAPIResponse, SearchProductCard, RetailerListing } from '../../app/api/v1/products/search/route'

// ─── Public Types (used by dashboard page) ────────────────────────────────────

export interface MerchantProductOffer {
  merchantName: string
  merchantSlug: string
  merchantLogo: string
  currentPrice: number
  mrp: number
  discountPct: number
  couponCode: string
  couponDiscount: number
  bankOfferDiscount: number
  bankOfferDescription: string
  giftCardDiscount: number
  giftCardSource: string
  cashbackAmount: number
  cashbackSource: string
  netFinalPayable: number
  stockStatus: string
  deliveryEstimate: string
  lastUpdated: string
  confidence: number
  explainabilityText: string
  productUrl: string
  productImageUrl: string
  rating?: number
  reviews?: number
  rawOffers?: string[]
}

export interface RealtimeProductResult {
  id: string
  title: string
  brand: string
  correctedQuery: string
  category: string
  imageUrl: string
  source: 'SERP_LIVE' | 'KNOWLEDGE_BASE'
  offers: MerchantProductOffer[]
}

// ─── Typo Correction Dictionary ───────────────────────────────────────────────
const TYPO_CORRECTIONS: Record<string, string> = {
  bluberry: 'blueberry',
  blubery: 'blueberry',
  mccafine: 'mcaffeine',
  mccaffine: 'mcaffeine',
  mcafeine: 'mcaffeine',
  mcafine: 'mcaffeine',
  foxtal: 'foxtale',
  foxtail: 'foxtale',
  musclblaze: 'muscleblaze',
  muscelblaze: 'muscleblaze',
  samung: 'samsung',
  samsng: 'samsung',
  nikie: 'nike',
  nikee: 'nike',
  adiddas: 'adidas',
  addidas: 'adidas',
  mynrta: 'myntra',
  mynttra: 'myntra',
  flipkrt: 'flipkart',
  flpkart: 'flipkart',
  amazn: 'amazon',
  amzon: 'amazon',
  swigy: 'swiggy',
  swiggie: 'swiggy',
  zomto: 'zomato',
  zommato: 'zomato',
  nyka: 'nykaa',
  nykka: 'nykaa',
  decathalon: 'decathlon',
  decathln: 'decathlon',
  mamearth: 'mamaearth',
  mamaerath: 'mamaearth',
  pluum: 'plum',
  minimlaist: 'minimalist',
  minmalist: 'minimalist',
  protien: 'protein',
  protine: 'protein',
  serium: 'serum',
  serumm: 'serum',
  lotoin: 'lotion',
  lotiion: 'lotion',
  moisturiser: 'moisturizer',
  moisturzer: 'moisturizer',
  shamppo: 'shampoo',
  shampo: 'shampoo',
  lipstik: 'lipstick',
  lipstck: 'lipstick',
  hyalurnic: 'hyaluronic',
  hylauronic: 'hyaluronic',
}

function levenshtein(a: string, b: string): number {
  const m: number[][] = []
  for (let i = 0; i <= a.length; i++) m[i] = [i]
  for (let j = 0; j <= b.length; j++) m[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost)
    }
  return m[a.length][b.length]
}

export function correctTypos(query: string): { corrected: string; changed: boolean } {
  const words = query.toLowerCase().trim().split(/\s+/)
  let changed = false
  const corrected = words.map(word => {
    if (TYPO_CORRECTIONS[word]) { changed = true; return TYPO_CORRECTIONS[word] }
    for (const [typo, fix] of Object.entries(TYPO_CORRECTIONS)) {
      if (word.length > 3 && levenshtein(word, typo) <= 1) { changed = true; return fix }
    }
    return word
  })
  return { corrected: corrected.join(' '), changed }
}

// ─── Map API listing to UI offer shape ───────────────────────────────────────
function listingToOffer(listing: RetailerListing, imageUrl: string, isLive: boolean): MerchantProductOffer {
  const { currentPrice, mrp } = listing
  return {
    merchantName: listing.retailerName,
    merchantSlug: listing.retailerSlug,
    merchantLogo: '',
    currentPrice,
    mrp,
    discountPct: listing.discountPct,
    // We DO NOT fabricate coupons — only report real ones when we have them
    couponCode: '',
    couponDiscount: 0,
    bankOfferDiscount: 0,
    bankOfferDescription: '',
    giftCardDiscount: 0,
    giftCardSource: '',
    cashbackAmount: 0,
    cashbackSource: '',
    netFinalPayable: currentPrice,  // Honest: the real listed price IS the net payable
    stockStatus: listing.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
    deliveryEstimate: listing.deliveryText,
    lastUpdated: isLive ? 'Live price' : 'Reference price',
    confidence: isLive ? 1.0 : 0.85,
    explainabilityText: listing.rawOffers?.length
      ? listing.rawOffers.join(' • ')
      : `Live price from ${listing.retailerName}`,
    productUrl: listing.listingUrl,
    productImageUrl: imageUrl,
    rating: listing.rating,
    reviews: listing.reviews,
    rawOffers: listing.rawOffers,
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function searchRealtimeProducts(query: string): Promise<RealtimeProductResult[]> {
  const raw = query.trim()
  if (!raw || raw.length < 2) return []

  // Correct typos before sending to API
  const { corrected, changed } = correctTypos(raw)
  const finalQuery = corrected

  const res = await fetch(`/api/v1/products/search?q=${encodeURIComponent(finalQuery)}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('[productSearch] API error:', res.status)
    return []
  }

  const data: SearchAPIResponse = await res.json()
  const isLive = data.source === 'SERP_LIVE'

  return data.results.map((card: SearchProductCard) => ({
    id: card.id,
    title: card.title,
    brand: card.brand,
    correctedQuery: changed && corrected !== raw.toLowerCase() ? corrected : '',
    category: card.category,
    imageUrl: card.imageUrl,
    source: data.source,
    offers: card.listings.map(l => listingToOffer(l, card.imageUrl, isLive)),
  }))
}
