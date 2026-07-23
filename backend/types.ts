/**
 * Shared TypeScript interfaces for the entire backend pipeline.
 * All workers, the normalizer, matcher, and API routes consume these types.
 */

// ─── Raw Scraper Output ──────────────────────────────────────────────────────

/** Raw listing as returned by a worker's parse() method — before normalization */
export interface RawScrapedListing {
  retailerSlug: string
  query: string
  title: string
  url: string
  imageUrl?: string
  mrp?: number
  currentPrice: number
  sellerName?: string
  inStock: boolean
  deliveryText?: string
  /** Raw coupon/offer text snippets extracted from the page */
  rawOfferTexts: string[]
  scrapedAt: string // ISO 8601
}

// ─── Normalized Product ──────────────────────────────────────────────────────

/** A fully normalized product variant after the normalizer processes raw output */
export interface NormalizedProduct {
  title: string
  brand: string
  modelNumber?: string
  category: string
  attributes: Record<string, string> // { storage: "256GB", color: "Black" }
  imageUrl?: string
  variants: NormalizedVariant[]
}

export interface NormalizedVariant {
  variantLabel: string
  variantAttributes: Record<string, string>
  retailerListings: NormalizedRetailerListing[]
}

export interface NormalizedRetailerListing {
  retailerSlug: string
  retailerName: string
  listingTitle: string
  listingUrl: string
  mrp: number
  currentPrice: number
  sellerName?: string
  inStock: boolean
  deliveryEstimate?: string
  parsedOffers: ParsedOffer[]
  scrapedAt: string
}

export interface ParsedOffer {
  type: 'COUPON' | 'BANK_OFFER' | 'CASHBACK' | 'GIFT_CARD' | 'COMBO'
  code?: string
  discountType: 'PERCENTAGE' | 'FLAT'
  discountValue: number
  maxDiscount?: number
  minCartValue?: number
  description: string
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface ProductSearchResponse {
  query: string
  correctedQuery?: string
  results: ProductSearchResult[]
  fromCache: boolean
  cacheExpiresAt?: string
  searchDurationMs: number
}

export interface ProductSearchResult {
  productId: string
  title: string
  brand: string
  category: string
  imageUrl?: string
  bestPrice: number
  bestRetailer: string
  mrp: number
  savingsPercent: number
  retailerCount: number
  listings: RetailerListing[]
}

export interface RetailerListing {
  retailerSlug: string
  retailerName: string
  currentPrice: number
  mrp: number
  netFinalPayable: number
  totalSaved: number
  couponCode?: string
  bankOfferDescription?: string
  cashbackSource?: string
  listingUrl: string
  deliveryEstimate?: string
  inStock: boolean
  lastUpdatedAt: string
}

export interface PriceHistoryPoint {
  retailerSlug: string
  price: number
  capturedAt: string
}
