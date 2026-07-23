import { pgTable, uuid, varchar, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const productCategoryEnum = pgEnum('product_category', [
  'FASHION',
  'BEAUTY_SKINCARE',
  'HEALTH_WELLNESS',
  'ELECTRONICS',
  'FOOD_GROCERY',
  'TRAVEL',
  'HOME_KITCHEN',
  'SPORTS_FITNESS',
  'OTHER',
])

/**
 * Canonical Product Entity
 * Represents a real-world product independent of any retailer.
 * Retailer-specific data (price, stock, listing URL) lives in retailer_products.
 */
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  modelNumber: varchar('model_number', { length: 100 }),
  category: productCategoryEnum('category').notNull(),
  subCategory: varchar('sub_category', { length: 100 }),
  imageUrl: text('image_url'),
  description: text('description'),
  /** Normalized attributes extracted by LLM: { "storage": "128GB", "color": "Black", ... } */
  attributes: jsonb('attributes').default({}).notNull(),
  /** Searchable keywords array for full-text matching */
  keywords: jsonb('keywords').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
