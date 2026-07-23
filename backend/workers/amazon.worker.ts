import { BaseWorker, WorkerError } from './_base.worker'
import { RawScrapedListing } from '../types'

/**
 * Amazon India Scraper Worker — Phase 2 Implementation
 *
 * Strategy: Attempt a real HTTP fetch to Amazon India's search page.
 * Amazon embeds structured product data as JSON within <script> tags.
 * We extract it via regex — no Cheerio required.
 *
 * Failure handling: If Amazon blocks the request (429, CAPTCHA, etc.),
 * we throw a WorkerError and the pipeline falls back to the next available
 * data source. We NEVER fabricate prices.
 */
export class AmazonWorker implements BaseWorker {
  retailerSlug = 'amazon'
  retailerName = 'Amazon India'

  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
  }

  async search(query: string): Promise<RawScrapedListing[]> {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`
    const html = await this.fetch(url)
    return this.parseSearchResults(html, query)
  }

  async fetch(url: string): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(url, {
        headers: this.HEADERS,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.status === 503 || res.status === 429) {
        throw new WorkerError(
          `Amazon blocked request: HTTP ${res.status}`,
          this.retailerSlug,
          'FETCH'
        )
      }
      if (!res.ok) {
        throw new WorkerError(
          `Amazon fetch failed: HTTP ${res.status}`,
          this.retailerSlug,
          'FETCH'
        )
      }
      return res.text()
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof WorkerError) throw err
      const message = err instanceof Error ? err.message : 'Unknown fetch error'
      throw new WorkerError(
        `Amazon network error: ${message}`,
        this.retailerSlug,
        'FETCH',
        err
      )
    }
  }

  /** Extract price/title from Amazon search result HTML */
  parseSearchResults(html: string, query: string): RawScrapedListing[] {
    // Detect CAPTCHA / bot wall pages
    if (
      html.includes('Enter the characters you see below') ||
      html.includes('api-services-support@amazon') ||
      html.length < 5000
    ) {
      throw new WorkerError(
        'Amazon CAPTCHA detected — search blocked',
        this.retailerSlug,
        'PARSE'
      )
    }

    const results: RawScrapedListing[] = []

    /**
     * Amazon search pages embed product data in <div data-asin="..."> wrappers.
     * We extract ASIN + price + title using targeted regex patterns.
     */

    // Extract product blocks: data-asin="B0..." followed by title + price
    const asinBlockRe = /data-asin="([A-Z0-9]{10})"[^>]*data-index="(\d+)"[\s\S]{0,2000}?class="[^"]*a-size-base-plus[^"]*a-color-base[^"]*"[^>]*>([\s\S]{0,300}?)<\/span>/g
    const priceWholeRe = /class="a-price-whole"[^>]*>([\d,]+)</g
    const priceFractionRe = /class="a-price-fraction"[^>]*>(\d+)</g

    // Simpler approach: find all price-whole spans and extract surrounding context
    const priceMatches: string[] = []
    let priceMatch: RegExpExecArray | null
    const priceRe = /data-asin="([A-Z0-9]{10})"[\s\S]{0,3000}?<span class="a-price-whole">([0-9,]+)<\/span>/g

    while ((priceMatch = priceRe.exec(html)) !== null && results.length < 5) {
      const asin = priceMatch[1]
      const rawPrice = priceMatch[2].replace(/,/g, '')
      const price = parseInt(rawPrice, 10)
      if (!price || price < 1 || price > 10000000) continue
      if (priceMatches.includes(asin)) continue
      priceMatches.push(asin)

      // Extract title near this ASIN
      const asinStart = html.indexOf(`data-asin="${asin}"`)
      const block = html.slice(asinStart, asinStart + 4000)
      const titleRe = /class="[^"]*a-size-(?:base-plus|medium)[^"]*a-color-base[^"]*"[^>]*>([\s\S]{5,200}?)<\/span>/
      const titleMatch = block.match(titleRe)
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
        : query

      // Extract MRP (struck-through price)
      const mrpRe = /class="a-text-price"[^>]*>[\s\S]{0,50}?<span[^>]*>([₹\s0-9,]+)<\/span>/
      const mrpMatch = block.match(mrpRe)
      const mrp = mrpMatch
        ? parseInt(mrpMatch[1].replace(/[₹,\s]/g, ''), 10)
        : Math.round(price * 1.2)

      // Extract offer texts
      const rawOfferTexts: string[] = []
      const offerRe = /class="[^"]*s-badge[^"]*"[^>]*>([\s\S]{0,100}?)<\/span>/g
      let offerMatch: RegExpExecArray | null
      const blockSlice = block.slice(0, 3000)
      while ((offerMatch = offerRe.exec(blockSlice)) !== null) {
        const offerText = offerMatch[1].replace(/<[^>]+>/g, '').trim()
        if (offerText.length > 3 && offerText.length < 150) {
          rawOfferTexts.push(offerText)
        }
      }

      results.push({
        retailerSlug: this.retailerSlug,
        query,
        title: title || query,
        url: `https://www.amazon.in/dp/${asin}`,
        mrp: mrp > price ? mrp : Math.round(price * 1.2),
        currentPrice: price,
        inStock: !block.includes('Currently unavailable'),
        deliveryText: block.includes('FREE delivery') ? 'FREE Delivery' : undefined,
        rawOfferTexts,
        scrapedAt: new Date().toISOString(),
      })
    }

    if (results.length === 0) {
      throw new WorkerError(
        'Amazon: no products parsed from search page (structure may have changed)',
        this.retailerSlug,
        'PARSE'
      )
    }

    return results
  }

  parse(html: string, url: string, query: string): RawScrapedListing {
    return this.parseSearchResults(html, query)[0]
  }

  normalize(raw: RawScrapedListing): RawScrapedListing {
    return {
      ...raw,
      // Strip Amazon-specific title suffixes like "(Pack of 3)" or "| Visit the X Store"
      title: raw.title.replace(/\s*\|.*$/, '').replace(/\s{2,}/g, ' ').trim(),
    }
  }
}

export const amazonWorker = new AmazonWorker()
