import { pgTable, uuid, varchar, numeric, timestamp } from 'drizzle-orm/pg-core'
import { productVariants } from './productVariants'
import { retailers } from './retailers'

/**
 * Price History
 * Append-only time-series table.
 * Every price observation captured by a scraper is written here.
 * Enables: price charts, lowest-ever price, price drop alerts, average price.
 *
 * Index: (product_variant_id, captured_at DESC) — for efficient history queries
 */
export const priceHistory = pgTable('price_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  productVariantId: uuid('product_variant_id')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  retailerId: uuid('retailer_id')
    .notNull()
    .references(() => retailers.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  mrp: numeric('mrp', { precision: 10, scale: 2 }),
  /** Seller name for marketplace platforms (Amazon, Flipkart) */
  sellerName: varchar('seller_name', { length: 200 }),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull(),
})
