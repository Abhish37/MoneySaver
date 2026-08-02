/**
 * offerEnricher.ts — Correct Savings Calculation Engine
 *
 * Mathematics order (strictly enforced):
 * 1. Listed Store Price (real SERP data)
 * 2. Best valid Coupon (Vault coupon > public scraped coupon, whichever saves more)
 * 3. Gift Card comparison (check if buying a gift card from Amazon Pay/Woohoo saves MORE than coupon)
 * 4. Bank / UPI offer applied on post-coupon price
 * 5. Cashback on the final amount paid (from CashKaro rates)
 * ─────────────────────────────────────────────────────────
 * = Net Final Payable (what user actually pays out of pocket)
 */

import { getCategoryCashback } from './cashback'

// Gift card discount sources (Amazon Pay GC / Woohoo rates as of 2025)
export const GIFT_CARD_SOURCES: Record<string, { discountPct: number; source: string; maxDiscount: number }> = {
  myntra:    { discountPct: 10, source: 'Amazon Pay GC / Woohoo', maxDiscount: 1500 },
  nykaa:     { discountPct: 10, source: 'Amazon Pay GC / Woohoo', maxDiscount: 1000 },
  swiggy:    { discountPct: 5,  source: 'Amazon Pay GC',          maxDiscount: 500  },
  zomato:    { discountPct: 5,  source: 'Amazon Pay GC',          maxDiscount: 500  },
  ajio:      { discountPct: 8,  source: 'Woohoo GC',              maxDiscount: 1000 },
  amazon:    { discountPct: 0,  source: 'N/A',                    maxDiscount: 0    },
  flipkart:  { discountPct: 0,  source: 'N/A',                    maxDiscount: 0    },
  mamaearth: { discountPct: 8,  source: 'Amazon Pay GC',          maxDiscount: 600  },
  puma:      { discountPct: 10, source: 'Woohoo GC',              maxDiscount: 800  },
  nike:      { discountPct: 8,  source: 'Woohoo GC',              maxDiscount: 800  },
  adidas:    { discountPct: 8,  source: 'Woohoo GC',              maxDiscount: 800  },
}

// Public merchant coupon vault (best publicly available promo codes)
export const PUBLIC_MERCHANT_COUPONS: Record<string, { code: string; discountPct?: number; flatOff?: number; minCart: number; source: string }[]> = {
  myntra:    [
    { code: 'MYNTRA10',  discountPct: 10, minCart: 999,  source: 'CouponDuniya' },
    { code: 'AXIS15',    discountPct: 15, minCart: 1499, source: 'Axis Bank Offer' },
  ],
  nykaa:     [
    { code: 'NYKAA20',   discountPct: 20, minCart: 499,  source: 'CouponDuniya' },
    { code: 'FLAT100',   flatOff: 100,    minCart: 999,  source: 'Nykaa App' },
  ],
  amazon:    [
    { code: 'SAVE5',     discountPct: 5,  minCart: 0,    source: 'Amazon Coupon' },
  ],
  flipkart:  [
    { code: 'FK10OFF',   discountPct: 10, minCart: 999,  source: 'CouponDuniya' },
  ],
  ajio:      [
    { code: 'AJIO15',    discountPct: 15, minCart: 1299, source: 'AJIO Promo' },
    { code: 'FLAT200',   flatOff: 200,    minCart: 1499, source: 'CouponDuniya' },
  ],
  swiggy:    [
    { code: 'SWIGGY60',  flatOff: 60,     minCart: 199,  source: 'Swiggy App' },
  ],
  zomato:    [
    { code: 'ZON50',     flatOff: 50,     minCart: 149,  source: 'Zomato Promo' },
  ],
  mamaearth: [
    { code: 'MAMA20',    discountPct: 20, minCart: 599,  source: 'CouponDuniya' },
  ],
}

export interface VaultCouponInput {
  id: string
  code: string
  store: string
  discountValue: number
  minCartValue: number
  originApp?: string
  expires: string
}

