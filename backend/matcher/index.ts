import { NormalizedProduct, NormalizedVariant } from '../types'

/**
 * Product Matcher
 *
 * Given normalized product data from multiple retailers, determines whether
 * they represent the same canonical product and groups them accordingly.
 *
 * Matching Priority (from the refactoring spec):
 * 1. PRIMARY:   Model Number exact match
 * 2. SECONDARY: Brand + Storage + RAM + Color attribute matching
 * 3. FALLBACK:  Embedding similarity (Phase 3 — requires pgvector)
 *
 * PHASE 1 STATUS: Primary (model number) and Secondary (attribute) matching implemented.
 * Phase 3 will add embedding-based fallback via pgvector.
 */

export interface MatchResult {
  canonicalTitle: string
  brand: string
  mergedVariants: NormalizedVariant[]
  matchMethod: 'MODEL_NUMBER' | 'BRAND_ATTRIBUTES' | 'TITLE_SIMILARITY' | 'NO_MATCH'
  confidence: number
}

/** Extract model number from a product title using common patterns */
function extractModelNumber(title: string): string | null {
  // Matches: iPhone 15 Pro, Galaxy S24+, Buds2 Pro, 16T, SM-S928B, etc.
  const patterns = [
    /\b([A-Z]{1,4}[-\s]?\d{2,6}[A-Z0-9]*)\b/,
    /\b(Buds\d+\s*(?:Pro|Plus|FE)?)\b/i,
    /\b(iPhone\s+\d+(?:\s+(?:Pro|Plus|Max|Mini))?)\b/i,
    /\b(Galaxy\s+[A-Z]\d+\+?(?:\s+(?:Ultra|Plus|FE))?)\b/i,
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) return match[1].toUpperCase().replace(/\s+/g, '')
  }
  return null
}

/** Score how similar two attribute sets are (0.0 to 1.0) */
function attributeSimilarity(
  a: Record<string, string>,
  b: Record<string, string>
): number {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  const allKeys = new Set([...keysA, ...keysB])
  if (allKeys.size === 0) return 0

  let matches = 0
  for (const key of Array.from(allKeys)) {
    if (a[key]?.toLowerCase() === b[key]?.toLowerCase()) matches++
  }
  return matches / allKeys.size
}

/**
 * Match and merge normalized products from multiple retailers.
 * Input: array of NormalizedProduct (one per retailer)
 * Output: MatchResult grouping them into canonical products
 */
export function matchProducts(products: NormalizedProduct[]): MatchResult[] {
  if (products.length === 0) return []

  const results: MatchResult[] = []
  const used = new Set<number>()

  for (let i = 0; i < products.length; i++) {
    if (used.has(i)) continue
    used.add(i)

    const base = products[i]
    const baseModel = extractModelNumber(base.title)
    const mergedVariants: NormalizedVariant[] = [...base.variants]

    let matchMethod: MatchResult['matchMethod'] = 'NO_MATCH'
    let confidence = 0.5

    for (let j = i + 1; j < products.length; j++) {
      if (used.has(j)) continue
      const candidate = products[j]
      const candidateModel = extractModelNumber(candidate.title)

      // 1. Primary: Model Number match
      if (baseModel && candidateModel && baseModel === candidateModel) {
        mergedVariants.push(...candidate.variants)
        used.add(j)
        matchMethod = 'MODEL_NUMBER'
        confidence = 0.99
        continue
      }

      // 2. Secondary: Brand + attributes match
      const sameBrand =
        base.brand.toLowerCase() === candidate.brand.toLowerCase() && base.brand.length > 2
      if (sameBrand) {
        const attrScore = attributeSimilarity(base.attributes, candidate.attributes)
        if (attrScore >= 0.6) {
          mergedVariants.push(...candidate.variants)
          used.add(j)
          matchMethod = matchMethod === 'MODEL_NUMBER' ? 'MODEL_NUMBER' : 'BRAND_ATTRIBUTES'
          confidence = Math.max(confidence, 0.75 + attrScore * 0.2)
        }
      }

      // 3. Fallback: Title similarity (simple word overlap — Phase 3 replaces with embedding)
      const baseWords = new Set(base.title.toLowerCase().split(/\s+/))
      const candidateWords = candidate.title.toLowerCase().split(/\s+/)
      const overlap = candidateWords.filter((w) => baseWords.has(w)).length
      const titleSimilarity = overlap / Math.max(baseWords.size, candidateWords.length)

      if (titleSimilarity >= 0.7 && matchMethod === 'NO_MATCH') {
        mergedVariants.push(...candidate.variants)
        used.add(j)
        matchMethod = 'TITLE_SIMILARITY'
        confidence = 0.5 + titleSimilarity * 0.2
      }
    }

    results.push({
      canonicalTitle: base.title,
      brand: base.brand,
      mergedVariants,
      matchMethod,
      confidence,
    })
  }

  return results
}
