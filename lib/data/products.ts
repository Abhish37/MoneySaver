export interface MerchantProductOffer {
  merchantName: string
  merchantSlug: string
  merchantLogo: string
  currentPrice: number
  mrp: number
  discountPct: number
  couponCode?: string
  couponDiscount: number
  bankOfferDiscount: number
  giftCardDiscount: number
  cashbackAmount: number
  netFinalPayable: number
  stockStatus: 'IN_STOCK' | 'LOW_STOCK'
  deliveryEstimate: string
  lastUpdated: string
  confidence: number
  explainabilityText: string
}

export interface ComparisonProduct {
  id: string
  title: string
  category: string
  imageUrl: string
  keywords: string[]
  offers: MerchantProductOffer[]
}

export const COMPARISON_PRODUCTS: ComparisonProduct[] = [
  {
    id: 'prod_foxtale_serum',
    title: 'Foxtale Keep It Hydrated Facial Serum (30ml)',
    category: 'Beauty & Skincare',
    imageUrl: '✨',
    keywords: ['foxtale', 'serum', 'hydrating', 'skincare', 'hyaluronic'],
    offers: [
      {
        merchantName: 'Amazon India',
        merchantSlug: 'amazon',
        merchantLogo: '📦',
        currentPrice: 549,
        mrp: 599,
        discountPct: 8,
        couponCode: 'AMZSERUM50',
        couponDiscount: 50,
        bankOfferDiscount: 49,
        giftCardDiscount: 0,
        cashbackAmount: 15,
        netFinalPayable: 435,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: 'Tomorrow by 2 PM',
        lastUpdated: 'Today 10:30 AM',
        confidence: 0.98,
        explainabilityText: 'Lowest Net Payable! Amazon coupon AMZSERUM50 + SBI 10% card discount gives best value.',
      },
      {
        merchantName: 'Foxtale Official',
        merchantSlug: 'foxtale',
        merchantLogo: '✨',
        currentPrice: 599,
        mrp: 599,
        discountPct: 0,
        couponCode: 'FOX15',
        couponDiscount: 90,
        bankOfferDiscount: 0,
        giftCardDiscount: 25,
        cashbackAmount: 40,
        netFinalPayable: 444,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: '2–3 Business Days',
        lastUpdated: 'Today 10:15 AM',
        confidence: 0.96,
        explainabilityText: 'Official store coupon FOX15 gives 15% OFF + 8% CashKaro cashback.',
      },
      {
        merchantName: 'Nykaa',
        merchantSlug: 'nykaa',
        merchantLogo: '💄',
        currentPrice: 569,
        mrp: 599,
        discountPct: 5,
        couponCode: 'NYKAA50',
        couponDiscount: 50,
        bankOfferDiscount: 51,
        giftCardDiscount: 0,
        cashbackAmount: 18,
        netFinalPayable: 450,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: '2 Days Delivery',
        lastUpdated: 'Today 10:45 AM',
        confidence: 0.97,
        explainabilityText: 'Nykaa coupon NYKAA50 applied with HDFC card offer.',
      },
    ],
  },
  {
    id: 'prod_muscleblaze_whey',
    title: 'MuscleBlaze Biozyme Performance Whey (1kg, Rich Chocolate)',
    category: 'Health & Wellness',
    imageUrl: '💪',
    keywords: ['muscleblaze', 'whey', 'protein', 'biozyme', 'fitness', 'supplements'],
    offers: [
      {
        merchantName: 'Amazon India',
        merchantSlug: 'amazon',
        merchantLogo: '📦',
        currentPrice: 2399,
        mrp: 3099,
        discountPct: 22,
        couponCode: 'FITNESS100',
        couponDiscount: 100,
        bankOfferDiscount: 229,
        giftCardDiscount: 0,
        cashbackAmount: 62,
        netFinalPayable: 2008,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: 'Tomorrow by 11 AM',
        lastUpdated: 'Today 10:00 AM',
        confidence: 0.99,
        explainabilityText: 'Lowest Net Payable! SBI Card 10% instant discount + CashKaro cashback beats all stores.',
      },
      {
        merchantName: 'MuscleBlaze Official',
        merchantSlug: 'muscleblaze',
        merchantLogo: '💪',
        currentPrice: 2499,
        mrp: 3099,
        discountPct: 19,
        couponCode: 'MBPRO10',
        couponDiscount: 249,
        bankOfferDiscount: 0,
        giftCardDiscount: 112,
        cashbackAmount: 150,
        netFinalPayable: 1988,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: '3 Business Days',
        lastUpdated: 'Today 09:30 AM',
        confidence: 0.97,
        explainabilityText: 'Cheapest Direct Option! Official code MBPRO10 (10% OFF) + 7% CashKaro Cashback.',
      },
      {
        merchantName: 'HK Vitals',
        merchantSlug: 'hkvitals',
        merchantLogo: '💊',
        currentPrice: 2449,
        mrp: 3099,
        discountPct: 20,
        couponCode: 'HKV100',
        couponDiscount: 100,
        bankOfferDiscount: 234,
        giftCardDiscount: 0,
        cashbackAmount: 94,
        netFinalPayable: 2021,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: '2 Days Delivery',
        lastUpdated: 'Today 09:20 AM',
        confidence: 0.95,
        explainabilityText: 'HKVitals bundle offer with 8% cashback.',
      },
    ],
  },
  {
    id: 'prod_samsung_buds',
    title: 'Samsung Galaxy Buds2 Pro Wireless Earbuds',
    category: 'Electronics',
    imageUrl: '🎧',
    keywords: ['samsung', 'galaxy', 'buds', 'earbuds', 'audio', 'wireless'],
    offers: [
      {
        merchantName: 'Amazon India',
        merchantSlug: 'amazon',
        merchantLogo: '📦',
        currentPrice: 8999,
        mrp: 17999,
        discountPct: 50,
        couponCode: 'AMZAUDIO500',
        couponDiscount: 500,
        bankOfferDiscount: 849,
        giftCardDiscount: 0,
        cashbackAmount: 229,
        netFinalPayable: 7421,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: 'Same-Day Delivery',
        lastUpdated: 'Today 10:10 AM',
        confidence: 0.99,
        explainabilityText: 'Best Value! 50% MRP discount + HDFC 10% card instant offer.',
      },
      {
        merchantName: 'Samsung Official',
        merchantSlug: 'samsung',
        merchantLogo: '📱',
        currentPrice: 9999,
        mrp: 17999,
        discountPct: 44,
        couponCode: 'SAMSUNG2000',
        couponDiscount: 2000,
        bankOfferDiscount: 0,
        giftCardDiscount: 399,
        cashbackAmount: 379,
        netFinalPayable: 7221,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: '2 Days Delivery',
        lastUpdated: 'Today 09:50 AM',
        confidence: 0.98,
        explainabilityText: 'Cheapest overall! Official corporate coupon SAMSUNG2000 + 5% cashback.',
      },
      {
        merchantName: 'Croma',
        merchantSlug: 'croma',
        merchantLogo: '💻',
        currentPrice: 9499,
        mrp: 17999,
        discountPct: 47,
        couponCode: 'CROMA500',
        couponDiscount: 500,
        bankOfferDiscount: 899,
        giftCardDiscount: 0,
        cashbackAmount: 323,
        netFinalPayable: 7777,
        stockStatus: 'IN_STOCK',
        deliveryEstimate: 'Store Pickup / 1 Day',
        lastUpdated: 'Today 10:20 AM',
        confidence: 0.96,
        explainabilityText: 'Tata Neu NeuCoins cashback + Croma store pickup.',
      },
    ],
  },
]

export function searchProducts(query: string): ComparisonProduct[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return []

  return COMPARISON_PRODUCTS.filter((prod) => {
    return (
      prod.title.toLowerCase().includes(clean) ||
      prod.category.toLowerCase().includes(clean) ||
      prod.keywords.some((kw) => kw.toLowerCase().includes(clean))
    )
  })
}
