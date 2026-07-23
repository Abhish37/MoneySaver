import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { stores } from './stores'
import { users } from './users'

export const couponSourceEnum = pgEnum('coupon_source', [
  'PUBLIC_SCRAPED',
  'USER_OCR',
  'USER_MANUAL',
  'COMMUNITY',
])

export const couponDiscountTypeEnum = pgEnum('coupon_discount_type', [
  'PERCENTAGE',
  'FLAT',
])

export const verificationStatusEnum = pgEnum('verification_status', [
  'VERIFIED',
  'PENDING_REVIEW',
  'EXPIRED',
])

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  code: varchar('code', { length: 50 }).notNull(),
  discountType: couponDiscountTypeEnum('discount_type').notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minCartValue: numeric('min_cart_value', { precision: 10, scale: 2 }).default('0.00').notNull(),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
  source: couponSourceEnum('source').notNull(),
  status: verificationStatusEnum('status').default('VERIFIED').notNull(),
  ocrConfidence: numeric('ocr_confidence', { precision: 3, scale: 2 }).default('1.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  conditions: jsonb('conditions').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
