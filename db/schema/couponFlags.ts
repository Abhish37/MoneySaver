import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core'
import { coupons } from './coupons'
import { users } from './users'

export const couponFlags = pgTable(
  'coupon_flags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    reason: varchar('reason', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserFlag: unique('unique_user_flag').on(table.couponId, table.userId),
  })
)
