# ⚙️ Backend Schema & API Specifications

**App Name**: MoneySaver (SaverStack)  
**Document**: 05 — Backend Schema & API Specifications  
**Version**: 1.2 (Updated with Section 8: Security & Proactive Safeguard Specifications)  
**Date**: 2026-07-22  
**Status**: ✅ Complete  
**Prepared By**: Product Owner + AI Engineering Lead  

---

## 1. Complete Database Schema (PostgreSQL)

The database schema is designed for high query performance, relational integrity, and schema flexibility via JSONB for dynamic promotional terms.

### Entity Relationships Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 ENTITY RELATIONS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌───────────────┐           ┌───────────────┐           ┌─────────────────┐   │
│   │     users     │1         *│ user_coupons  │*         1│     stores      │   │
│   │───────────────│───────────│───────────────│───────────│─────────────────│   │
│   │ id (PK)       │           │ id (PK)       │           │ id (PK)         │   │
│   │ clerk_id (UQ) │           │ user_id (FK)  │           │ slug (UQ)       │   │
│   │ referral_code │           │ store_id (FK) │           └────────┬────────┘   │
│   └───────┬───────┘           └───────┬───────┘                    │            │
│           │                   ───────┬┘                            │            │
│          1│                          │1                            │1           │
│           │                          │                             │            │
│           ▼*                         ▼*                            ▼*           │
│   ┌───────────────┐          ┌───────────────┐            ┌─────────────────┐   │
│   │  user_cards   │          │ coupon_flags  │            │   bank_offers   │   │
│   │───────────────│          │───────────────│            │─────────────────│   │
│   │ id (PK)       │          │ id (PK)       │            │ id (PK)         │   │
│   │ user_id (FK)  │          │ coupon_id(FK) │            │ store_id (FK)   │   │
│   └───────────────┘          └───────────────┘            └─────────────────┘   │
│                                                                    │1           │
│                                                                    │            │
│                                                                    ▼*           │
│                                                           ┌─────────────────┐   │
│                                                           │  voucher_deals  │   │
│                                                           │─────────────────│   │
│                                                           │ id (PK)         │   │
│                                                           │ store_id (FK)   │   │
│                                                           └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### SQL Schema DDL Definitions

```sql
-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Updated with Referral Tracking & Savings Goals)
CREATE TYPE user_role AS ENUM ('GUEST', 'USER', 'ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    referral_code VARCHAR(20) UNIQUE NOT NULL, -- Viral referral tracking code
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Inviter User ID
    savings_goal NUMERIC(10, 2) DEFAULT 5000.00 NOT NULL, -- Monthly goal (default ₹5,000)
    role user_role DEFAULT 'USER' NOT NULL,
    cumulative_savings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. STORES TABLE
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    base_url TEXT NOT NULL,
    affiliate_partner_name VARCHAR(50), -- e.g. 'EarnKaro', 'Cuelinks'
    affiliate_redirect_url TEXT,
    default_cashback_percent NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. COUPONS TABLE (Updated with OCR Verification Confidence)
CREATE TYPE coupon_source AS ENUM ('PUBLIC_SCRAPED', 'USER_OCR', 'USER_MANUAL', 'COMMUNITY');
CREATE TYPE coupon_discount_type AS ENUM ('PERCENTAGE', 'FLAT');
CREATE TYPE verification_status AS ENUM ('VERIFIED', 'PENDING_REVIEW', 'EXPIRED');

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = Public Coupon
    code VARCHAR(50) NOT NULL,
    discount_type coupon_discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_cart_value NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    max_discount_amount NUMERIC(10, 2),
    source coupon_source NOT NULL,
    status verification_status DEFAULT 'VERIFIED' NOT NULL,
    ocr_confidence NUMERIC(3, 2) DEFAULT 1.00 NOT NULL, -- Vision OCR confidence score (e.g. 0.87)
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    upvotes INT DEFAULT 0 NOT NULL,
    downvotes INT DEFAULT 0 NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    conditions JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g. {"first_order_only": true, "categories": ["fashion"]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. USER SAVED CARDS & PAYMENT PREFERENCES
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL, -- e.g. 'HDFC', 'ICICI', 'SBI'
    card_name VARCHAR(100) NOT NULL, -- e.g. 'Millennia', 'Cashback'
    card_type VARCHAR(20) NOT NULL, -- 'CREDIT', 'DEBIT', 'UPI'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_card UNIQUE(user_id, bank_name, card_name)
);

-- 5. BANK & UPI PROMOTIONAL OFFERS
CREATE TABLE bank_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    card_type VARCHAR(20) NOT NULL, -- 'CREDIT', 'DEBIT', 'ALL'
    discount_percent NUMERIC(5, 2) NOT NULL,
    max_discount_amount NUMERIC(10, 2) NOT NULL,
    min_transaction_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    conditions JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g. {"valid_days": ["Sat", "Sun"]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. VOUCHER DEALS (Gyftr / Zave / Amazon Gift Cards)
CREATE TABLE voucher_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL, -- 'Gyftr', 'Zave', 'Amazon'
    discount_percent NUMERIC(5, 2) NOT NULL,
    affiliate_purchase_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. COUPON FLAGS (Crowd Validation Downvotes)
CREATE TABLE coupon_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL, -- 'EXPIRED', 'MIN_CART_NOT_MET', 'CATEGORY_EXCLUDED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_flag UNIQUE(coupon_id, user_id)
);
```

