export interface CategoryCashbackRate {
  categoryName: string
  cashbackPct: number
  flatAmount?: number
  trackingRequirements: string
  confirmationDays: number
  minPurchase: number
  maxCashback?: number
  userEligibility: 'ALL_USERS' | 'NEW_USER_ONLY' | 'PRIME_MEMBERS'
  lastUpdated: string
}

export interface StoreCashbackStructure {
  storeSlug: string
  storeName: string
  providerName: string
  categories: CategoryCashbackRate[]
}

export const STORE_CASHBACK_DATABASE: Record<string, StoreCashbackStructure> = {
  amazon: {
    storeSlug: 'amazon',
    storeName: 'Amazon India',
    providerName: 'CashKaro / EarnKaro Affiliate Feed',
    categories: [
      {
        categoryName: 'Fashion & Apparel',
        cashbackPct: 5.0,
        trackingRequirements: 'Must redirect via CashKaro link & add to cart',
        confirmationDays: 60,
        minPurchase: 0,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:15 AM',
      },
      {
        categoryName: 'Beauty & Skincare',
        cashbackPct: 5.0,
        trackingRequirements: 'Redirect required before cart creation',
        confirmationDays: 60,
        minPurchase: 0,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:15 AM',
      },
      {
        categoryName: 'Electronics & Laptops',
        cashbackPct: 3.0,
        trackingRequirements: 'Redirect required',
        confirmationDays: 60,
        minPurchase: 1000,
        maxCashback: 1500,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:15 AM',
      },
      {
        categoryName: 'Mobiles & Accessories',
        cashbackPct: 0.5,
        trackingRequirements: 'Excludes select flagship launches',
        confirmationDays: 90,
        minPurchase: 5000,
        maxCashback: 500,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:15 AM',
      },
      {
        categoryName: 'Recharges & Bill Payments',
        cashbackPct: 0,
        flatAmount: 1.5,
        trackingRequirements: 'Flat ₹1.5 cashback per transaction',
        confirmationDays: 30,
        minPurchase: 100,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:15 AM',
      },
    ],
  },
  myntra: {
    storeSlug: 'myntra',
    storeName: 'Myntra',
    providerName: 'CashKaro Partner Network',
    categories: [
      {
        categoryName: 'Fashion & Apparel',
        cashbackPct: 6.5,
        trackingRequirements: 'App & Mobile Web tracking enabled',
        confirmationDays: 45,
        minPurchase: 0,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 09:45 AM',
      },
      {
        categoryName: 'Beauty & Personal Care',
        cashbackPct: 7.0,
        trackingRequirements: 'Redirect via CashKaro link',
        confirmationDays: 45,
        minPurchase: 0,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 09:45 AM',
      },
      {
        categoryName: 'Footwear & Accessories',
        cashbackPct: 5.5,
        trackingRequirements: 'Redirect required',
        confirmationDays: 45,
        minPurchase: 0,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 09:45 AM',
      },
    ],
  },
  swiggy: {
    storeSlug: 'swiggy',
    storeName: 'Swiggy',
    providerName: 'EarnKaro Live Feed',
    categories: [
      {
        categoryName: 'Food Delivery',
        cashbackPct: 6.0,
        trackingRequirements: 'Order tracking active via affiliate link',
        confirmationDays: 30,
        minPurchase: 149,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 11:00 AM',
      },
      {
        categoryName: 'Instamart Groceries',
        cashbackPct: 4.0,
        trackingRequirements: 'Instamart cart tracking',
        confirmationDays: 30,
        minPurchase: 199,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 11:00 AM',
      },
      {
        categoryName: 'Dineout Table Booking',
        cashbackPct: 10.0,
        trackingRequirements: 'Table booking confirmation required',
        confirmationDays: 15,
        minPurchase: 500,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 11:00 AM',
      },
    ],
  },
  zomato: {
    storeSlug: 'zomato',
    storeName: 'Zomato',
    providerName: 'CashKaro Partner Feed',
    categories: [
      {
        categoryName: 'Food Delivery (Over ₹100 Order)',
        cashbackPct: 0,
        flatAmount: 10.0,
        trackingRequirements: 'Flat ₹10 cashback on orders over ₹100',
        confirmationDays: 30,
        minPurchase: 100,
        userEligibility: 'ALL_USERS',
        lastUpdated: 'Today 10:30 AM',
      },
      {
        categoryName: 'Zomato Gold Subscription',
        cashbackPct: 15.0,
        trackingRequirements: 'New Gold subscription tracking',
        confirmationDays: 15,
        minPurchase: 199,
        userEligibility: 'NEW_USER_ONLY',
        lastUpdated: 'Today 10:30 AM',
      },
    ],
  },
}

export function getCategoryCashback(storeSlug: string, categoryName?: string): CategoryCashbackRate {
  const storeData = STORE_CASHBACK_DATABASE[storeSlug.toLowerCase()]
  if (!storeData || storeData.categories.length === 0) {
    return {
      categoryName: categoryName || 'General Shopping',
      cashbackPct: 4.0,
      trackingRequirements: 'Redirect via CashKaro link',
      confirmationDays: 60,
      minPurchase: 0,
      userEligibility: 'ALL_USERS',
      lastUpdated: 'Today 10:00 AM',
    }
  }

  if (categoryName) {
    const match = storeData.categories.find(
      (c) => c.categoryName.toLowerCase().includes(categoryName.toLowerCase()) || categoryName.toLowerCase().includes(c.categoryName.toLowerCase())
    )
    if (match) return match
  }

  // Default to first category
  return storeData.categories[0]
}
