# 🚀 Implementation Plan & Build Roadmap

**App Name**: MoneySaver (SaverStack)  
**Document**: 06 — Implementation Plan & Build Roadmap  
**Version**: 1.1 (Updated with Proactive Architecture Safeguards & ASCI Interstitial Toast)  
**Date**: 2026-07-22  
**Status**: ✅ Complete  
**Prepared By**: Product Owner + AI Engineering Lead  

> This document establishes the step-by-step engineering roadmap for building MoneySaver (SaverStack). It follows a strict dependency order—ensuring data structures, authentication, and core algorithms are fully functional before building UI layouts or deploying to production.

---

## Master Implementation Summary

| Phase | Core Milestone | Target Timeline | Primary Tech Component |
|---|---|---|---|
| **01** | Setup & Env Validation | Day 1 | Next.js 14, Tailwind, Zod |
| **02** | DB Schema & Migrations | Day 2 | Neon PostgreSQL, Drizzle ORM |
| **03** | Auth & User Onboarding | Days 3–4 | Clerk Auth, Webhooks, Middleware |
| **04** | Core Engine & OCR Pipeline | Days 5–9 | Google Vision API, AWS S3, Stacker Engine |
| **05** | UI Polish & Responsive Shell | Days 10–12 | Tailwind, shadcn/ui, Framer Motion |
| **06** | Testing, Edge Cases & Safety | Days 13–14 | Vitest, Upstash Redis, Sentry |
| **07** | Deployment & Compliance | Day 15 | Vercel, S3 Lifecycle, ASCI Badges |

---

## Phase 1: Project Setup, Repository & Environment Configuration

### Goal
Establish a fully typed, scalable monorepo-style folder architecture with strict environment variable validation, package manager setup, and linting standards.

### Key Tasks
- Initialize Next.js 14+ App Router project: `pnpm create next-app@latest moneysaver --typescript --tailwind --eslint --app`
- Install core dependencies:
  - **Database & ORM**: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
  - **Auth**: `@clerk/nextjs`
  - **Vision & Storage**: `@google-cloud/vision`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
  - **Caching & Rate Limiting**: `@upstash/redis`, `@upstash/ratelimit`
  - **UI & Styling**: `tailwind-merge`, `clsx`, `lucide-react`, `framer-motion`, shadcn-ui components
- Establish folder structure:
  ```text
  money-saver/
  ├── app/                  # App Router routes and page components
  │   ├── (auth)/           # Login, Signup, Onboarding
  │   ├── (dashboard)/      # Dashboard, Stacker, Vault, Cards, Profile
  │   └── api/v1/           # API handlers and webhooks
  ├── components/           # UI components (atoms, molecules, shells)
  ├── lib/                  # Core engines (Stacker logic, OCR parser, DB client)
  ├── db/                   # Drizzle schema definitions and migrations
  ├── types/                # Global TypeScript interfaces and API schemas
  └── env.mjs               # Zod environment variable validation
  ```
- Configure strict environment variable schema (`env.mjs`) for runtime validation:
  `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `GOOGLE_VISION_CREDENTIALS`, `AWS_S3_BUCKET_NAME`, `UPSTASH_REDIS_REST_URL`.

### Explicit 'Done' Criteria
- `pnpm dev` boots without TypeScript or ESLint warnings on `http://localhost:3000`.
- Missing environment variables immediately crash server startup with a descriptive Zod validation error.
- Clean initial repository committed and pushed to GitHub main branch.

---

## Phase 2: Database Schema, ORM Setup & Migrations

### Goal
Instantiate the Neon PostgreSQL serverless database, configure Drizzle ORM schemas with foreign keys and custom indexes, and execute seed scripts for core store data.

### Key Tasks
- Configure `drizzle.config.ts` connected to Neon PostgreSQL over WebSockets using `@neondatabase/serverless` pooler (`neonConfig.webSocketConstructor = ws`).
- Define TypeScript schema files in `/db/schema/`:
  - `users.ts` (with `referral_code`, `savings_goal`, `role` enums)
  - `stores.ts` (with `slug`, `affiliate_redirect_url`)
  - `coupons.ts` (with `ocr_confidence`, `source`, `discount_type` enums)
  - `user_cards.ts` (with unique constraints per user/bank/card)
  - `bank_offers.ts`, `voucher_deals.ts`, `coupon_flags.ts` (with `CONSTRAINT unique_user_flag UNIQUE(coupon_id, user_id)`)
