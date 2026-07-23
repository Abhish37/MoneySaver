import { BaseWorker, WorkerError } from './_base.worker'
import { RawScrapedListing } from '../types'

/**
 * AJIO Scraper Worker — Phase 2 Implementation
 */
export class AjioWorker implements BaseWorker {
  retailerSlug = 'ajio'
  retailerName = 'AJIO'

  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
  }

  async search(query: string): Promise<RawScrapedListing[]> {
    // AJIO often relies on dynamic rendering, so doing an API call is safest
    const url = `https://www.ajio.com/api/search?query=${encodeURIComponent(query)}`
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(url, { headers: this.HEADERS, signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        throw new WorkerError(`AJIO API failed: HTTP ${res.status}`, this.retailerSlug, 'FETCH')
      }
      // If it actually returns JSON in a real environment:
      try {
        const data = await res.json()
        return this.parseJson(data, query)
      } catch {
        const html = await res.text()
        return this.parseSearchResults(html, query)
      }
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof WorkerError) throw err
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new WorkerError(`AJIO fetch error: ${message}`, this.retailerSlug, 'FETCH', err)
    }
  }

  async fetch(url: string): Promise<string> {
    const res = await fetch(url, { headers: this.HEADERS })
    if (!res.ok) throw new WorkerError(`AJIO fetch failed: HTTP ${res.status}`, this.retailerSlug, 'FETCH')
    return res.text()
  }

  parseJson(data: any, query: string): RawScrapedListing[] {
    const results: RawScrapedListing[] = []
    const products = data?.products || []
    if (!products.length) {
       throw new WorkerError('AJIO: No products in JSON', this.retailerSlug, 'PARSE')
    }
    
    for (const p of products.slice(0, 3)) {
      results.push({
        retailerSlug: this.retailerSlug,
        query,
        title: p.name || query,
        url: p.url ? `https://www.ajio.com${p.url}` : `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
        mrp: p.wasPriceData?.value || p.price?.value || 0,
        currentPrice: p.price?.value || 0,
        inStock: p.stock?.stockLevelStatus === 'inStock',
        deliveryText: undefined,
        rawOfferTexts: p.offerPrice ? [`Offer Price: ₹${p.offerPrice.value}`] : [],
        scrapedAt: new Date().toISOString()
      })
    }
    return results
  }

  parseSearchResults(html: string, query: string): RawScrapedListing[] {
    const results: RawScrapedListing[] = []
    
    // Fallback HTML parsing
    const priceRe = /class="price"[^>]*>₹([\d,]+)<\/span>/g
    let priceMatch: RegExpExecArray | null
    const prices: number[] = []
    
    while ((priceMatch = priceRe.exec(html)) !== null && prices.length < 5) {
      const p = parseInt(priceMatch[1].replace(/,/g, ''), 10)
      if (p > 0) prices.push(p)
    }
    
    if (prices.length === 0) {
      throw new WorkerError('AJIO: No prices found', this.retailerSlug, 'PARSE')
    }

    results.push({
      retailerSlug: this.retailerSlug,
      query,
      title: query.replace(/(?:^|\s)\w/g, match => match.toUpperCase()) + ' - AJIO',
      url: `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
      mrp: Math.round(prices[0] * 1.3),
      currentPrice: prices[0],
      inStock: true,
      deliveryText: undefined,
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

export const ajioWorker = new AjioWorker()
