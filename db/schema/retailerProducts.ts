import { pgTable, uuid, varchar, numeric, boolean, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { productVariants } from './productVariants'
import { retailers } from './retailers'

export const stockStatusEnum = pgEnum('stock_status', [
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'UNKNOWN',
])

/**
 * Retailer Products
 * A retailer's specific listing of a canonical product variant.
 * This is the join entity between a canonical ProductVariant and a Retailer.
 * Price, stock, and listing URL are retailer-specific and change frequently.
 */
export const retailerProducts = pgTable('retailer_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  productVariantId: uuid('product_variant_id')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  retailerId: uuid('retailer_id')
    .notNull()
    .references(() => retailers.id, { onDelete: 'cascade' }),
  /** The retailer's own product ID or SKU */
  retailerProductKey: varchar('retailer_product_key', { length: 200 }),
  listingTitle: varchar('listing_title', { length: 500 }),
  listingUrl: text('listing_url'),
  mrp: numeric('mrp', { precision: 10, scale: 2 }),
  currentPrice: numeric('current_price', { precision: 10, scale: 2 }),
  /** Primary seller name on marketplaces like Amazon/Flipkart */
  sellerName: varchar('seller_name', { length: 200 }),
  stockStatus: stockStatusEnum('stock_status').default('UNKNOWN').notNull(),
  deliveryEstimate: varchar('delivery_estimate', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
