import { NextResponse } from 'next/server'
import { COMPARISON_PRODUCTS } from '../../../../../../lib/data/products'

/**
 * GET /api/v1/products/[id]/prices
 *
 * Returns current prices across all retailers for a product, sorted ascending.
 * Useful for quick price-bar UI components.
 *
 * Phase 1: From static catalog.
 * Phase 2: Will query retailer_products table joined with retailers.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const product = COMPARISON_PRODUCTS.find((p) => p.id === id)

  if (!product) {
    return NextResponse.json({ error: `Product not found: ${id}` }, { status: 404 })
  }

  const prices = product.offers
    .map((offer) => ({
      retailerSlug: offer.merchantSlug,
      retailerName: offer.merchantName,
      mrp: offer.mrp,
      currentPrice: offer.currentPrice,
      netFinalPayable: offer.netFinalPayable,
      discountPct: offer.discountPct,
      inStock: offer.stockStatus === 'IN_STOCK',
      deliveryEstimate: offer.deliveryEstimate,
    }))
    .sort((a, b) => a.netFinalPayable - b.netFinalPayable)

  return NextResponse.json({
    productId: id,
    prices,
    cheapest: prices[0] ?? null,
    retrievedAt: new Date().toISOString(),
  })
}
