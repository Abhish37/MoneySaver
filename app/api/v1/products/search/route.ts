import { NextResponse } from 'next/server'
import { getCachedSearch, setCachedSearch } from '../../../../../backend/cache/searchCache'
import { resolveIntent } from '../../../../../backend/query-understanding'

// ─── SerpAPI Response Shape ────────────────────────────────────────────────────
interface SerpShoppingItem {
  position: number
  title: string
  link: string
  source: string
  price?: string
  extracted_price?: number
  old_price?: string
  extracted_old_price?: number
  rating?: number
  reviews?: number
  thumbnail?: string
  extensions?: string[]
}

// ─── Output Shape ─────────────────────────────────────────────────────────────
export interface RetailerListing {
  retailerName: string
  retailerSlug: string
  currentPrice: number
  mrp: number
  discountPct: number
  listingUrl: string
  inStock: boolean
  deliveryText: string
  rawOffers: string[]
  rating?: number
  reviews?: number
}

export interface SearchProductCard {
  id: string
  title: string
  brand: string
  category: string
  imageUrl: string
  listings: RetailerListing[]
}

export interface SearchAPIResponse {
  query: string
  source: 'SERP_LIVE' | 'KNOWLEDGE_BASE'
  results: SearchProductCard[]
  fromCache: boolean
  searchDurationMs: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Constructs a verified direct search URL for known Indian retailers.
 * We do NOT rely on SerpAPI's `link` field (which can be a Google Shopping
 * intermediary page). Instead we build the real retailer URL ourselves.
 */
