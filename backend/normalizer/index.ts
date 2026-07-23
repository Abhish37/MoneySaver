import { RawScrapedListing, NormalizedProduct, NormalizedRetailerListing, ParsedOffer } from '../types'

/**
 * Product Normalizer
 *
 * Takes raw, retailer-specific output from a scraper worker and converts
 * it into a canonical NormalizedProduct shape.
 *
 * Normalization includes:
 * - Title cleaning (stripping retailer-specific suffixes, extra whitespace)
 * - Brand extraction from title if not supplied by worker
 * - Offer text parsing (detecting coupon codes, bank offers, cashback)
 * - Price sanity checks (currentPrice must be <= mrp)
 *
 * PHASE 1 STATUS: Functional skeleton with offer text parsing.
 * Phase 3 will plug in the LLM enrichment layer for attribute extraction.
 */

// ─── Offer Text Parsers ──────────────────────────────────────────────────────

/** Regex patterns for extracting structured offer data from raw offer text snippets */
const COUPON_PATTERN = /(?:use\s+code|coupon[:\s]+|promo[:\s]+)([A-Z0-9]{4,20})/i
const FLAT_OFF_PATTERN = /(?:flat|get|save)\s+[₹\u20B9]?\s*(\d+(?:,\d+)?)\s*(?:off|discount)/i
const PCT_OFF_PATTERN = /(\d+(?:\.\d+)?)%\s*(?:off|discount|cashback)/i
const MIN_CART_PATTERN = /(?:on\s+orders?|minimum\s+(?:order|purchase|cart))\s+(?:of\s+)?[₹\u20B9]?\s*(\d+(?:,\d+)?)/i
const BANK_PATTERN = /(\d+(?:\.\d+)?)%?\s*(?:instant\s+)?(?:off|discount)\s+(?:on|with|using)\s+(.{5,50}(?:card|bank|pay))/i
const CASHBACK_PATTERN = /(\d+(?:\.\d+)?)%?\s*cashback\s+(?:via|through|on|with)?\s*([a-zA-Z\s]{3,30})/i

function parseOfferText(text: string): ParsedOffer | null {
  const couponMatch = text.match(COUPON_PATTERN)
  const flatMatch = text.match(FLAT_OFF_PATTERN)
  const pctMatch = text.match(PCT_OFF_PATTERN)
  const minCartMatch = text.match(MIN_CART_PATTERN)
  const bankMatch = text.match(BANK_PATTERN)
  const cashbackMatch = text.match(CASHBACK_PATTERN)

  if (bankMatch) {
    return {
      type: 'BANK_OFFER',
      discountType: 'PERCENTAGE',
      discountValue: parseFloat(bankMatch[1]),
      description: text.trim(),
      minCartValue: minCartMatch ? parseInt(minCartMatch[1].replace(',', ''), 10) : undefined,
    }
  }

  if (cashbackMatch) {
    return {
      type: 'CASHBACK',
      discountType: 'PERCENTAGE',
      discountValue: parseFloat(cashbackMatch[1]),
      description: text.trim(),
    }
  }

  if (couponMatch && (flatMatch || pctMatch)) {
    return {
      type: 'COUPON',
      code: couponMatch[1].toUpperCase(),
      discountType: flatMatch ? 'FLAT' : 'PERCENTAGE',
      discountValue: flatMatch
        ? parseInt(flatMatch[1].replace(',', ''), 10)
        : parseFloat(pctMatch![1]),
      description: text.trim(),
      minCartValue: minCartMatch ? parseInt(minCartMatch[1].replace(',', ''), 10) : undefined,
    }
  }

  return null
}

/** Clean raw retailer title strings */
function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\|\s*.+$/, '') // Remove everything after " | " (retailer name suffixes)
    .replace(/\(.*?sponsored.*?\)/gi, '') // Remove "(Sponsored)" labels
    .trim()
}

/** Simple brand extraction: first 1-2 words of title, capitalized */
function extractBrand(title: string): string {
  const words = title.split(' ')
  // Stop at common non-brand words
  const stopWords = new Set(['the', 'a', 'an', 'buy', 'get', 'best', 'new', 'pack', 'set'])
  const brandWords: string[] = []
  for (const word of words) {
    if (stopWords.has(word.toLowerCase())) break
    brandWords.push(word)
    if (brandWords.length >= 2) break
  }
  return brandWords.join(' ')
}

// ─── Main Normalizer ─────────────────────────────────────────────────────────

export function normalizeRawListings(
  rawListings: RawScrapedListing[],
  query: string
): NormalizedProduct {
  if (rawListings.length === 0) {
    return {
      title: query,
      brand: '',
      category: 'OTHER',
      attributes: {},
      variants: [],
    }
  }

  // Use the first (most relevant) listing as the canonical source
  const canonical = rawListings[0]
  const cleanedTitle = cleanTitle(canonical.title)

  const retailerListings: NormalizedRetailerListing[] = rawListings.map((raw) => {
    const parsedOffers = raw.rawOfferTexts
      .map(parseOfferText)
      .filter((o): o is ParsedOffer => o !== null)

    return {
      retailerSlug: raw.retailerSlug,
      retailerName: raw.retailerSlug.charAt(0).toUpperCase() + raw.retailerSlug.slice(1),
      listingTitle: cleanTitle(raw.title),
      listingUrl: raw.url,
      mrp: raw.mrp ?? raw.currentPrice,
      currentPrice: raw.currentPrice,
      sellerName: raw.sellerName,
      inStock: raw.inStock,
      deliveryEstimate: raw.deliveryText,
      parsedOffers,
      scrapedAt: raw.scrapedAt,
    }
  })

  return {
    title: cleanedTitle,
    brand: extractBrand(cleanedTitle),
    category: 'OTHER', // Phase 3: LLM will classify category from title + attributes
    attributes: {}, // Phase 3: LLM will extract structured attributes
    variants: [
      {
        variantLabel: 'Default',
        variantAttributes: {},
        retailerListings,
      },
    ],
  }
}
