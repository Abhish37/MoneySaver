import { pgTable, uuid, varchar, numeric, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { stores } from './stores'

export const voucherDeals = pgTable('voucher_deals', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  providerName: varchar('provider_name', { length: 50 }).notNull(),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull(),
  affiliatePurchaseUrl: text('affiliate_purchase_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
