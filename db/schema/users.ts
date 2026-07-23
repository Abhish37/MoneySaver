import { pgTable, uuid, varchar, numeric, timestamp, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['GUEST', 'USER', 'ADMIN'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  referredBy: uuid('referred_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  savingsGoal: numeric('savings_goal', { precision: 10, scale: 2 }).default('5000.00').notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  cumulativeSavings: numeric('cumulative_savings', { precision: 10, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
