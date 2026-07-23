import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { products } from './products'

/**
 * Product Variants
 * A variant is a specific configuration of a canonical product.
 * Examples: iPhone 15 Pro / 256GB / Black, MuscleBlaze Whey / 1kg / Chocolate
 */
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  /** Human-readable label: "256GB / Space Black" */
  variantLabel: varchar('variant_label', { length: 200 }).notNull(),
  /** Structured variant attributes: { storage: "256GB", color: "Space Black", ram: "8GB" } */
  variantAttributes: jsonb('variant_attributes').default({}).notNull(),
  imageUrl: varchar('image_url', { length: 1000 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
