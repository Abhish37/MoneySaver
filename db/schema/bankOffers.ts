import { pgTable, uuid, varchar, numeric, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { stores } from './stores'

export const bankOffers = pgTable('bank_offers', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  cardType: varchar('card_type', { length: 20 }).notNull(),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull(),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }).notNull(),
  minTransactionAmount: numeric('min_transaction_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  conditions: jsonb('conditions').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
