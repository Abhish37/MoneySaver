import { NextResponse } from 'next/server'

/**
 * GET /api/v1/products/[id]/history
 *
 * Returns price history data for a product variant across retailers.
 * Used for price charts and lowest-ever price display.
 *
 * Phase 1: Returns empty history (price_history table is empty until Phase 2 scrapers run).
 * Phase 2: Will query the price_history table with index on (product_variant_id, captured_at DESC).
 *
 * Query params:
 *   days     - Number of days of history to return (default: 30)
 *   retailer - Filter by retailer slug (optional)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)
  const retailer = searchParams.get('retailer') ?? null

  if (!id) {
    return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 })
  }

  // Phase 2: Replace with DB query
  // SELECT price, retailer_id, captured_at
  // FROM price_history
  // WHERE product_variant_id = $1
  //   AND captured_at >= NOW() - INTERVAL '$2 days'
  //   AND ($3::text IS NULL OR retailer_id = (SELECT id FROM retailers WHERE slug = $3))
  // ORDER BY captured_at DESC

  return NextResponse.json({
    productId: id,
    days,
    retailerFilter: retailer,
    history: [],
    message: 'Price history will be populated once live scraper workers are active (Phase 2).',
    retrievedAt: new Date().toISOString(),
  })
}
