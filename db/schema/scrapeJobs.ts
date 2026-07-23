import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { retailers } from './retailers'
import { users } from './users'

export const scrapeJobStatusEnum = pgEnum('scrape_job_status', [
  'PENDING',
  'RUNNING',
  'DONE',
  'FAILED',
  'RETRYING',
])

export const scrapeJobTriggerEnum = pgEnum('scrape_job_trigger', [
  'USER_SEARCH',
  'SCHEDULED_REFRESH',
  'PRICE_ALERT',
  'MANUAL_ADMIN',
])

/**
 * Scrape Jobs
 * Job queue for scraper workers.
 * Each user search or scheduled price refresh creates a job row.
 * Workers poll this table, update status, and write results to scrape_results.
 */
export const scrapeJobs = pgTable('scrape_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  retailerId: uuid('retailer_id')
    .references(() => retailers.id, { onDelete: 'set null' }),
  /** null = all retailers for this query */
  query: varchar('query', { length: 500 }).notNull(),
  status: scrapeJobStatusEnum('status').default('PENDING').notNull(),
  trigger: scrapeJobTriggerEnum('trigger').default('USER_SEARCH').notNull(),
  triggeredByUserId: uuid('triggered_by_user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  /** Number of times this job has been retried */
  retryCount: varchar('retry_count', { length: 3 }).default('0').notNull(),
  errorMessage: text('error_message'),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})