## 2. Database Indexes & Query Optimization Strategy

To meet our strict performance target of `< 150ms` calculation latency for the Savings Stacker Engine, targeted composite indexes are applied to high-frequency query paths.

| Table | Index Name | Columns Indexed | Target Query Optimization |
|---|---|---|---|
| `stores` | `idx_stores_slug` | `slug` | Fast store lookup by URL route (`/deals/myntra`). |
| `stores` | `idx_stores_search` | `name, slug` | Fast autocomplete search for store names and slugs. |
| `coupons` | `idx_coupons_stacker` | `(store_id, is_active, status, expires_at)` | Fetches all active coupons for a store in a single index scan. |
| `coupons` | `idx_coupons_user_vault` | `(user_id, is_active)` | Instantly loads user's personal vault coupons. |
| `users` | `idx_users_referral` | `referral_code` | Fast viral referral code verification on signup. |
| `bank_offers` | `idx_bank_offers_lookup` | `(store_id, is_active, bank_name)` | Quick match between store cart and user's saved bank cards. |
| `coupon_flags` | `idx_flags_coupon` | `(coupon_id)` | Fast aggregation for downvote counter validation. |

## 3. Auth Model & Row Level Security (RLS) Rules

MoneySaver enforces access control at both the API Gateway (Clerk JWT validation) and the Database level using PostgreSQL Row Level Security (RLS).

### User Roles & Permissions

| Role | Permissions & Access Scope |
|---|---|
| `GUEST` | Read-only access to public store deals, public coupons, and live stack preview. Cannot access personal vaults or save coupons. |
| `USER` | Full read/write access to personal vault (`user_id = auth.uid()`), user payment cards, and flag submissions. |
| `ADMIN` | System-wide read/write access. Can override coupon statuses, manage store list, and review flagged codes. |

### PostgreSQL RLS Policies

```sql
-- Enable RLS on user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_flags ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- COUPONS POLICIES
CREATE POLICY "Public coupons readable by all" ON coupons
    FOR SELECT USING (user_id IS NULL AND is_active = TRUE);

CREATE POLICY "Users can read own vault coupons" ON coupons
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert into own vault" ON coupons
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own vault coupons" ON coupons
    FOR DELETE USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));

-- USER CARDS POLICIES
CREATE POLICY "Users manage own cards" ON user_cards
    FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
```

## 4. Sensitive Fields & Encryption Policy

To protect user privacy and fulfill compliance standards:

- **User PII (`users.email`)**: Stored encrypted at rest using AES-256 in Neon PostgreSQL. Auth sessions are offloaded to Clerk/Supabase Auth.
- **Volatile Image Buffers (OCR Uploads)**: Reward screenshots uploaded for OCR are routed to an ephemeral AWS S3 bucket with an automatic 15-minute expiration policy (Lifecycle Rule). Images are purged immediately after parsing.
- **Affiliate API Keys & Third-Party Secrets**: Stored securely in Vercel Encrypted Environment Variables; never exposed to the client bundle.

## 5. File & Media Storage Structure

