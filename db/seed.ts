import { db } from '../lib/db'
import { stores, bankOffers, voucherDeals, coupons } from './schema'

export async function seedDatabase() {
  console.log('🌱 Seeding MoneySaver merchant stores and initial offer data...')

  // Insert Store Merchants
  const [myntra] = await db.insert(stores).values({
    name: 'Myntra',
    slug: 'myntra',
    logoUrl: 'https://moneysaver-assets.s3.amazonaws.com/stores/logos/myntra.svg',
    baseUrl: 'https://www.myntra.com',
    affiliatePartnerName: 'EarnKaro',
    affiliateRedirectUrl: 'https://earnkaro.com/redirect?target=https://myntra.com',
    defaultCashbackPercent: '6.50',
    isActive: true,
  }).onConflictDoNothing().returning()

  const [amazon] = await db.insert(stores).values({
    name: 'Amazon India',
    slug: 'amazon',
    logoUrl: 'https://moneysaver-assets.s3.amazonaws.com/stores/logos/amazon.svg',
    baseUrl: 'https://www.amazon.in',
    affiliatePartnerName: 'Cuelinks',
    affiliateRedirectUrl: 'https://cuelinks.com/redirect?target=https://amazon.in',
    defaultCashbackPercent: '4.00',
    isActive: true,
  }).onConflictDoNothing().returning()

  const [flipkart] = await db.insert(stores).values({
    name: 'Flipkart',
    slug: 'flipkart',
    logoUrl: 'https://moneysaver-assets.s3.amazonaws.com/stores/logos/flipkart.svg',
    baseUrl: 'https://www.flipkart.com',
    affiliatePartnerName: 'EarnKaro',
    affiliateRedirectUrl: 'https://earnkaro.com/redirect?target=https://flipkart.com',
    defaultCashbackPercent: '5.00',
    isActive: true,
  }).onConflictDoNothing().returning()

  const [zomato] = await db.insert(stores).values({
    name: 'Zomato',
    slug: 'zomato',
    logoUrl: 'https://moneysaver-assets.s3.amazonaws.com/stores/logos/zomato.svg',
    baseUrl: 'https://www.zomato.com',
    affiliatePartnerName: 'EarnKaro',
    affiliateRedirectUrl: 'https://earnkaro.com/redirect?target=https://zomato.com',
    defaultCashbackPercent: '8.00',
    isActive: true,
  }).onConflictDoNothing().returning()

  console.log('✅ Stores seeded successfully.')
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err)
})