- Create and run initial migration: `pnpm drizzle-kit generate` followed by `pnpm drizzle-kit push`.
- Build a database seed script (`/db/seed.ts`) populating top Indian e-commerce merchants (Myntra, Amazon, Flipkart, Zomato, Ajio) and common bank card discount rules (HDFC, SBI, ICICI).

### Explicit 'Done' Criteria
- `pnpm drizzle-kit studio` visualizes all 7 relational tables with indexes and foreign keys correctly linked.
- Seeding script executes successfully; database responds to queries in under 30ms.

---

## Phase 3: Authentication, Webhook Sync & Onboarding Flow

### Goal
Implement secure user authentication using Clerk (Google OAuth + Email OTP), sync user profiles to PostgreSQL via webhooks, and guide new users through a 2-step preference setup.

### Key Tasks
- Wrap root layout (`app/layout.tsx`) in `<ClerkProvider>`.
- Build Clerk webhook listener at `/api/v1/auth/webhook` (`user.created` event) that automatically inserts a row into `users` table and generates a 6-character unique `referral_code`.
- Build **JIT User Sync Fallback** inside server actions and protected API route middleware to auto-provision user rows if missing during cold-start webhook latency.
- Implement Dual Auth middleware in `middleware.ts` supporting both `httpOnly` Clerk cookies and `Authorization: Bearer <token>` headers (public: `/`, `/deals/*`, `/r/*`, `/api/v1/stacker/calculate`; protected: `/dashboard`, `/vault`, `/cards`, `/profile`).
- Build `/onboarding` 2-step setup page:
  - **Step 1**: Select owned credit/debit cards & payment apps (inserts into `user_cards`).
  - **Step 2**: Optional initial coupon screenshot upload prompt.

```text
[Unauthenticated User] ──► [Sign in with Google] ──► [Clerk Webhook Syncs to DB]
                                                             │
                                                             ▼
                                                    [Check user_cards]
                                                     ├── Empty  ──► [Redirect /onboarding]
                                                     └── Exists ──► [Redirect /dashboard]
```

### Explicit 'Done' Criteria
- Signing in via Google OAuth auto-populates both Clerk and the local PostgreSQL `users` table.
- Accessing `/vault` while unauthenticated instantly redirects to `/auth/login`.
- Completing onboarding persists payment card preferences in `user_cards` and redirects to `/dashboard`.

---

## Phase 4: Core Feature Development (In Order of Dependency)

### Goal
Build the backend calculation logic, OCR vision parsing pipeline, store deal matrices, and social sharing features in sequence.

### Modules Breakdown

1. **Store & Public Coupon API Layer (Module 4.1 — Foundation)**:
   - Build backend query utilities to fetch store metadata by slug (`/deals/[slug]`) and autocomplete search (`/api/v1/stores/search?q=...`).

2. **The Multi-Tier Savings Stacker Engine (Module 4.2 — Core Engine)**:
   - Implement pure, deterministic calculation function `evaluateBankOffer` and `calculateStack(basePrice, storeSlug, userCards[])` executing the 5-layer stacking formula in under 150ms:
     $$\text{Net Price} = \text{Base} - \text{Coupon} - \text{Voucher} - \text{Card Offer} - \text{Affiliate Cashback}$$

3. **OCR Screenshot Vault Pipeline (Module 4.3 — Ingestion)**:
   - Implement S3 presigned upload URL endpoint → invoke Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`) → Regex cascade parse promo code, value, and expiry date with `ocr_confidence` → if `ocr_confidence < 0.85`, auto-render editable correction sheet UI (Flow B) → save to `coupons` table.

4. **Community Downvoting & Flagging System (Module 4.4 — Freshness)**:
   - Build 2-tap flag modal (`[Expired 👎]`) triggering `/api/v1/coupons/:id/flag` (gated on user account age > 24h). Add logic: if downvotes ≥ 3, auto-update status to `PENDING_REVIEW` and hide from stack calculations.

5. **Internal Redirect Gateway & Social Sharing (Module 4.5 — Growth)**:
   - Build `/r/[storeSlug]` HMAC-signed redirect route reading cached templates from Redis (24h TTL).
   - Build `/api/v1/deals/share` to generate open-graph social share cards ("Rohan saved ₹723 on Myntra!") and attach referral tracking links (`/s/[stackId]?ref=[code]`).

### Explicit 'Done' Criteria
- Inputting a Myntra product URL returns a calculated 5-tier stack in under 150ms.
- Uploading a GPay reward screenshot extracts promo code details with >85% accuracy and opens the editable correction UI.
- Flagging a coupon 3 times automatically updates its database status to `PENDING_REVIEW`.

---

## Phase 5: UI/UX Polish, Responsive Layouts & Design System

### Goal
Apply the visual identity established in Document 04 (Deep Oxblood/Velvet Crimson accents, Emerald Green savings CTAs, glassmorphism, mobile bottom bar, and skeleton loading states).

### Key Tasks
- Update `tailwind.config.ts` with custom token extensions:
  `brand-oxblood` (`#450A0A`), `brand-crimson` (`#991B1B`), `brand-emerald` (`#059669`), `brand-amber` (`#F59E0B`).
