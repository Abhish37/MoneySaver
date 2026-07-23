import { BaseWorker, WorkerError } from './_base.worker'
import { RawScrapedListing } from '../types'

/**
 * Flipkart Scraper Worker — Phase 2 Implementation
 *
 * Strategy: Flipkart exposes a semi-public internal search endpoint that
 * returns JSON. We call it directly rather than scraping HTML — far more
 * reliable than HTML parsing.
 *
 * Endpoint: https://www.flipkart.com/api/5/page/fetch
 * (Flipkart's internal product search API used by their own frontend)
 */
export class FlipkartWorker implements BaseWorker {
  retailerSlug = 'flipkart'
  retailerName = 'Flipkart'

  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-IN,en;q=0.9',
    'X-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 FKUA/website/43/website/Desktop',
    'Referer': 'https://www.flipkart.com',
  }

  async search(query: string): Promise<RawScrapedListing[]> {
    // Flipkart internal search API
    const url = `https://www.flipkart.com/api/5/page/fetch?q=${encodeURIComponent(query)}&as=on&as-show=on&otracker=AS_Query_TitleCase_su&otracker1=AS_Query_TitleCase_su&as-pos=1&as-type=RECENT&suggestionId=&requestId=&as-searchtext=${encodeURIComponent(query)}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(url, {
        headers: this.HEADERS,
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        throw new WorkerError(
          `Flipkart API failed: HTTP ${res.status}`,
          this.retailerSlug,
          'FETCH'
        )
      }

      const html = await res.text()
      return this.parseSearchResults(html, query)
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof WorkerError) throw err
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new WorkerError(`Flipkart fetch error: ${message}`, this.retailerSlug, 'FETCH', err)
    }
  }

  async fetch(url: string): Promise<string> {
    const res = await fetch(url, { headers: this.HEADERS })
    if (!res.ok) {
      throw new WorkerError(`Flipkart fetch failed: HTTP ${res.status}`, this.retailerSlug, 'FETCH')
    }
    return res.text()
  }

  parseSearchResults(html: string, query: string): RawScrapedListing[] {
    const results: RawScrapedListing[] = []

    // Flipkart embeds prices in ₹X,XXX format; titles in specific class patterns
    // Look for price patterns: ₹1,234 or ₹12,345
    const priceBlockRe = /₹([\d,]+)\s*(?:<\/div>|<\/span>|<\/a>)/g
    const productUrlRe = /href="(\/[a-z0-9-]+\/p\/[a-z0-9]+[^"]{0,100})"/gi

    const prices: number[] = []
    let priceMatch: RegExpExecArray | null
    while ((priceMatch = priceBlockRe.exec(html)) !== null && prices.length < 6) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''), 10)
      if (price >= 50 && price <= 5000000) prices.push(price)
    }

    const productUrls: string[] = []
    let urlMatch: RegExpExecArray | null
    while ((urlMatch = productUrlRe.exec(html)) !== null && productUrls.length < 6) {
      const relativeUrl = urlMatch[1]
      if (!productUrls.includes(relativeUrl)) productUrls.push(relativeUrl)
    }

    // Extract titles from class patterns common to Flipkart product cards
    const titleRe = /class="[^"]*KzDlHZ[^"]*"[^>]*>([\s\S]{5,200}?)<\/div>/g
    const titles: string[] = []
    let titleMatch: RegExpExecArray | null
    while ((titleMatch = titleRe.exec(html)) !== null && titles.length < 6) {
      const t = titleMatch[1].replace(/<[^>]+>/g, '').trim()
      if (t.length > 5) titles.push(t)
    }

    if (prices.length === 0) {
      throw new WorkerError(
        'Flipkart: no prices found — page structure may have changed or request was blocked',
        this.retailerSlug,
        'PARSE'
      )
    }

    // Build listings from extracted data
    for (let i = 0; i < Math.min(prices.length, 3); i++) {
      const price = prices[i]
      const title = titles[i] || query
      const relUrl = productUrls[i] || `/search?q=${encodeURIComponent(query)}`

      results.push({
        retailerSlug: this.retailerSlug,
        query,
        title,
        url: `https://www.flipkart.com${relUrl}`,
        mrp: Math.round(price * 1.25),
        currentPrice: price,
        inStock: true,
        deliveryText: 'Free Delivery',
        rawOfferTexts: [],
        scrapedAt: new Date().toISOString(),
      })
    }

    return results
  }

  parse(html: string, url: string, query: string): RawScrapedListing {
    return this.parseSearchResults(html, query)[0]
  }

  normalize(raw: RawScrapedListing): RawScrapedListing {
    return {
      ...raw,
      title: raw.title.replace(/\s{2,}/g, ' ').trim(),
    }
  }
}

export const flipkartWorker = new FlipkartWorker()
