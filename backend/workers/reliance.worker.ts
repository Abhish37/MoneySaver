import { BaseWorker, WorkerError } from './_base.worker'
import { RawScrapedListing } from '../types'

/**
 * Reliance Digital Scraper Worker — Phase 2 Implementation
 */
export class RelianceWorker implements BaseWorker {
  retailerSlug = 'reliance'
  retailerName = 'Reliance Digital'

  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
    'Accept-Language': 'en-IN,en;q=0.9',
  }

  async search(query: string): Promise<RawScrapedListing[]> {
    const url = `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}:relevance`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(url, { headers: this.HEADERS, signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        throw new WorkerError(`Reliance API failed: HTTP ${res.status}`, this.retailerSlug, 'FETCH')
      }
      const html = await res.text()
      return this.parseSearchResults(html, query)
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof WorkerError) throw err
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new WorkerError(`Reliance fetch error: ${message}`, this.retailerSlug, 'FETCH', err)
    }
  }

  async fetch(url: string): Promise<string> {
    const res = await fetch(url, { headers: this.HEADERS })
    if (!res.ok) throw new WorkerError(`Reliance fetch failed: HTTP ${res.status}`, this.retailerSlug, 'FETCH')
    return res.text()
  }

  parseSearchResults(html: string, query: string): RawScrapedListing[] {
    const results: RawScrapedListing[] = []
    
    // Reliance Digital price regex
    const priceRe = /<span class="TextWeb__Text-sc-1cyx778-0 igBwwG">₹([\d,]+)<\/span>/g
    let priceMatch: RegExpExecArray | null
    const prices: number[] = []
    
    while ((priceMatch = priceRe.exec(html)) !== null && prices.length < 5) {
      const p = parseInt(priceMatch[1].replace(/,/g, ''), 10)
      if (p > 0) prices.push(p)
    }
    
    if (prices.length === 0) {
      throw new WorkerError('Reliance: No prices found', this.retailerSlug, 'PARSE')
    }

    results.push({
      retailerSlug: this.retailerSlug,
      query,
      title: query.replace(/(?:^|\s)\w/g, match => match.toUpperCase()) + ' - Reliance Digital',
      url: `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`,
      mrp: Math.round(prices[0] * 1.05),
      currentPrice: prices[0],
      inStock: true,
      deliveryText: 'Standard Delivery',
      rawOfferTexts: [],
      scrapedAt: new Date().toISOString()
    })

    return results
  }

  parse(html: string, url: string, query: string): RawScrapedListing {
    return this.parseSearchResults(html, query)[0]
  }

  normalize(raw: RawScrapedListing): RawScrapedListing {
    return raw
  }
}

export const relianceWorker = new RelianceWorker()
