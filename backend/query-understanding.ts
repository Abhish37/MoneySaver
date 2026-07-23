/**
 * Query Understanding Layer
 * 
 * Maps generic search queries (e.g., "iphone", "android", "shoes") to specific
 * canonical product entities to simulate a real Search & Intent resolution engine.
 * 
 * In a fully scaled Phase 3, this would be backed by an LLM or an Elasticsearch index.
 * For this prototype, we use an in-memory knowledge graph to provide high-quality
 * product resolutions.
 */

export interface IntentProduct {
  title: string
  basePrice: number
  brand: string
  category: string
}

const KNOWLEDGE_GRAPH: Record<string, IntentProduct[]> = {
  iphone: [
    { title: 'Apple iPhone 15 (128 GB)', basePrice: 71999, brand: 'Apple', category: 'Electronics' },
    { title: 'Apple iPhone 13 (128GB)', basePrice: 52999, brand: 'Apple', category: 'Electronics' },
    { title: 'Apple iPhone 15 Pro (256 GB)', basePrice: 127990, brand: 'Apple', category: 'Electronics' }
  ],
  apple: [
    { title: 'Apple iPhone 15 (128 GB)', basePrice: 71999, brand: 'Apple', category: 'Electronics' },
    { title: 'Apple MacBook Air M2', basePrice: 94990, brand: 'Apple', category: 'Electronics' },
    { title: 'Apple AirPods Pro (2nd Gen)', basePrice: 24900, brand: 'Apple', category: 'Electronics' }
  ],
  android: [
    { title: 'Samsung Galaxy S24 Ultra 5G', basePrice: 129999, brand: 'Samsung', category: 'Electronics' },
    { title: 'OnePlus 12R (8GB RAM, 128GB)', basePrice: 39999, brand: 'OnePlus', category: 'Electronics' },
    { title: 'Google Pixel 8 (128GB)', basePrice: 75999, brand: 'Google', category: 'Electronics' }
  ],
  samsung: [
    { title: 'Samsung Galaxy S24 Ultra 5G', basePrice: 129999, brand: 'Samsung', category: 'Electronics' },
    { title: 'Samsung Galaxy A55 5G', basePrice: 39999, brand: 'Samsung', category: 'Electronics' },
    { title: 'Samsung Galaxy Buds 2 Pro', basePrice: 15990, brand: 'Samsung', category: 'Electronics' }
  ],
  serum: [
    { title: 'Foxtale Vitamin C Serum', basePrice: 595, brand: 'Foxtale', category: 'Beauty' },
    { title: 'Minimalist 10% Niacinamide Face Serum', basePrice: 599, brand: 'Minimalist', category: 'Beauty' },
    { title: 'The Derma Co 1% Hyaluronic Acid Sunscreen', basePrice: 499, brand: 'Derma Co', category: 'Beauty' }
  ],
  shoes: [
    { title: 'Nike Air Max 270', basePrice: 12995, brand: 'Nike', category: 'Fashion' },
    { title: 'Puma RS-X Sneakers', basePrice: 8999, brand: 'Puma', category: 'Fashion' },
    { title: 'Adidas Ultraboost Light', basePrice: 18999, brand: 'Adidas', category: 'Fashion' }
  ]
}

export function resolveIntent(query: string): IntentProduct[] {
  const cleanQuery = query.toLowerCase().trim()
  
  // Exact match
  if (KNOWLEDGE_GRAPH[cleanQuery]) {
    return KNOWLEDGE_GRAPH[cleanQuery]
  }

  // Partial match search
  for (const [key, products] of Object.entries(KNOWLEDGE_GRAPH)) {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      return products
    }
  }

  // Fallback: If intent isn't recognized, assume it's a specific product name already
  // and construct a pseudo-product for the workers to aggregate.
  return [
    {
      title: query.replace(/(?:^|\s)\w/g, match => match.toUpperCase()),
      basePrice: 1999, // Arbitrary base price for unknown generics
      brand: query.split(' ')[0],
      category: 'General'
    }
  ]
}