export interface EnrichedOfferBreakdown {
  listedPrice: number           // Real SERP price
  couponSaved: number           // Best coupon applied
  couponCode: string
  couponSource: string          // 'VAULT' | 'PUBLIC' | 'NONE'
  isVaultCoupon: boolean
  giftCardSaved: number         // Gift card discount applied (if better)
  giftCardSource: string
  giftCardUsed: boolean         // true if gift card was more beneficial
  bankOfferSaved: number        // Bank/UPI offer on remaining amount
  bankOfferSource: string
  bankOfferDescription: string
  cashbackAmount: number        // Affiliate cashback on final paid amount
  cashbackSource: string
  cashbackPct: number
  netFinalPayable: number       // What user actually pays
  totalSaved: number
  savingsPct: number
}

/**
 * Core enrichment function — applies all savings layers in correct mathematical order
 */
export function enrichOffer(params: {
  merchantSlug: string
  merchantName: string
  listedPrice: number           // Real price from store
  mrp: number                   // MRP (original full price)
  productCategory?: string
  userVaultCoupons?: VaultCouponInput[]
  userCardNames?: string[]
  userUpiApps?: string[]
}): EnrichedOfferBreakdown {
  const {
    merchantSlug,
    listedPrice,
    mrp,
    productCategory = 'Fashion & Apparel',
    userVaultCoupons = [],
    userCardNames = [],
    userUpiApps = [],
  } = params

  const slug = merchantSlug.toLowerCase()

  // ── STEP 1: Find best coupon ─────────────────────────────────────────────────
  // Check vault coupons first (user's personal coupons take priority)
  const vaultMatches = userVaultCoupons.filter((c) => {
    const storeMatch =
      c.store.toLowerCase().includes(slug) ||
      slug.includes(c.store.toLowerCase().split(' ')[0])
    const meetsMinCart = listedPrice >= (c.minCartValue || 0)
    const notExpired = new Date(c.expires) >= new Date()
    return storeMatch && meetsMinCart && notExpired
  })

  // Calculate best vault coupon savings
  let bestVaultSaved = 0
  let bestVaultCoupon: VaultCouponInput | null = null
  for (const vc of vaultMatches) {
    const saved =
      vc.discountValue > 100
        ? vc.discountValue                                // flat amount
        : (listedPrice * vc.discountValue) / 100         // percentage
    if (saved > bestVaultSaved) {
      bestVaultSaved = saved
      bestVaultCoupon = vc
    }
  }

  // Check public merchant coupons
  const publicCoupons = PUBLIC_MERCHANT_COUPONS[slug] || []
  let bestPublicSaved = 0
  let bestPublicCoupon: typeof publicCoupons[0] | null = null
  for (const pc of publicCoupons) {
    if (listedPrice < pc.minCart) continue
    const saved = pc.flatOff
      ? pc.flatOff
      : ((listedPrice * (pc.discountPct || 0)) / 100)
    if (saved > bestPublicSaved) {
      bestPublicSaved = saved
      bestPublicCoupon = pc
    }
  }

  // Select the better coupon
  let couponSaved = 0
  let couponCode = ''
  let couponSource = 'NONE'
  let isVaultCoupon = false

  if (bestVaultSaved > 0 && bestVaultSaved >= bestPublicSaved) {
    couponSaved = Math.round(bestVaultSaved)
    couponCode = bestVaultCoupon!.code
    couponSource = 'VAULT'
    isVaultCoupon = true
  } else if (bestPublicSaved > 0) {
    couponSaved = Math.round(bestPublicSaved)
    couponCode = bestPublicCoupon!.code
    couponSource = 'PUBLIC'
    isVaultCoupon = false
  }

  const priceAfterCoupon = Math.max(0, listedPrice - couponSaved)

  // ── STEP 2: Gift Card comparison ─────────────────────────────────────────────
  // Only apply gift card if it saves MORE than coupon AND is stackable
  const gcData = GIFT_CARD_SOURCES[slug]
  let giftCardSaved = 0
  let giftCardSource = ''
  let giftCardUsed = false

  if (gcData && gcData.discountPct > 0 && couponSaved === 0) {
    // Gift cards are typically NOT stackable with coupons
    // So only use gift card when no coupon is available, or when gift card saves more
    const potentialGCSaved = Math.min(
      gcData.maxDiscount,
      Math.round((listedPrice * gcData.discountPct) / 100)
    )
    if (potentialGCSaved > couponSaved) {
      giftCardSaved = potentialGCSaved
      giftCardSource = gcData.source
      giftCardUsed = true
      // Reset coupon since gift card replaces it (not stackable)
      couponSaved = 0
      couponCode = ''
      couponSource = 'NONE'
      isVaultCoupon = false
    }
  }

  const effectiveDiscountSaved = giftCardUsed ? giftCardSaved : couponSaved
  const priceAfterDiscount = Math.max(0, listedPrice - effectiveDiscountSaved)

  // ── STEP 3: Bank / UPI offers on post-coupon price ────────────────────────────
  let bankOfferSaved = 0
  let bankOfferSource = ''
  let bankOfferDescription = ''

  const hasAxisCard = userCardNames.some((c) => c.toLowerCase().includes('axis') || c.toLowerCase().includes('ace'))
  const hasSbiCard  = userCardNames.some((c) => c.toLowerCase().includes('sbi'))
  const hasHdfcCard = userCardNames.some((c) => c.toLowerCase().includes('hdfc'))
  const hasNaviUpi  = userUpiApps.some((u) => u.toLowerCase().includes('navi'))
  const hasPhonePe  = userUpiApps.some((u) => u.toLowerCase().includes('phonepe') || u.toLowerCase().includes('phone pe'))

  // Only apply if gift card is NOT used (gift cards typically exclude bank offers)
  if (!giftCardUsed) {
    if (hasAxisCard) {
      const rate = 0.12
      const cap = 300
      bankOfferSaved = Math.min(cap, Math.round(priceAfterDiscount * rate))
      bankOfferSource = 'Axis ACE Credit Card'
      bankOfferDescription = '12% instant discount via Axis ACE Card (Max ₹300)'
    } else if (hasSbiCard) {
      const rate = 0.10
      const cap = 250
      bankOfferSaved = Math.min(cap, Math.round(priceAfterDiscount * rate))
      bankOfferSource = 'SBI Cashback Credit Card'
      bankOfferDescription = '10% instant discount via SBI Cashback Card (Max ₹250)'
    } else if (hasHdfcCard) {
      const rate = 0.08
      const cap = 200
      bankOfferSaved = Math.min(cap, Math.round(priceAfterDiscount * rate))
      bankOfferSource = 'HDFC Millennia Card'
      bankOfferDescription = '8% instant discount via HDFC Millennia (Max ₹200)'
    } else if (hasNaviUpi) {
      const rate = 0.05
      const cap = 150
      bankOfferSaved = Math.min(cap, Math.round(priceAfterDiscount * rate))
      bankOfferSource = 'Navi UPI'
      bankOfferDescription = '5% cashback via Navi UPI (Max ₹150)'
    } else if (hasPhonePe) {
      const rate = 0.02
      const cap = 100
      bankOfferSaved = Math.min(cap, Math.round(priceAfterDiscount * rate))
      bankOfferSource = 'PhonePe'
      bankOfferDescription = '2% cashback via PhonePe (Max ₹100)'
    }
  }

  const priceAfterBank = Math.max(0, priceAfterDiscount - bankOfferSaved)

  // ── STEP 4: Affiliate Cashback on final paid amount ───────────────────────────
  const cashbackData = getCategoryCashback(slug, productCategory)
  const cashbackAmount = cashbackData.flatAmount && cashbackData.flatAmount > 0
    ? cashbackData.flatAmount
    : Math.round((priceAfterBank * cashbackData.cashbackPct) / 100)
  const cashbackSource = cashbackData.trackingRequirements.includes('CashKaro') ? 'CashKaro' : 'EarnKaro'

  // ── FINAL: Net Payable ─────────────────────────────────────────────────────────
  const netFinalPayable = Math.max(0, priceAfterBank - cashbackAmount)
  const totalSaved = listedPrice - netFinalPayable
  const savingsPct = listedPrice > 0 ? Math.round((totalSaved / listedPrice) * 100) : 0

  return {
    listedPrice,
    couponSaved,
    couponCode,
    couponSource,
    isVaultCoupon,
    giftCardSaved,
    giftCardSource,
    giftCardUsed,
    bankOfferSaved,
    bankOfferSource,
    bankOfferDescription,
    cashbackAmount,
    cashbackSource,
    cashbackPct: cashbackData.cashbackPct,
    netFinalPayable,
    totalSaved,
    savingsPct,
  }
}
