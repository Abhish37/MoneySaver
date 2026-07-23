import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import { productVariants } from './productVariants'

/**
 * Watchlist
 * Users can watch specific product variants for price drop alerts.
 * Background job polls price_history and triggers notifications
 * when current price falls below target_price.
 */
export const watchlist = pgTable('watchlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productVariantId: uuid('product_variant_id')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  /** Alert fires when any retailer price drops to or below this value */
  targetPrice: varchar('target_price', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  /** Notification channel: EMAIL | PUSH | IN_APP */
  notificationChannel: varchar('notification_channel', { length: 20 }).default('IN_APP').notNull(),
  lastNotifiedAt: timestamp('last_notified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
})