```
S3 Ephemeral Bucket: s3://moneysaver-temp-ocr/
└── uploads/
    └── {userId}/
        └── {timestamp}_{randomHash}.png   <-- Auto-purged after 15 min via S3 Lifecycle Policy

S3 Public Assets Bucket: s3://moneysaver-assets/
└── stores/
    ├── logos/
    │   ├── myntra.svg
    │   ├── amazon.svg
    │   └── zomato.svg
    └── banners/
        └── hero-myntra.webp
```

## 6. Webhooks & Event Triggers

| Trigger Source | Event Name | Action / Executed Handler |
|---|---|---|
| Clerk Auth | `user.created` | Syncs new user record to PostgreSQL `users` table & generates unique `referral_code` |
| S3 Object Created | `s3:ObjectCreated:*` | Triggers Google Vision OCR parsing worker pipeline |
| DB Flag Insert | `AFTER INSERT ON coupon_flags` | IF downvotes >= 3, sets `status = 'PENDING_REVIEW'` |
| Vercel Cron | `0 0 * * *` (Daily) | Runs 24h cron to deprecate expired coupons & sync APIs |

## 7. Comprehensive API Endpoint Specification

### Auth, Onboarding & Analytics

| Method | Endpoint Route | Auth Required | Request Payload | Response / Function |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/webhook` | Webhook Secret | Clerk User Event JSON | Syncs user creation/deletion; generates unique `referral_code`. |
| `GET` | `/api/v1/user/profile` | USER | None | Returns profile info, referral code, cards, cumulative savings. |
| `GET` | `/api/v1/user/savings-summary` | USER | `?period=monthly` | **[NEW]** Returns savings breakdown vs. `savings_goal` (progress %). |
| `POST` | `/api/v1/user/cards` | USER | `{ cards: [...] }` | Saves user's credit/debit card preferences. |

### Search, Deals & Stacker

| Method | Endpoint Route | Auth Required | Request Payload | Response / Function |
|---|---|---|---|---|
| `GET` | `/api/v1/stores/search` | Public | `?q=myntra` | **[NEW]** Fast autocomplete search for store names, logos, and slugs. |
| `POST` | `/api/v1/stacker/calculate` | GUEST / USER | `{ storeSlug, basePrice, cardIds[] }` | Executes 5-tier stack algorithm; returns Net Payable matrix. |
| `POST` | `/api/v1/deals/share` | GUEST / USER | `{ storeSlug, savedAmount, stackDetails }` | **[NEW]** Generates shareable short-link & social preview metadata. |
| `GET` | `/api/v1/stores/:slug` | Public | None | Returns store details, public coupons, bank offers, voucher links. |

### Vault & OCR Ingestion

| Method | Endpoint Route | Auth Required | Request Payload | Response / Function |
|---|---|---|---|---|
| `POST` | `/api/v1/vault/ocr-upload` | USER | FormData (image) | Uploads temp S3 image, runs OCR, returns parsed text + `ocr_confidence`. |
| `POST` | `/api/v1/vault/coupons` | USER | `{ storeId, code, discountValue, expiryDate }` | Saves parsed/manual coupon to user vault. |
| `DELETE` | `/api/v1/vault/coupons/:id` | USER | None | Deletes coupon from personal vault. |
| `POST` | `/api/v1/coupons/:id/flag` | USER | `{ reason }` | Gated on account age > 24h; Records downvote flag; updates downvote counter. |
| `GET` | `/r/:storeSlug` | Public | `?token=hmac` | Internal short-link redirect gateway; logs affiliate click and redirects to merchant. |

---

## 8. Security & Proactive Safeguard Specifications

### 8.1 JIT (Just-In-Time) User Sync Fallback
- Server Actions & Protected API handlers perform JIT check:
  ```typescript
  let user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!user) {
    // Provision user row on-the-fly using Clerk session claims
    [user] = await db.insert(users).values({
      clerkId: userId,
      email: sessionClaims.email,
      fullName: sessionClaims.name,
      referralCode: generateReferralCode(),
    }).returning();
  }
  ```

### 8.2 Dual Auth Gateway Middleware
- API Gateway accepts both `httpOnly` Clerk cookies and `Authorization: Bearer <jwt>` headers:
  ```typescript
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? req.cookies.get("__session")?.value;
  ```

### 8.3 Downvote Gating Policy
- Endpoint `/api/v1/coupons/:id/flag` checks `users.created_at`:
  ```typescript
  const isEligible = user.createdAt <= new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (!isEligible) throw new Error("Account must be at least 24 hours old to flag codes.");
  ```

