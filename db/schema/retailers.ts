import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core'

/**
 * Retailers Registry
 * Replaces hardcoded retailer slug strings throughout the codebase.
 * New retailers can be onboarded by inserting a row — no code changes needed.
 */
export const retailers = pgTable('retailers', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  baseUrl: varchar('base_url', { length: 255 }).notNull(),
  logoUrl: text('logo_url'),
  /** Affiliate link template — {QUERY} and {PRODUCT_ID} are replaced at runtime */
  affiliateLinkTemplate: text('affiliate_link_template'),
  /** JSON config for the scraper worker: selectors, headers, rate limits */
  scraperConfig: text('scraper_config'),
  isActive: boolean('is_active').default(true).notNull(),
  supportsAffiliate: boolean('supports_affiliate').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
