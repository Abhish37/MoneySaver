import { RawScrapedListing } from '../types'

/**
 * Base Worker Interface
 * All retailer scraper workers MUST implement these four methods.
 *
 * search()    — Given a query string, return a list of matching raw listings
 * fetch()     — Given a product URL, fetch the full product page HTML
 * parse()     — Parse fetched HTML into a RawScrapedListing
 * normalize() — Light per-retailer normalization before the central normalizer runs
 *
 * Workers must NEVER fabricate prices. If a scrape fails, throw a WorkerError.
 */
export interface BaseWorker {
  retailerSlug: string
  retailerName: string
  search(query: string): Promise<RawScrapedListing[]>
  fetch(url: string): Promise<string> // returns raw HTML
  parse(html: string, url: string, query: string): RawScrapedListing
  normalize(raw: RawScrapedListing): RawScrapedListing
}

export class WorkerError extends Error {
  constructor(
    message: string,
    public readonly retailerSlug: string,
    public readonly phase: 'SEARCH' | 'FETCH' | 'PARSE' | 'NORMALIZE',
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'WorkerError'
  }
}
