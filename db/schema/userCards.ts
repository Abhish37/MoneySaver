import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const userCards = pgTable(
  'user_cards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bankName: varchar('bank_name', { length: 100 }).notNull(),
    cardName: varchar('card_name', { length: 100 }).notNull(),
    cardType: varchar('card_type', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserCard: unique('unique_user_card').on(table.userId, table.bankName, table.cardName),
  })
)
