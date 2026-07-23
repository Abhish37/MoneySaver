export type SearchIntentType =
  | 'MERCHANT_SEARCH'
  | 'BRAND_SEARCH'
  | 'CATEGORY_SEARCH'
  | 'PRODUCT_SEARCH'
  | 'GENERIC_SHOPPING'

export interface ExtractedEntities {
  merchant?: string
  brand?: string
  category?: string
  productTitle?: string
  variantAttributes: string[]
  priceLimit?: number
}

export interface QueryUnderstandingResult {
  rawQuery: string
  normalizedQuery: string
  intent: SearchIntentType
  confidence: number
  entities: ExtractedEntities
  suggestedCorrection?: string
}

const KNOWN_MERCHANTS = [
  'myntra', 'ajio', 'meesho', 'decathlon', 'xyxx',
  'foxtale', 'mcaffeine', 'mamaearth', 'minimalist', 'nykaa',
  'muscleblaze', 'hkvitals', 'tata1mg',
  'amazon', 'flipkart', 'samsung', 'croma',
  'swiggy', 'zomato', 'blinkit', 'zepto',
  'makemytrip', 'cleartrip'
]

const KNOWN_BRANDS = [
  'samsung', 'apple', 'foxtale', 'mcaffeine', 'mamaearth', 'minimalist',
  'muscleblaze', 'decathlon', 'xyxx', 'oppo', 'nike', 'sephora', 'cult beauty'
]

const KNOWN_CATEGORIES = [
  'fashion', 'beauty', 'skincare', 'serum', 'protein', 'whey', 'health',
  'electronics', 'food', 'grocery', 'travel', 'shoes', 'running', 'earbuds', 'laptops'
]

const VARIANT_PATTERNS = [
  /(\d+\s*ml)/i,
  /(\d+\s*kg)/i,
  /(\d+\s*g)/i,
  /(\d+\s*gb)/i,
  /(pro|plus|ultra|max|air)/i,
]

/**
 * Universal Query Understanding Engine & Intent Classifier
 */
export function understandQuery(query: string): QueryUnderstandingResult {
  const rawQuery = query
  const normalizedQuery = query.trim().toLowerCase().replace(/[^\w\s]/gi, '')
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)

  if (!normalizedQuery) {
    return {
      rawQuery: '',
      normalizedQuery: '',
      intent: 'GENERIC_SHOPPING',
      confidence: 0,
      entities: { variantAttributes: [] },
    }
  }

  // 1. Entity Extraction
  const entities: ExtractedEntities = { variantAttributes: [] }

  // Detect Merchant
  const matchedMerchant = KNOWN_MERCHANTS.find(
    (m) => m === normalizedQuery || tokens.includes(m)
  )
  if (matchedMerchant) entities.merchant = matchedMerchant

  // Detect Brand
  const matchedBrand = KNOWN_BRANDS.find(
    (b) => b === normalizedQuery || tokens.includes(b)
  )
  if (matchedBrand) entities.brand = matchedBrand

  // Detect Category
  const matchedCategory = KNOWN_CATEGORIES.find((c) => tokens.includes(c))
  if (matchedCategory) entities.category = matchedCategory

  // Detect Variant Attributes (e.g. 30ml, 1kg, Pro)
  for (const pattern of VARIANT_PATTERNS) {
    const match = normalizedQuery.match(pattern)
    if (match) {
      entities.variantAttributes.push(match[0])
    }
  }

  // 2. Intent Classification Logic
  let intent: SearchIntentType = 'GENERIC_SHOPPING'
  let confidence = 0.85

  if (matchedMerchant && tokens.length === 1) {
    intent = 'MERCHANT_SEARCH'
    confidence = 0.99
  } else if (matchedBrand && tokens.length === 1) {
    intent = 'BRAND_SEARCH'
    confidence = 0.95
  } else if (matchedCategory && tokens.length <= 2 && !entities.brand) {
    intent = 'CATEGORY_SEARCH'
    confidence = 0.90
  } else if (tokens.length >= 2 || (matchedBrand && matchedCategory)) {
    intent = 'PRODUCT_SEARCH'
    confidence = 0.98
    entities.productTitle = rawQuery
  }

  return {
    rawQuery,
    normalizedQuery,
    intent,
    confidence,
    entities,
  }
}
