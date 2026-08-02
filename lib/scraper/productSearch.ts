/**
 * productSearch.ts — Client-side search wrapper
 *
 * Calls /api/v1/products/search which hits SerpAPI for REAL product listings
 * from Amazon.in, Flipkart, Nykaa, etc.
 *
 * After fetching real prices, the offerEnricher applies all savings layers
 * in the correct order: Coupon → Gift Card check → Bank Offer → Cashback
 */

import type { SearchAPIResponse, SearchProductCard, RetailerListing } from '../../app/api/v1/products/search/route'
import { enrichOffer, VaultCouponInput } from '../engine/offerEnricher'
import { getStorage } from '../utils/storage'

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
  // Additional breakdown fields for UI display
  savingsBreakdown?: {
    listedPrice: number
    couponSaved: number
    couponCode: string
    isVaultCoupon: boolean
    giftCardSaved: number
    giftCardSource: string
    giftCardUsed: boolean
    bankOfferSaved: number
    bankOfferSource: string
    cashbackAmount: number
    cashbackSource: string
    cashbackPct: number
    totalSaved: number
    savingsPct: number
  }
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

// ─── Load user savings profile from localStorage ─────────────────────────────
function loadUserSavingsProfile(): {
  userCardNames: string[]
  userUpiApps: string[]
  userVaultCoupons: VaultCouponInput[]
} {
  try {
    // Load cards from /cards page storage
    const cardsRaw = localStorage.getItem('moneysaver_user_cards')
    const cardsData = cardsRaw ? JSON.parse(cardsRaw) : {}
    const userCardNames: string[] = []
    if (cardsData.cards) {
      for (const card of cardsData.cards) {
        userCardNames.push(card.bankName || card.name || '')
      }
    }

    // Load UPI apps
    const upiRaw = localStorage.getItem('moneysaver_user_upi')
    const upiData = upiRaw ? JSON.parse(upiRaw) : []
    const userUpiApps: string[] = Array.isArray(upiData) ? upiData.map((u: { name?: string } | string) => (typeof u === 'string' ? u : (u.name || ''))) : []

    // Load vault coupons
    const vaultRaw = localStorage.getItem('moneysaver_user_vault')
    const vaultData: VaultCouponInput[] = vaultRaw ? JSON.parse(vaultRaw) : []

    return { userCardNames, userUpiApps, userVaultCoupons: vaultData }
  } catch {
    return { userCardNames: [], userUpiApps: [], userVaultCoupons: [] }
  }
}

// ─── Map API listing to enriched UI offer shape ───────────────────────────────
function listingToOffer(
  listing: RetailerListing,
  imageUrl: string,
  isLive: boolean,
  productCategory: string,
  userCardNames: string[],
  userUpiApps: string[],
  userVaultCoupons: VaultCouponInput[]
): MerchantProductOffer {
  const { currentPrice, mrp } = listing

  // Apply the complete savings stack in correct mathematical order
  const breakdown = enrichOffer({
    merchantSlug: listing.retailerSlug,
    merchantName: listing.retailerName,
    listedPrice: currentPrice,
    mrp,
    productCategory,
    userVaultCoupons,
    userCardNames,
    userUpiApps,
  })

  return {
    merchantName: listing.retailerName,
    merchantSlug: listing.retailerSlug,
    merchantLogo: '',
    currentPrice,
    mrp,
    discountPct: listing.discountPct,
    couponCode: breakdown.couponCode,
    couponDiscount: breakdown.couponSaved,
    bankOfferDiscount: breakdown.bankOfferSaved,
    bankOfferDescription: breakdown.bankOfferDescription,
    giftCardDiscount: breakdown.giftCardSaved,
    giftCardSource: breakdown.giftCardSource,
    cashbackAmount: breakdown.cashbackAmount,
    cashbackSource: breakdown.cashbackSource,
    // This is the KEY: netFinalPayable is now the true stacked savings result
    netFinalPayable: breakdown.netFinalPayable,
    stockStatus: listing.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
    deliveryEstimate: listing.deliveryText,
    lastUpdated: isLive ? 'Live price' : 'Reference price',
    confidence: isLive ? 1.0 : 0.85,
    explainabilityText: breakdown.totalSaved > 0
      ? `Save ₹${breakdown.totalSaved} (${breakdown.savingsPct}% off) after coupons + cashback`
      : listing.rawOffers?.length
        ? listing.rawOffers.join(' • ')
        : `Live price from ${listing.retailerName}`,
    productUrl: listing.listingUrl,
    productImageUrl: imageUrl,
    rating: listing.rating,
    reviews: listing.reviews,
    rawOffers: listing.rawOffers,
    savingsBreakdown: {
      listedPrice: breakdown.listedPrice,
      couponSaved: breakdown.couponSaved,
      couponCode: breakdown.couponCode,
      isVaultCoupon: breakdown.isVaultCoupon,
      giftCardSaved: breakdown.giftCardSaved,
      giftCardSource: breakdown.giftCardSource,
      giftCardUsed: breakdown.giftCardUsed,
      bankOfferSaved: breakdown.bankOfferSaved,
      bankOfferSource: breakdown.bankOfferSource,
      cashbackAmount: breakdown.cashbackAmount,
      cashbackSource: breakdown.cashbackSource,
      cashbackPct: breakdown.cashbackPct,
      totalSaved: breakdown.totalSaved,
      savingsPct: breakdown.savingsPct,
    },
  }
}

// ─── Infer product category from query ───────────────────────────────────────
function inferCategory(query: string, apiCategory?: string): string {
  if (apiCategory && apiCategory !== 'General') return apiCategory
  const q = query.toLowerCase()
  if (q.match(/moisturizer|serum|foundation|lipstick|skincare|nykaa|mamaearth|minimalist|plum|mcaffeine|foxtale|swiss beauty/)) return 'Beauty & Skincare'
  if (q.match(/shirt|kurta|jeans|dress|saree|shoes|sneakers|fashion|myntra|ajio|zara|h&m/)) return 'Fashion & Apparel'
  if (q.match(/iphone|samsung|laptop|macbook|earbuds|phone|electronics|realme|oneplus|xiaomi/)) return 'Electronics & Laptops'
  if (q.match(/protein|whey|supplement|fitness|gym|muscleblaze|health/)) return 'Health & Wellness'
  if (q.match(/food|pizza|burger|biryani|zomato|swiggy|dominos|mcdonalds/)) return 'Food Delivery'
  if (q.match(/mobile|smartphone|redmi|vivo|oppo/)) return 'Mobiles & Accessories'
  return 'Fashion & Apparel'
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

  // Load user's savings profile (cards, UPI, vault coupons) from localStorage
  const userProfile = loadUserSavingsProfile()
  const productCategory = inferCategory(raw)

  return data.results.map((card: SearchProductCard) => ({
    id: card.id,
    title: card.title,
    brand: card.brand,
    correctedQuery: changed && corrected !== raw.toLowerCase() ? corrected : '',
    category: card.category || productCategory,
    imageUrl: card.imageUrl,
    source: data.source,
    offers: card.listings.map(l => listingToOffer(
      l,
      card.imageUrl,
      isLive,
      card.category || productCategory,
      userProfile.userCardNames,
      userProfile.userUpiApps,
      userProfile.userVaultCoupons
    )),
  }))
}
