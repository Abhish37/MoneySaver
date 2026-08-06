# MoneySaver Backend Refactor Proposal

> This document is intended as a **refactoring specification**, not a rewrite.
> Existing components should be preserved where possible and incrementally improved.

## Executive Summary

The current backend schema is well structured for a coupon/cashback platform, but it is **not yet designed for a true shopping price aggregator**.

The largest architectural gaps are:

- Product-centric data model is missing.
- Scraping/aggregation pipeline is absent.
- Product normalization and matching layer is absent.
- Price history is absent.
- Search index is absent.
- LLM enrichment pipeline is absent.
- APIs are store-centric rather than product-centric.

The existing Users, Coupons, Bank Offers, Referral, Vault and Authentication modules should remain largely unchanged.

---

# Keep As-Is

- Authentication (Clerk)
- Users
- Referral system
- Coupons
- Bank offers
- Voucher deals
- OCR coupon ingestion
- RLS
- Encryption
- Webhooks

These modules are already mature.

---

# Add Product Aggregation Layer

Introduce new entities instead of overloading the coupons table.

## New Tables

- products
- product_variants
- retailer_products
- price_history
- scrape_jobs
- scrape_results
- product_embeddings
- search_cache

Do NOT store retailer-specific data inside products.

Products represent the canonical entity.

Retailer products represent merchant listings.

---

# Canonical Product Pipeline

User Query
↓
Intent Parser
↓
Parallel Scrapers
↓
Normalization
↓
Product Matcher
↓
Price Ranking
↓
Response

---

# LLM Layer

Use an LLM ONLY for:

- Product attribute extraction
- Query understanding
- Offer extraction
- Product summaries
- Semantic comparison

Never use an LLM for scraping.

---

# Scraper Service

Split into independent workers.

amazon_worker
flipkart_worker
croma_worker
reliance_worker
ajio_worker

Each implements

search()

fetch()

parse()

normalize()

---

# Product Matching

Primary

- Model Number

Secondary

- Brand
- Storage
- RAM
- Color

Fallback

- Embedding similarity

---

# Price History

Store

product_variant_id

retailer

price

seller

captured_at

Allows

- Price charts
- Alerts
- Lowest price
- Average price

---

# API Changes

Keep existing endpoints.

Add

GET /products/search

GET /products/{id}

GET /products/{id}/prices

GET /products/{id}/history

POST /watchlist

GET /watchlist

POST /scrape/search

---

# Background Jobs

- Scheduled price refresh
- Failed scrape retry
- Product merge review
- Expired cache cleanup
- Embedding generation

---

# Caching

Redis

Search cache

15 minutes

Product page

30 minutes

Store metadata

24 hours

---

# Search

Hybrid

Exact SQL

+

Vector search

Use pgvector.

---

# Missing Indexes

Create indexes on

- retailer_products(retailer_id, product_key)
- price_history(product_variant_id, captured_at DESC)
- products(brand, category)
- embeddings(vector)

---

# Observability

Add

- scrape duration
- scrape success rate
- parser failures
- LLM latency
- cache hit ratio

Use OpenTelemetry.

---

# Security

Add

- Rate limiting
- Per-retailer throttling
- Proxy rotation
- CAPTCHA detection
- Secret rotation

---

# Suggested Folder Structure

backend/

api/

workers/

normalizer/

matcher/

llm/

cache/

db/

scheduler/

observability/

---

# Refactoring Plan

Phase 1
- Keep schema
- Add product tables
- Add scraper workers

Phase 2
- Add normalization
- Add matching
- Add history

Phase 3
- Add embeddings
- Add semantic search
- Add LLM enrichment

Phase 4
- Watchlists
- Price alerts
- Recommendation engine

---

# Success Metrics

- <2s search latency (cached <300ms)
- >95% product matching accuracy
- >90% scrape success
- <5% duplicate canonical products
- Horizontal scalability for new retailers

