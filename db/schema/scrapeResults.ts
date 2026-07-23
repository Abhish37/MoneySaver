import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { scrapeJobs } from './scrapeJobs'
import { retailers } from './retailers'

export const scrapeResultStatusEnum = pgEnum('scrape_result_status', [
  'RAW',
  'NORMALIZED',
  'MATCHED',
  'REJECTED',
])

/**
 * Scrape Results
 * Stores the raw JSON payload from each worker execution.
 * Normalized and matched data moves to retailer_products.
 * Raw results are kept for debugging, re-processing, and audit.
 */
export const scrapeResults = pgTable('scrape_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => scrapeJobs.id, { onDelete: 'cascade' }),
  retailerId: uuid('retailer_id')
    .references(() => retailers.id, { onDelete: 'set null' }),
  /** Raw JSON payload as returned by the worker's parse() method */
  rawPayload: jsonb('raw_payload').notNull(),
  /** Normalized payload after normalizer/index.ts processing */
  normalizedPayload: jsonb('normalized_payload'),
  status: scrapeResultStatusEnum('status').default('RAW').notNull(),
  /** Parser error message if parsing failed */
  parserError: text('parser_error'),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow().notNull(),
})