function buildRetailerUrl(retailerName: string, productTitle: string, serpApiLink: string): string {
  const encoded = encodeURIComponent(productTitle)

  if (serpApiLink) {
    try {
      if (serpApiLink.includes('google.com/url')) {
        const u = new URL(serpApiLink)
        const target = u.searchParams.get('url') || u.searchParams.get('q')
        if (target && target.startsWith('http') && !target.includes('google.com/shopping')) {
          return target
        }
      }
      if (serpApiLink.startsWith('https://') && !serpApiLink.includes('google.com/shopping')) {
        return serpApiLink
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  const r = (retailerName || '').toLowerCase()
  if (r.includes('amazon'))         return `https://www.amazon.in/s?k=${encoded}`
  if (r.includes('flipkart'))       return `https://www.flipkart.com/search?q=${encoded}`
  if (r.includes('nykaa'))          return `https://www.nykaa.com/search/result/?q=${encoded}&root=search`
  if (r.includes('myntra'))         return `https://www.myntra.com/${encoded}`
  if (r.includes('ajio'))           return `https://www.ajio.com/search/?text=${encoded}`
  if (r.includes('croma'))          return `https://www.croma.com/searchB?q=${encoded}`
  if (r.includes('reliance'))       return `https://www.reliancedigital.in/search?q=${encoded}`
  if (r.includes('meesho'))         return `https://www.meesho.com/search?q=${encoded}`
  if (r.includes('bigbasket'))      return `https://www.bigbasket.com/ps/?q=${encoded}`
  if (r.includes('healthkart') || r.includes('health kart')) return `https://www.healthkart.com/shop/search?q=${encoded}`
  if (r.includes('blinkit'))        return `https://blinkit.com/s/?q=${encoded}`
  if (r.includes('jiomart'))        return `https://www.jiomart.com/search/${encoded}`
  if (r.includes('tata'))           return `https://www.tatacliq.com/search/?searchCategory=all&text=${encoded}`
  if (r.includes('decathlon'))      return `https://www.decathlon.in/search?Ntt=${encoded}`
  if (r.includes('pepperfry'))      return `https://www.pepperfry.com/site-search.html#q=${encoded}`
  if (r.includes('boat'))           return `https://www.boat-lifestyle.com/search?q=${encoded}`
  if (r.includes('samsung'))        return `https://www.samsung.com/in/smartphones/all-smartphones/?galaxy=${encoded}`
  if (r.includes('apple'))          return `https://www.apple.com/in/search/${encoded}?src=serp`

  return `https://www.google.com/search?q=${encoded}+buy+online+india`
}

function cleanSourceName(source: string): string {
  if (!source) return 'Unknown'
  return source
    .replace(/\.in$/i, '')
    .replace(/\.com$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBrand(title: string): string {
  if (!title) return 'Unknown'
  const knownBrands = [
    'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Realme', 'Vivo', 'OPPO', 'Nothing',
    'Foxtale', 'Minimalist', 'Plum', 'Mamaearth', 'WOW', 'Neutrogena', 'CeraVe', 'Cetaphil',
    "L'Oreal", 'Nivea', 'Himalaya', 'Biotique', 'Dot & Key', 'MCaffeine', 'mCaffeine',
    'MuscleBlaze', 'GNC', 'HealthKart', 'HK Vitals', 'Oziva', 'Optimum Nutrition',
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Decathlon', 'Woodland',
    'Sony', 'LG', 'Panasonic', 'Philips', 'Bosch', 'JBL', 'Boat', 'Noise', 'Titan'
  ]
  const lowerTitle = title.toLowerCase()
  for (const brand of knownBrands) {
    if (lowerTitle.startsWith(brand.toLowerCase())) return brand
  }
  return title.split(' ')[0] || 'Unknown'
}

function detectCategory(titleAndQuery: string): string {
  if (!titleAndQuery) return 'Shopping'
  const t = titleAndQuery.toLowerCase()
  if (/iphone|samsung|pixel|oneplus|realme|xiaomi|vivo|oppo|nothing|phone|laptop|macbook|tablet|earphone|earbuds|headphone|airpods|watch|camera|tv|television|monitor|keyboard|mouse/.test(t)) return 'Electronics'
  if (/serum|moisturizer|moisturiser|lotion|cream|sunscreen|toner|cleanser|shampoo|conditioner|mask|lipstick|foundation|blush|kajal|eyeliner|skincare|hair care|nykaa|hyaluronic|niacinamide|retinol|vitamin c face|spf/.test(t)) return 'Beauty & Skincare'
  if (/protein|whey|creatine|vitamin|supplement|capsule|tablet|medicine|health|wellness|nutrition|probiotic|omega|biotin|collagen/.test(t)) return 'Health & Wellness'
  if (/shoe|sneaker|sandal|boot|slipper|heel|loafer|shirt|dress|kurta|jeans|legging|saree|kurti|top|t-shirt|fashion|clothing|apparel|watch|bag|handbag/.test(t)) return 'Fashion'
  if (/grocery|vegetable|fruit|milk|bread|oil|rice|atta|dal|snack|biscuit|chocolate|coffee|tea|juice/.test(t)) return 'Food & Grocery'
  return 'Shopping'
}

/**
 * Strict relevance filter to drop mismatched products and accessories.
 */
function isRelevant(title: string, query: string): boolean {
  if (!title || !query) return false
  const qTerms = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
  const tTerms = title.toLowerCase().replace(/[^\w\s]/g, '')
  
  // Strict check: Any query term containing a digit MUST be in the title
  const numericTerms = qTerms.filter(t => /\d/.test(t))
  for (const nt of numericTerms) {
    if (!tTerms.includes(nt)) return false
  }

  // Filter out cheap accessories if the user didn't explicitly search for them
  const isAccessorySearch = /case|cover|silicone|sleeve|tip|replacement|cable/.test(query.toLowerCase())
  if (!isAccessorySearch) {
    const tLower = title.toLowerCase()
    if (/case|cover|silicone|sleeve|replacement ear|ear tips/.test(tLower)) {
      return false
    }
    
    // Aggressively filter out titles like "Earbuds for Realme..." or "Case for iPhone..."
    // If the title contains " for " followed by a brand or core keyword from the query, it is an accessory.
    // We check if " for " is immediately followed by any of the query terms.
    for (const qt of qTerms) {
      if (qt.length > 3 && tLower.includes(` for ${qt}`)) {
        return false
      }
    }
  }

  return true
}

/** 
 * Canonical key for grouping similar products together.
 * Takes first 4 meaningful words of lowercased title.
 */
function getGroupKey(title: string): string {
  if (!title) return 'unknown'
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'with', 'by', 'in', 'of', 'to', 'at', 'on', 'pack', 'combo'])
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w))
    .slice(0, 4)
    .join(' ')
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query "q" is required (min 2 chars).' }, { status: 400 })
  }

  // 1. Check Redis cache
  const cached = await getCachedSearch(query).catch(() => null)
  if (cached) {
    return NextResponse.json({ ...(cached as object), fromCache: true })
  }

  const SERPAPI_KEY = process.env.SERPAPI_KEY

  // 2. Try SerpAPI live search
  if (SERPAPI_KEY) {
    try {
      const serpUrl = new URL('https://serpapi.com/search.json')
      serpUrl.searchParams.set('engine', 'google_shopping')
      serpUrl.searchParams.set('q', query)
      serpUrl.searchParams.set('gl', 'in')
      serpUrl.searchParams.set('hl', 'en')
      serpUrl.searchParams.set('num', '20')
      serpUrl.searchParams.set('api_key', SERPAPI_KEY)

      const res = await fetch(serpUrl.toString(), {
        signal: AbortSignal.timeout(12000),
      })

      if (!res.ok) {
        throw new Error(`SerpAPI HTTP ${res.status}`)
      }

      const data = await res.json()
      const shoppingItems: SerpShoppingItem[] = data.shopping_results || []

      if (shoppingItems.length > 0) {
        const cards = buildProductCards(shoppingItems, query)

        if (cards.length > 0) {
          const response: SearchAPIResponse = {
            query,
            source: 'SERP_LIVE',
            results: cards.slice(0, 5),
            fromCache: false,
            searchDurationMs: Date.now() - startTime,
          }
          await setCachedSearch(query, response).catch(() => {})
          return NextResponse.json(response)
        }
      }
    } catch (err) {
      console.error('[Search] SerpAPI error:', err instanceof Error ? err.message : err)
      // Fall through to Knowledge Base fallback
    }
  }

  // 3. Knowledge Base fallback
  return buildFallbackResponse(query, startTime)
}

