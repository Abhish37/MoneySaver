import { NextResponse } from 'next/server'
import { getCachedProduct, setCachedProduct } from '../../../../../backend/cache/searchCache'
import { ProductSearchResponse, ProductSearchResult } from '../../../../../backend/types'
// import { db } from '../../../../../../lib/db'
// import { products, productVariants, retailerProducts } from '../../../../../../db/schema'
// import { eq } from 'drizzle-orm'

/**
 * GET /api/v1/products/[id]
 *
 * Fetch a canonical product with all its retailer listings.
 * Phase 2 Implementation: Queries the searchCache (for live generated IDs) or DB.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 })
  }

  // 1. Check direct product cache
  const cached = await getCachedProduct<ProductSearchResult & { fromCache: boolean }>(id)
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true })
  }

  // 2. If it's a live-generated ID from search (e.g., prod_live_0_123456789),
  // we would ideally look it up in the DB. Since we haven't wired the scraper
  // to save to the DB yet (Phase 2 focuses on live aggregation), we'll return a 404
  // if it's not in the Redis cache.
  // In a full production Phase 2.5, we would query the `products` and `retailer_products` tables here.

  return NextResponse.json(
    { error: `Product not found or expired from cache: ${id}` },
    { status: 404 }
  )
}
