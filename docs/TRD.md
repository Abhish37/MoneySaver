# Technical Requirements Document (TRD)

**App Name**: MoneySaver (SaverStack)  
**Version**: 1.3 (Amended with Proactive Safeguards TRD-AMD-03)  
**Date**: 2026-07-22  
**Status**: ✅ Complete  
**Prepared By**: Product Owner + AI Engineering Lead  

---

> MoneySaver is designed as a modular, low-latency web application optimized for fast calculations, structured relational queries, and secure third-party API integrations.

---

## Table of Contents
1. [System Architecture & Tech Stack](#1-system-architecture--tech-stack)
2. [Core System Data Flow Pipelines](#2-core-system-data-flow-pipelines)
3. [Database Schema Overview](#3-database-schema-overview)
4. [Security, Legal & Performance Specifications](#4-security-legal--performance-specifications)
5. [Deployment Architecture & CI/CD Pipeline](#5-deployment-architecture--cicd-pipeline)
6. [TRD Decisions & Rationale Log](#6-trd-decisions--rationale-log)

---

## 1. System Architecture & Tech Stack

### 1.1 Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Web App)                          │
│          Next.js App Router (TypeScript) + Tailwind + shadcn/ui         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌────────────────────────────────────────┐  ┌────────────────────────────┐
│              AUTH LAYER                │  │       STORAGE LAYER        │
│    Clerk / Supabase Auth (OAuth + OTP) │  │  AWS S3 / Cloudinary (Temp)│
└───────────────────┬────────────────────┘  └──────────────┬─────────────┘
                    │                                      │
                    ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND & API LAYER                             │
│       Next.js Server Actions / Node.js API Routes + Upstash Redis       │
└──────┬──────────────────────┬─────────────────────┬────────────────────┘
       │                      │                     │
       ▼                      ▼                     ▼
┌──────────────┐     ┌────────────────┐    ┌─────────────────────────────┐
│  OCR ENGINE  │     │ STACKER ENGINE │    │    EXTERNAL AFFILIATE APIS  │
│ Google Cloud │     │ Multi-Tier SQL │    │ EarnKaro / Cuelinks /       │
│  Vision API  │     │ Logic Execution│    │ CashKaro Network Feeds      │
└──────────────┘     └───────┬────────┘    └─────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │       DATABASE LAYER        │
              │  PostgreSQL (Neon/Supabase) │
              │   + Drizzle ORM / Prisma    │
              └─────────────────────────────┘
```

### 1.2 Core Technology Stack

| Layer | Technology Choice | Justification |
|-------|------------------|---------------|
| **Frontend Framework** | Next.js 14+ (App Router, TypeScript) | Server-side rendering (SSR) for SEO on deal pages; Server Components for fast load times |
| **Styling & UI Components** | Tailwind CSS + shadcn/ui | Accessible, custom-styled UI without heavy component library bloat |
| **State & Data Fetching** | TanStack Query (React Query) + Zustand | Optimistic UI updates for voting and instant local state management |
| **Database & ORM** | PostgreSQL (Neon) + Drizzle ORM | Relational integrity for complex deal stacks + native JSONB for flexible offer conditions |
| **Authentication** | Clerk / Supabase Auth | Google OAuth (1-click) + Email OTP fallback with built-in bot protection |
| **Caching & Rate Limiting** | Upstash Redis | Serverless key-value caching for store deal matrices and IP rate-limiting |
| **OCR Processing** | Google Cloud Vision API (Document Text) | Superior accuracy for cropped, low-light, or stylized mobile screenshots |
| **File Storage** | AWS S3 / Cloudinary | Ephemeral bucket storage with auto-lifecycle deletion (15 min TTL) |
| **Monitoring & Errors** | Sentry + PostHog | Real-time crash monitoring, API failure tracking, and user event funnels |
| **Deployment** | Vercel | Global edge network, native Next.js support, preview deployments |
| **Database Hosting** | Neon PostgreSQL | Serverless, auto-scaling, PITR backups |
| **CI/CD** | GitHub Actions | ESLint, TypeScript checks, build verification, auto-deploy |

---

## 2. Core System Data Flow Pipelines

### Pipeline A: Screenshot Ingestion & Interactive OCR

```
[User Uploads Image] ──► [Temp Upload to S3 (15 min TTL)] ──► [Google Cloud Vision API]
                                                                      │
[Client UI Pre-fills Form] ◄── [Structured JSON Payload] ◄───────────────┘
          │
          ├──► [User Reviews / Edits Fields]
          │
          └──► [Submit to PostgreSQL `user_coupons`] ──► [Delete Image from S3]
```

**Step-by-step breakdown:**

1. **Upload**: Client sends image to a secure pre-signed S3 upload URL
2. **Parsing**: S3 trigger invokes a serverless handler to pass the buffer to Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`)
3. **Extraction Logic**: RegEx filters parse patterns for:
   - Promo codes (uppercase alphanumeric strings 4–12 chars)
   - Expiration dates
   - Brand keywords (e.g., Myntra, Zomato)
4. **Correction Bridge (UI)**: Parsed fields populate an interactive form:
   - **Brand**: High-confidence match dropdown
   - **Code**: Text field (editable)
   - **Discount Value**: Number field (editable)
   - **Expiry Date**: Date picker (editable)
5. **Privacy Purge**: Raw image is deleted from S3 immediately post-parse OR purged via lifecycle policy after 15 minutes

### Pipeline B: The Multi-Tier Savings Stacker Engine

When a user requests a deal stack for a product or store cart, the engine executes a multi-layered SQL query and mathematical calculation in **under 150ms**.

#### The Calculation Formula

$$\text{Final Net Cost} = \text{Base Price} - \text{Discount}_{\text{coupon}} - \text{Discount}_{\text{voucher}} - \text{Cashback}_{\text{affiliate}} - \text{Discount}_{\text{card}}$$

#### TypeScript Interfaces

```typescript
interface SavingsStackInput {
  basePrice: number;
  storeId: string;
  userId?: string;
  selectedCardIds?: string[];
}

interface SavingsStackOutput {
  basePrice: number;
  bestCoupon: { code: string; discountAmount: number; source: 'PUBLIC' | 'PERSONAL' };
  voucherOption?: { provider: string; purchaseCost: number; faceValue: number; netSavings: number };
  affiliateCashback: { network: string; cashbackAmount: number; percentage: number };
  bestCardOffer?: { bankName: string; cardName: string; discountAmount: number };
  finalNetPayable: number;
  totalSaved: number;
  effectiveDiscountPercentage: number;
}
```

#### Stacking Execution Order (Strict Logical Dependency)

```
1. Base Product Price (e.g., ₹2,000 on Myntra)
   │
   ├──► 2. Apply Best Store Coupon (Public or User's Vault) ──► Subtotal 1 (e.g., -₹300 = ₹1,700)
   │
   ├──► 3. Check Discounted Gift Vouchers (Gyftr/Zave)       ──► Subtotal 2 (e.g., Buy ₹1,700 voucher @ 5% off = -₹85)
   │
   ├──► 4. Calculate Bank Instant Discount / UPI Offer      ──► Subtotal 3 (e.g., 10% instant card off = -₹170)
   │
   └──► 5. Calculate Outbound Affiliate Cashback           ──► Net Savings (e.g., 6% CashKaro = -₹102)
                                                                │
                                                                ▼
                                                FINAL NET PAYABLE: ₹1,343 (Saved ₹657 / 32.8%)
```

### Pipeline C: Data Freshness & Hybrid Validation Loop

To ensure expired coupons do not break user trust, the platform runs a two-tier validation mechanism:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        24-HOUR AUTOMATED CRON                          │
│       Vercel Cron Jobs / GitHub Actions (Executes daily at 00:00 UTC) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Queries active Affiliate Network API Endpoints (EarnKaro/Cuelinks)  │
│ 2. Compares active codes against PostgreSQL `coupons` table            │
│ 3. Auto-deprecates non-responsive public codes (`is_active = false`)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     COMMUNITY CROWD-SOURCED LOOP                       │
│    User clicks [Works 👍] or [Expired 👎] on offer card in Client UI   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ IF downvote_count >= 3 within 12 hours OR flag_ratio > 60%:           │
│   ──► Mark code status as `PENDING_REVIEW`                             │
│   ──► Temporarily hide from primary stack calculation                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Overview (PostgreSQL)

> **Schema Version**: 1.1 — ENUM types introduced via TRD-AMD-01 (2026-07-22)

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPE DEFINITIONS
-- Replaces all VARCHAR string-literal columns for:
--   1. Type safety enforced at the database level
--   2. Faster B-tree indexed queries vs VARCHAR comparisons
--   3. Prevents invalid values without application-layer guards
--   4. Enables PENDING_REVIEW state in Pipeline C (impossible
--      with a simple is_active BOOLEAN)
-- ============================================================

-- Source of a coupon (how it entered the system)
CREATE TYPE coupon_source AS ENUM (
    'PUBLIC_SCRAPED',  -- scraped from affiliate network feeds (EarnKaro/Cuelinks)
    'USER_OCR',        -- submitted by a user via screenshot OCR upload
    'COMMUNITY',       -- manually submitted to the PUBLIC community vault (visible to all, reviewed)
    'USER_MANUAL'      -- manually entered by user to their OWN private vault only (TRD-AMD-02)
);

-- Full lifecycle status of a coupon
-- NOTE: Replaces is_active BOOLEAN — BOOLEAN cannot express PENDING_REVIEW
CREATE TYPE coupon_status AS ENUM (
    'ACTIVE',          -- verified and visible in stack calculations
    'PENDING_REVIEW',  -- flagged by ≥3 downvotes or >60% flag ratio (Pipeline C)
    'EXPIRED',         -- past expires_at or auto-deprecated by 24h cron
    'INACTIVE'         -- manually deactivated by admin
);

-- Type of discount applied by a coupon
CREATE TYPE discount_type AS ENUM (
    'PERCENTAGE',  -- e.g. 10% off
    'FLAT'         -- e.g. ₹200 flat off
);

-- Card category for bank_offers
CREATE TYPE card_type AS ENUM (
    'CREDIT',  -- credit card only
    'DEBIT',   -- debit card only
    'ALL'      -- applies to all card types including UPI
);

-- ============================================================
-- TABLES
-- ============================================================

-- Users Table
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    clerk_id            VARCHAR(255) UNIQUE NOT NULL,
    full_name           VARCHAR(100),
    cumulative_savings  NUMERIC(10, 2) DEFAULT 0.00,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);  -- hot path: auth lookup

-- Stores / Merchants
CREATE TABLE stores (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                     VARCHAR(100) NOT NULL,
    slug                     VARCHAR(100) UNIQUE NOT NULL,
    logo_url                 TEXT,
    base_url                 TEXT NOT NULL,
    affiliate_partner_name   VARCHAR(50),  -- e.g. 'EarnKaro', 'Cuelinks'
    affiliate_redirect_url   TEXT,
    default_cashback_percent NUMERIC(5, 2) DEFAULT 0.00
);

CREATE INDEX idx_stores_slug ON stores(slug);  -- URL-based store lookup

-- Coupons (Public Vault + User Personal Vault)
-- status ENUM replaces is_active BOOLEAN to support PENDING_REVIEW (Pipeline C)
CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id            UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = public coupon
    code                VARCHAR(50) NOT NULL,
    discount_type       discount_type NOT NULL,           -- ENUM: PERCENTAGE | FLAT
    discount_value      NUMERIC(10, 2) NOT NULL,
    min_cart_value      NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    source              coupon_source NOT NULL,           -- ENUM: PUBLIC_SCRAPED | USER_OCR | COMMUNITY
    status              coupon_status NOT NULL DEFAULT 'ACTIVE',  -- ENUM: full lifecycle
    upvotes             INT DEFAULT 0,
    downvotes           INT DEFAULT 0,
    expires_at          TIMESTAMP WITH TIME ZONE,
    conditions          JSONB DEFAULT '{}'::jsonb,        -- e.g. {"first_order_only": true}
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Critical query paths — indexed for performance:
CREATE INDEX idx_coupons_store_status    ON coupons(store_id, status);   -- vault lookup
CREATE INDEX idx_coupons_expires_at      ON coupons(expires_at);          -- 24h cron cleanup
CREATE INDEX idx_coupons_source          ON coupons(source);              -- admin/analytics filters
CREATE INDEX idx_coupons_downvotes       ON coupons(downvotes);           -- Pipeline C threshold check

-- Bank & UPI Payment Offers
CREATE TABLE bank_offers (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id                 UUID REFERENCES stores(id) ON DELETE CASCADE,
    bank_name                VARCHAR(100) NOT NULL,  -- e.g. 'HDFC', 'ICICI', 'SBI', 'GPay UPI'
    card_type                card_type,              -- ENUM: CREDIT | DEBIT | ALL
    discount_percent         NUMERIC(5, 2) NOT NULL,
    max_discount_amount      NUMERIC(10, 2) NOT NULL,
    min_transaction_amount   NUMERIC(10, 2) DEFAULT 0.00,
    is_active                BOOLEAN DEFAULT TRUE,   -- simple active flag; no PENDING_REVIEW needed here
    valid_until              TIMESTAMP WITH TIME ZONE,
    conditions               JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_bank_offers_store_active ON bank_offers(store_id, is_active, valid_until);

-- Voucher Affiliate Links (Gyftr / Zave)
CREATE TABLE voucher_deals (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id              UUID REFERENCES stores(id) ON DELETE CASCADE,
    provider_name         VARCHAR(50) NOT NULL,  -- 'Gyftr', 'Zave', 'Amazon'
    discount_percent      NUMERIC(5, 2) NOT NULL,
    affiliate_purchase_url TEXT NOT NULL,
    is_active             BOOLEAN DEFAULT TRUE
);
```

### 3.1 ENUM vs VARCHAR — Decision Rationale (TRD-AMD-01)

| Column (Before) | Type Before | Type After | Benefit |
|-----------------|------------|------------|--------|
| `coupons.discount_type` | `VARCHAR(20)` | `discount_type ENUM` | DB rejects any value outside `PERCENTAGE`, `FLAT` |
| `coupons.source` | `VARCHAR(20)` | `coupon_source ENUM` | DB rejects invalid sources; faster index scans |
| `coupons.is_active` | `BOOLEAN` | `coupon_status ENUM` | Enables `PENDING_REVIEW` state (Pipeline C requirement) |
| `bank_offers.card_type` | `VARCHAR(50)` | `card_type ENUM` | DB rejects invalid card categories |

### 3.2 Why `is_active BOOLEAN` Was Insufficient for Coupons

Pipeline C (Data Freshness Loop) requires a **`PENDING_REVIEW`** state — a coupon that is:
- **Not `ACTIVE`** (hidden from stack calculations)
- **Not `EXPIRED`** (still within its validity window)
- **Not `INACTIVE`** (admin didn't deactivate it)

A simple `BOOLEAN` can only represent two states (`TRUE` / `FALSE`). Setting `is_active = FALSE` when a coupon hits the downvote threshold conflates temporary crowd-flagging with permanent deactivation — making it impossible to distinguish between the two in admin dashboards, cron jobs, or analytics.

The `coupon_status ENUM` solves this cleanly:

```sql
-- Pipeline C: crowd downvote threshold hit
UPDATE coupons
SET status = 'PENDING_REVIEW'
WHERE id = $1;

-- 24h cron: auto-expire past expiry date
UPDATE coupons
SET status = 'EXPIRED'
WHERE expires_at < NOW()
  AND status = 'ACTIVE';

-- Stack engine: only show genuinely active coupons
SELECT * FROM coupons
WHERE store_id = $1
  AND status = 'ACTIVE'
ORDER BY discount_value DESC;
```

### 3.3 Recommended Indexes Summary

| Index | Table | Columns | Query Pattern |
|-------|-------|---------|---------------|
| `idx_users_clerk_id` | users | clerk_id | Auth session lookup |
| `idx_stores_slug` | stores | slug | URL-based store page load |
| `idx_coupons_store_status` | coupons | store_id, status | Coupon vault lookup (hottest query) |
| `idx_coupons_expires_at` | coupons | expires_at | 24h cron expiry sweep |
| `idx_coupons_source` | coupons | source | Admin filter / analytics |
| `idx_coupons_downvotes` | coupons | downvotes | Pipeline C threshold scan |
| `idx_bank_offers_store_active` | bank_offers | store_id, is_active, valid_until | Card optimizer query |

### 3.4 Implied Tables from App Flow (Document 03)

> These tables are implied by App Flow design decisions and will be fully specified in Document 05 (Backend Schema). They are pre-registered here for engineering awareness.

```sql
-- Implied by Onboarding Step 2 & /cards page (App Flow §3.2)
-- User's saved credit card / UPI payment preferences
CREATE TABLE user_cards (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    bank_name   VARCHAR(100) NOT NULL,  -- e.g. 'HDFC', 'SBI', 'GPay'
    card_type   card_type NOT NULL,     -- ENUM: CREDIT | DEBIT | ALL
    card_label  VARCHAR(100),           -- e.g. 'HDFC Millennia Credit'
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);

-- Implied by App Flow Flow C: Share & Stack Invite Modal
-- Persistent snapshot of a user's savings stack for public sharing
CREATE TABLE shared_stacks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stack_id        VARCHAR(12) UNIQUE NOT NULL,  -- short ID for URL (e.g. 'a3k9m2')
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    store_slug      VARCHAR(100) NOT NULL,
    base_price      NUMERIC(10,2) NOT NULL,
    total_saved     NUMERIC(10,2) NOT NULL,
    stack_snapshot  JSONB NOT NULL,   -- full SavingsStackOutput JSON
    view_count      INT DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_stacks_stack_id ON shared_stacks(stack_id);
CREATE INDEX idx_shared_stacks_user_id  ON shared_stacks(user_id);
```

---

## 4. Security, Legal & Performance Specifications

### 4.1 Privacy & Data Sanitization

| Concern | Policy | Implementation |
|---------|--------|----------------|
| **Screenshot Retention** | Zero retention policy | S3 auto-lifecycle deletion after 15 minutes; deleted immediately post-parse |
| **PII Storage** | Minimal PII only | Only email, name, and clerk_id stored; NO payment card numbers, passwords, or bank details |
| **Row-Level Security** | Users access only their data | PostgreSQL RLS policies tied to `user_id` |
| **Sensitive OCR Data** | Never persisted | Raw image buffer discarded after Vision API call |

### 4.2 Compliance & Legal Badges

**ASCI Affiliate Disclosure** (Legally Required in India):

Every outbound button leading to an affiliate link must render a standard disclosure badge:

> *"Disclosure: MoneySaver may earn an affiliate commission when you purchase through links on our site at no additional cost to you."*

**Zero Native KYC Overhead**:
Gift voucher conversions route directly through external provider URLs (Gyftr/Zave/Amazon), ensuring MoneySaver processes zero prepaid instrument transactions and remains fully outside **RBI PPI regulations**.

### 4.3 API Rate Limiting (Upstash Redis)

| Endpoint / Action | Limit | Window | Scope |
|------------------|-------|--------|-------|
| Public Stacker Search | 30 requests | Per minute | Per IP |
| OCR Upload Endpoint | 5 requests | Per minute | Per User |
| Sign-up / OTP Requests | 3 requests | Per hour | Per IP |

### 4.4 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Stacker Engine Calculation | ≤ 150ms | Server-side timer logs |
| Search Result Latency (P95) | ≤ 5 seconds | PostHog performance events |
| OCR Processing Time | ≤ 8 seconds | Vision API + network overhead |
| Page Load (LCP) | ≤ 2.5 seconds | Core Web Vitals (Vercel Analytics) |
| API Availability | ≥ 99.5% uptime | Sentry uptime monitoring |

---

## 5. Deployment Architecture & CI/CD Pipeline

### 5.1 Infrastructure Map

```
                               ┌──────────────────────────┐
                               │     GitHub Repository    │
                               └────────────┬─────────────┘
                                            │
                                            ▼
                               ┌──────────────────────────┐
                               │   GitHub Actions CI/CD   │
                               │  - ESLint & TypeScript   │
                               │  - Build Verification    │
                               └────────────┬─────────────┘
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
          ┌──────────────────────┐                    ┌──────────────────────┐
          │  PREVIEW DEPLOYMENT  │                    │  PRODUCTION DEPLOY  │
          │    Vercel Preview    │                    │     Vercel Main      │
          └──────────────────────┘                    └──────────┬───────────┘
                                                                 │
                                                    ┌────────────┴────────────┐
                                                    ▼                         ▼
                                         ┌────────────────────┐    ┌────────────────────┐
                                         │ Neon Postgres DB   │    │ Upstash Redis      │
                                         │ (Production Branch)│    │ (Global Cache)     │
                                         └────────────────────┘    └────────────────────┘
```

### 5.2 Environment Strategy

| Environment | Branch | Database | Redis | Notes |
|-------------|--------|----------|-------|-------|
| **Local Dev** | `feat/*`, `fix/*` | Local Postgres or Neon dev branch | Local Redis | `.env.local` file |
| **Preview** | `develop` | Neon preview branch | Upstash dev instance | Auto-deployed on PR |
| **Production** | `main` | Neon production branch | Upstash production | Auto-deployed on merge to main |

### 5.3 Secrets Management

All third-party secrets (Google Vision Credentials, Clerk Keys, DB URLs, Upstash tokens) are stored in **Vercel's encrypted secrets manager** — never in the codebase.

| Secret Category | Storage | Rotation Policy |
|----------------|---------|----------------|
| Clerk API Keys | Vercel Env Vars | On compromise |
| Google Cloud Vision Credentials | Vercel Env Vars | Every 90 days |
| Neon DB Connection String | Vercel Env Vars | Every 90 days |
| Upstash Redis Token | Vercel Env Vars | Every 90 days |
| AWS S3 Credentials | Vercel Env Vars | Every 90 days |

---

## 6. TRD Decisions & Rationale Log

| Decision ID | Decision | Alternatives Considered | Why This Choice |
|-------------|----------|------------------------|----------------|
| TRD-D01 | **Next.js App Router** over plain React | Vite + React, Remix | SSR for deal page SEO; Server Components for zero-bundle data fetching |
| TRD-D02 | **Drizzle ORM** over Prisma | Prisma, TypeORM, raw SQL | Drizzle is lighter, fully type-safe, and Neon-native; Prisma adds overhead |
| TRD-D03 | **Upstash Redis** over self-hosted | ElastiCache, Render Redis | Serverless billing (pay per request), no cold-start, Vercel-native integration |
| TRD-D04 | **Neon PostgreSQL** over Supabase DB | Supabase, PlanetScale, Railway | Neon has true serverless branching per environment; best Vercel DX |
| TRD-D05 | **Clerk Auth** over custom JWT | Auth.js (NextAuth), Supabase Auth | Clerk handles OTP, OAuth, bot protection, MFA out-of-the-box with zero boilerplate |
| TRD-D06 | **S3 ephemeral bucket** for OCR uploads | Permanent storage, Cloudinary | Privacy-first: auto-delete (15 min TTL) eliminates screenshot retention risk |
| TRD-D07 | **shadcn/ui** over Chakra/MUI | Radix UI raw, Chakra, Material UI | Fully customizable, copy-paste architecture, no runtime overhead |
| TRD-D08 | **TanStack Query** for server state | SWR, Apollo, raw fetch | Best-in-class caching, background refetch, optimistic updates for voting UI |

---

## 7. TRD Amendments

### TRD-AMD-01 — PostgreSQL ENUM Types for String Literal Columns

**Amendment Date**: 2026-07-22  
**Raised By**: AI Engineering Lead (agent suggestion)  
**Accepted By**: Product Owner  
**Status**: ✅ Implemented in Schema v1.1  

**Problem with original schema:**  
The original schema used `VARCHAR(20)` and `VARCHAR(50)` for columns that only ever hold a fixed set of string values (`'PUBLIC_SCRAPED'`, `'USER_OCR'`, `'PERCENTAGE'`, etc.). This creates three risks:
1. **No DB-level validation** — any string can be inserted; bugs require application-layer guards
2. **Slower queries** — VARCHAR comparisons are slower than ENUM ordinal comparisons on indexed columns
3. **Incomplete state machine** — `is_active BOOLEAN` cannot represent `PENDING_REVIEW` (required by Pipeline C)

**Changes applied:**

| ENUM Type | Values | Replaces |
|-----------|--------|----------|
| `coupon_source` | `PUBLIC_SCRAPED`, `USER_OCR`, `COMMUNITY` | `coupons.source VARCHAR(20)` |
| `coupon_status` | `ACTIVE`, `PENDING_REVIEW`, `EXPIRED`, `INACTIVE` | `coupons.is_active BOOLEAN` |
| `discount_type` | `PERCENTAGE`, `FLAT` | `coupons.discount_type VARCHAR(20)` |
| `card_type` | `CREDIT`, `DEBIT`, `ALL` | `bank_offers.card_type VARCHAR(50)` |

**Additional improvement:** Comprehensive index strategy added to all tables (see §3.3).

---

### TRD-AMD-02 — `USER_MANUAL` Added to `coupon_source` ENUM

**Amendment Date**: 2026-07-22  
**Raised By**: App Flow Document 03 (Manual Coupon Entry Drawer — Flow B)  
**Accepted By**: Product Owner  
**Status**: ✅ Implemented in Schema  

**Problem identified in App Flow:**  
Document 03 Addendum (Flow B: Manual Coupon Entry Drawer) introduces a new path where users manually type in a coupon code via a form. This is distinct from:
- `USER_OCR` — code extracted from a screenshot by Vision AI
- `COMMUNITY` — code submitted to the **public** community vault for all users to see

`USER_MANUAL` specifically represents a coupon added to the **user's private vault only** (`user_id IS NOT NULL`) by direct form input. Using `COMMUNITY` for this would incorrectly expose a user's private coupon to all other users.

**Change applied to `coupon_source` ENUM:**

```sql
-- After TRD-AMD-02:
CREATE TYPE coupon_source AS ENUM (
    'PUBLIC_SCRAPED',  -- affiliate feed scraping
    'USER_OCR',        -- screenshot parsed by Vision AI
    'COMMUNITY',       -- user-submitted to PUBLIC vault (reviewed before activation)
    'USER_MANUAL'      -- user-typed into PRIVATE vault form (no review needed)
);
```

**Additional tables pre-registered:**
- `user_cards` — from Onboarding Step 2 + `/cards` page
- `shared_stacks` — from Flow C (Share Stack) with `/s/[stackId]` public URL

*(Full specification for both tables deferred to Document 05 — Backend Schema)*

---

## 8. Proactive Architecture Safeguards & Engineering Standards (TRD-AMD-03)

### 8.1 JIT (Just-In-Time) User Sync Fallback
To prevent foreign-key reference failures caused by Clerk `user.created` webhook latency during serverless cold starts:
- All protected API routes and Server Actions verify `users` table record existence via `clerkId`.
- If missing, the server handler auto-provisions the DB user row on the fly using `auth()` session claims before attempting child table inserts (`user_cards`, `coupons`).

### 8.2 Neon WebSocket Connection Pooling
- All database connections utilize `@neondatabase/serverless` connection poolers over WebSockets (`neonConfig.webSocketConstructor = ws`).
- Prevents database connection exhaustion during serverless horizontal scaling spikes.

### 8.3 Internal Short-Link Gateway (`/r/[storeSlug]`)
- Outbound merchant CTA buttons navigate through `/r/[storeSlug]?token=[hmacToken]`.
- Reads cached affiliate redirect templates from Upstash Redis (TTL 24h).
- Sub-50ms redirect response times; decouples frontend code from 3rd-party link schema changes.

### 8.4 Dual Auth Gateway Specification
- All `/api/v1/*` endpoints accept authentication via both:
  1. `httpOnly` Clerk session cookies (Web App)
  2. `Authorization: Bearer <clerk_token>` HTTP header (v2 Browser Extension compatibility)

### 8.5 Downvote Abuse Prevention & Account Gating
- `coupon_flags` table enforces `CONSTRAINT unique_user_flag UNIQUE(coupon_id, user_id)`.
- Downvote API endpoint gates flag submission on `users.created_at <= NOW() - INTERVAL '24 hours'`.

---

*Document prepared for MoneySaver — SaverStack | TRD Version 1.3 | 2026-07-22 (Amended)*  
*TRD v1.0 canonical. TRD-AMD-01: ENUM refactor. TRD-AMD-02: USER_MANUAL + implied tables. TRD-AMD-03: Proactive Safeguards.*