// ─── SerpAPI Result Grouping ──────────────────────────────────────────────────
function buildProductCards(items: SerpShoppingItem[], query: string): SearchProductCard[] {
  // Group similar products
  const groups = new Map<string, { lead: SerpShoppingItem; items: (SerpShoppingItem & { cleanSource: string })[] }>()

  for (const item of items) {
    const price = item.extracted_price
    if (!price || price <= 0) continue
    if (!isRelevant(item.title, query)) continue

    const cleanSource = cleanSourceName(item.source)
    const key = getGroupKey(item.title)
    const existing = groups.get(key)

    if (existing) {
      existing.items.push({ ...item, cleanSource })
    } else {
      groups.set(key, {
        lead: item,
        items: [{ ...item, cleanSource }],
      })
    }
  }

  const cards: SearchProductCard[] = []

  for (const [, group] of Array.from(groups)) {
    const lead = group.lead
    const category = detectCategory(lead.title + ' ' + query)
    const brand = extractBrand(lead.title)

    // Deduplicate by retailer — keep lowest price per retailer
    const byRetailer = new Map<string, SerpShoppingItem & { cleanSource: string }>()
    for (const item of group.items) {
      const existing = byRetailer.get(item.cleanSource)
      if (!existing || (item.extracted_price! < existing.extracted_price!)) {
        byRetailer.set(item.cleanSource, item)
      }
    }

    const listings: RetailerListing[] = Array.from(byRetailer.values()).map(item => {
      const price = item.extracted_price!
      const mrp = item.extracted_old_price
        ? item.extracted_old_price
        : Math.round(price * (category === 'Electronics' ? 1.12 : 1.2))
      const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0

      const extensions = item.extensions || []
      const deliveryText = extensions.find(e => /deliver|ship|free/i.test(e)) || 'Standard Delivery'
      const rawOffers = extensions.filter(e => !/deliver|ship|free/i.test(e)).slice(0, 3)

      return {
        retailerName: item.cleanSource,
        retailerSlug: slugify(item.cleanSource),
        currentPrice: price,
        mrp,
        discountPct,
        listingUrl: buildRetailerUrl(item.cleanSource, item.title, item.link || ''),
        inStock: true,
        deliveryText,
        rawOffers,
        rating: item.rating,
        reviews: item.reviews,
      }
    }).sort((a, b) => a.currentPrice - b.currentPrice)

    if (listings.length === 0) continue

    cards.push({
      id: `serp_${slugify(lead.title).slice(0, 25)}_${cards.length}`,
      title: lead.title,
      brand,
      category,
      imageUrl: lead.thumbnail || '',
      listings,
    })
  }

  return cards
}

// ─── Knowledge Base Fallback ──────────────────────────────────────────────────
function buildFallbackResponse(query: string, startTime: number) {
  const intents = resolveIntent(query)

  const results: SearchProductCard[] = intents.slice(0, 4).map((intent, i) => {
    const cat = intent.category
    const base = intent.basePrice

    const retailerDefs = [
      { name: 'Amazon India', slug: 'amazon', f: 1.00 },
      { name: 'Flipkart',     slug: 'flipkart', f: 1.02 },
      {
        name: cat === 'Beauty' ? 'Nykaa' : cat === 'Fashion' ? 'Myntra' : 'Croma',
        slug: cat === 'Beauty' ? 'nykaa' : cat === 'Fashion' ? 'myntra' : 'croma',
        f: 1.04,
      },
      {
        name: cat === 'Health & Wellness' ? 'HealthKart' : 'Reliance Digital',
        slug: cat === 'Health & Wellness' ? 'healthkart' : 'reliance',
        f: 1.03,
      },
    ]

    const listings: RetailerListing[] = retailerDefs.map(r => {
      // Tiny deterministic price variance per retailer (no Math.random — stable)
      const price = Math.round(base * r.f)
      const mrp  = Math.round(price * 1.2)
      return {
        retailerName:  r.name,
        retailerSlug:  r.slug,
        currentPrice:  price,
        mrp,
        discountPct:   Math.round(((mrp - price) / mrp) * 100),
        listingUrl:    `https://www.${r.slug === 'amazon' ? 'amazon.in' : r.slug + '.com'}/search?q=${encodeURIComponent(intent.title)}`,
        inStock:       true,
        deliveryText:  'Free Delivery',
        rawOffers:     [],
      }
    }).sort((a, b) => a.currentPrice - b.currentPrice)

    return {
      id:       `kb_${i}`,
      title:    intent.title,
      brand:    intent.brand,
      category: intent.category,
      imageUrl: '',
      listings,
    }
  })

  return NextResponse.json({
    query,
    source: 'KNOWLEDGE_BASE',
    results,
    fromCache: false,
    searchDurationMs: Date.now() - startTime,
  } as SearchAPIResponse)
}
