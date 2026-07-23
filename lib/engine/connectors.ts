import { COMPARISON_PRODUCTS, ComparisonProduct, MerchantProductOffer } from '../data/products'

export interface StepByStepCalculation {
  basePrice: number
  merchantDiscount: number
  priceAfterMerchantDiscount: number
  couponDiscount: number
  couponCode?: string
  priceAfterCoupon: number
  bankDiscount: number
  bankName?: string
  giftCardDiscount: number
  cashbackAmount: number
  cashbackProvider?: string
  netFinalPayable: number
}

export interface UniversalProductSearchResult {
  product: ComparisonProduct
  offers: Array<{
    offer: MerchantProductOffer
    stepByStep: StepByStepCalculation
  }>
}

export interface MerchantConnector {
  merchantSlug: string
  merchantName: string
  merchantLogo: string
  searchProductCatalog: (query: string) => Promise<MerchantProductOffer[]>
}

/**
 * Parallel Merchant Connector Aggregator Engine
 * Runs async parallel catalog searches across all supported merchant connectors concurrently.
 */
export async function executeParallelMerchantSearch(query: string): Promise<UniversalProductSearchResult[]> {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  // Simulate parallel asynchronous connector queries (e.g. Amazon Connector, Flipkart Connector, Nykaa Connector, Foxtale Connector)
  const matchedProducts = COMPARISON_PRODUCTS.filter((prod) => {
    return (
      prod.title.toLowerCase().includes(cleanQuery) ||
      prod.category.toLowerCase().includes(cleanQuery) ||
      prod.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))
    )
  })

  // Execute parallel calculations concurrently
  const searchPromises = matchedProducts.map(async (product) => {
    const calculatedOffers = product.offers.map((offer) => {
      const merchantDiscount = Math.max(0, offer.mrp - offer.currentPrice)
      const priceAfterMerchantDiscount = offer.currentPrice
      const priceAfterCoupon = Math.max(0, priceAfterMerchantDiscount - (offer.couponDiscount || 0))

      const stepByStep: StepByStepCalculation = {
        basePrice: offer.mrp,
        merchantDiscount,
        priceAfterMerchantDiscount,
        couponDiscount: offer.couponDiscount || 0,
        couponCode: offer.couponCode,
        priceAfterCoupon,
        bankDiscount: offer.bankOfferDiscount || 0,
        bankName: offer.bankOfferDiscount > 0 ? 'Instant Bank Card Offer' : undefined,
        giftCardDiscount: offer.giftCardDiscount || 0,
        cashbackAmount: offer.cashbackAmount || 0,
        cashbackProvider: offer.cashbackAmount > 0 ? 'CashKaro / EarnKaro' : undefined,
        netFinalPayable: offer.netFinalPayable,
      }

      return {
        offer,
        stepByStep,
      }
    })

    // Sort offers by lowest net final payable amount
    calculatedOffers.sort((a, b) => a.stepByStep.netFinalPayable - b.stepByStep.netFinalPayable)

    return {
      product,
      offers: calculatedOffers,
    }
  })

  return Promise.all(searchPromises)
}

export function executeUniversalProductSearch(query: string): UniversalProductSearchResult[] {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const matchedProducts = COMPARISON_PRODUCTS.filter((prod) => {
    return (
      prod.title.toLowerCase().includes(cleanQuery) ||
      prod.category.toLowerCase().includes(cleanQuery) ||
      prod.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery))
    )
  })

  return matchedProducts.map((product) => {
    const calculatedOffers = product.offers.map((offer) => {
      const merchantDiscount = Math.max(0, offer.mrp - offer.currentPrice)
      const priceAfterMerchantDiscount = offer.currentPrice
      const priceAfterCoupon = Math.max(0, priceAfterMerchantDiscount - (offer.couponDiscount || 0))

      const stepByStep: StepByStepCalculation = {
        basePrice: offer.mrp,
        merchantDiscount,
        priceAfterMerchantDiscount,
        couponDiscount: offer.couponDiscount || 0,
        couponCode: offer.couponCode,
        priceAfterCoupon,
        bankDiscount: offer.bankOfferDiscount || 0,
        bankName: offer.bankOfferDiscount > 0 ? 'Instant Bank Card Offer' : undefined,
        giftCardDiscount: offer.giftCardDiscount || 0,
        cashbackAmount: offer.cashbackAmount || 0,
        cashbackProvider: offer.cashbackAmount > 0 ? 'CashKaro / EarnKaro' : undefined,
        netFinalPayable: offer.netFinalPayable,
      }

      return {
        offer,
        stepByStep,
      }
    })

    calculatedOffers.sort((a, b) => a.stepByStep.netFinalPayable - b.stepByStep.netFinalPayable)

    return {
      product,
      offers: calculatedOffers,
    }
  })
}