- Build primary shell layouts:
  - **Desktop**: Top header with centered global search bar (`Cmd/Ctrl + K` shortcut) and user profile dropdown.
  - **Mobile**: Fixed bottom navigation bar (Home, Stacker, Vault, Cards) + Floating Action Button (`+ FAB`) for screenshot uploads.
- Add skeleton loading components (`shadcn/ui` Skeleton) matching price card dimensions to eliminate Cumulative Layout Shift (CLS) during engine calculations.
- Add Framer Motion micro-animations for post-calculation "Savings Stacked!" banners and bottom sheet drawer transitions.
- Ensure all interactive controls meet minimum $44 \times 44\text{px}$ touch targets on mobile viewports.

### Explicit 'Done' Criteria
- Page passes Google Lighthouse Mobile Audit with ≥ 90 Accessibility score.
- Toggling between dark and light modes transitions smoothly with zero unstyled content flash (FOUC).

---

## Phase 6: Testing, Error Handling, Edge Cases & Rate Limiting

### Goal
Harden the platform against invalid user inputs, API timeouts, bot scraping, and unreadable OCR uploads.

### Key Tasks
- Implement Upstash Redis Rate Limiting on key API routes:
  - **Stacker Calculations**: 30 requests / min / IP
  - **OCR Uploads**: 5 uploads / min / User
  - **Auth / Signups**: 3 requests / hour / IP
- Integrate Sentry for runtime crash monitoring and PostHog for user conversion funnel tracking.
- Implement robust error fallbacks:
  - **OCR Low Confidence (< 0.60)**: Display inline alert: *"We couldn't clearly read this code. Please enter the details manually below."* (Opens manual entry drawer pre-filled with raw text).
  - **API Network Failure**: Fall back to cached store deals stored in Redis with badge: *"Showing cached rates."*
- Write automated unit tests using Vitest for the Stacker Engine calculation logic (verifying minimum cart limits, percentage caps, and card combinatorics).

### Explicit 'Done' Criteria
- All Vitest unit tests for mathematical stacking calculations pass with 100% assertion accuracy.
- Exceeding 5 OCR uploads in a minute returns HTTP 429 (Too Many Requests).
- Unhandled client/server errors generate real-time alerts in Sentry dashboard.

---

## Phase 7: Production Deployment, Infrastructure & Compliance

### Goal
Deploy the application to Vercel production infrastructure, configure database connection pooling, schedule cron jobs, and verify ASCI legal compliance.

### Key Tasks
- Connect GitHub repository main branch to Vercel Production.
- Configure serverless database connection pooling strings and SSL modes in Vercel environment settings.
- Configure AWS S3 Lifecycle Rule on `moneysaver-temp-ocr` bucket to automatically purge raw screenshot uploads after 15 minutes.
- Set up Vercel Cron (`/api/v1/cron/revalidate-coupons`) running daily at 00:00 UTC to re-verify public affiliate API feeds and deprecate expired codes.
- Verify mandatory ASCI Affiliate Disclosure Toast (1.2s interstitial) renders on all outbound merchant CTA buttons (*"Redirecting to merchant via affiliate partner... We may earn a commission"*).
- Outbound shop links successfully route through internal `/r/[storeSlug]` gateway before redirecting to merchant sites with proper affiliate tracking parameters. HTTPS with custom domain configuration.
- Vercel Cron executes successfully without timing out.
- S3 lifecycle policy verified by checking that temporary upload folders purge within 15 minutes.
- Outbound shop links successfully redirect to merchant sites while attaching proper affiliate tracking parameters.
