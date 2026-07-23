import { pgTable, uuid, varchar, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core'

export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logoUrl: text('logo_url'),
  baseUrl: text('base_url').notNull(),
  affiliatePartnerName: varchar('affiliate_partner_name', { length: 50 }),
  affiliateRedirectUrl: text('affiliate_redirect_url'),
  defaultCashbackPercent: numeric('default_cashback_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
