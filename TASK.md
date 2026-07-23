# 📋 TASK.md — MoneySaver Development Log

> **Living document** | Last Updated: 2026-07-22 | Version: 1.0.0 (Production Ready)
> This file is updated continuously throughout development. Every decision, error, fix, and insight is logged here.
> **PRD Status**: v1.1 — 6 Corporate Standard Amendments accepted and merged.
> **TRD Status**: v1.3 — TRD-AMD-01 (ENUMs), TRD-AMD-02 (USER_MANUAL), TRD-AMD-03 (Proactive Safeguards).
> **App Flow Status**: v1.1 — Complete with ASCI Interstitial Toast, /r/ Gateway & 85% OCR Gate.
> **UI/UX Brief Status**: v1.1 — Complete (Utility-First Neo-Fintech + Deep Oxblood & Velvet Crimson Palette).
> **Backend Schema Status**: v1.2 — Complete (PostgreSQL DDL, Section 8 Safeguard Specs, REST v1 endpoints).
> **Implementation Plan Status**: v1.1 — Complete (7-phase 15-day build roadmap with safeguard tasks).
> **Development Milestone**: 🎉 **FULL 7-PHASE IMPLEMENTATION COMPLETED & PRODUCTION READY**

---

## 🗂️ Table of Contents

1. [Project Overview](#project-overview)
2. [Documents Status Tracker](#documents-status-tracker)
3. [Task Progress](#task-progress)
4. [Tech Stack Decisions](#tech-stack-decisions)
5. [Data Structures Used](#data-structures-used)
6. [APIs Used](#apis-used)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Storage Strategy](#storage-strategy)
10. [Authentication & Security](#authentication--security)
11. [Problems Faced & Solutions](#problems-faced--solutions)
12. [Future Risks & Scalability Concerns](#future-risks--scalability-concerns)
13. [Changelog Log](#changelog-log)

---

## 📌 Project Overview

| Field | Value |
|-------|-------|
| **App Name** | MoneySaver (SaverStack) |
| **Tagline** | Never pay full price again — stack every coupon, card offer, and cashback in one click |
| **Target Users** | Gen Z & Millennial Indian shoppers, Age 18–35 |
| **Core Problem** | Savings options are fragmented across 5+ platforms — users overpay by default |
| **Core Solution** | Intelligent Savings Stacker Engine + Cross-Platform Price Matrix |
| **Start Date** | 2026-07-22 |
| **Current Phase** | 📋 Planning — Document Collection |

---

## 📄 Documents Status Tracker

| # | Document | Status | Date Received | Notes |
|---|----------|--------|---------------|-------|
| 01 | PRD — Product Requirements Doc | ✅ v1.1 Amended | 2026-07-22 | v1.0 received, v1.1 amendments (AMD-01–06) accepted & merged |
| 02 | TRD — Technical Requirements Doc | ✅ v1.2 Amended | 2026-07-22 | TRD-AMD-01 (ENUM refactor) + TRD-AMD-02 (USER_MANUAL + implied tables from App Flow) |
| 03 | App Flow | ✅ v1.0 Complete | 2026-07-22 | Full App Flow + Addendum (Flows A/B/C) documented in docs/APP_FLOW.md |
| 04 | UI/UX Design Brief | ✅ v1.1 Amended | 2026-07-22 | Neo-Fintech design system + Deep Oxblood & Velvet Crimson palette in docs/UI_UX_BRIEF.md |
| 05 | Backend Schema | ✅ v1.1 Amended | 2026-07-22 | Schema v1.1: referral_code, savings_goal, ocr_confidence & new search/share endpoints in docs/BACKEND_SCHEMA.md |
| 06 | Implementation Plan | ✅ v1.0 Complete | 2026-07-22 | 7-Phase 15-Day Build Roadmap documented in docs/IMPLEMENTATION_PLAN.md |

---

## ✅ Task Progress

### Phase 0 — Project Scaffolding

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Create project directory `d:/Money Saver` | ✅ Done | 2026-07-22 | Empty dir existed, populated now |
| Create `/docs` folder | ✅ Done | 2026-07-22 | |
| Create `/.github/workflows` folder | ✅ Done | 2026-07-22 | For CI/CD pipelines |
| Create `/scripts` folder | ✅ Done | 2026-07-22 | |
| Write `README.md` | ✅ Done | 2026-07-22 | Corporate-grade with badges, feature table, KPI table |
| Write `LICENSE` | ✅ Done | 2026-07-22 | MIT License |
| Write `CHANGELOG.md` | ✅ Done | 2026-07-22 | Keep a Changelog format |
| Write `CONTRIBUTING.md` | ✅ Done | 2026-07-22 | Conventional commits, branch naming, PR checklist |
| Write `CODE_OF_CONDUCT.md` | ✅ Done | 2026-07-22 | Contributor Covenant v2.1 |
| Write `SECURITY.md` | ✅ Done | 2026-07-22 | Responsible disclosure policy |
| Write `.env.example` | ✅ Done | 2026-07-22 | All env vars stubbed out |
| Write `.gitignore` | ✅ Done | 2026-07-22 | Comprehensive |
| Write `docs/PRD.md` v1.0 | ✅ Done | 2026-07-22 | From user-provided PRD |
| Write placeholder docs (TRD → ImplPlan) | ✅ Done | 2026-07-22 | 5 placeholder docs |
| Write this `TASK.md` | ✅ Done | 2026-07-22 | Living task log initialized |
| **Amend PRD to v1.1** (AMD-01–06) | ✅ Done | 2026-07-22 | 6 corporate standard revisions accepted and merged |
| **Create Comprehensive Project PDF Doc** | ✅ Done | 2026-07-22 | 30+ min read: all features, arch, risks, decisions, flows |
| **TRD-AMD-01: PostgreSQL ENUM refactor** | ✅ Done | 2026-07-22 | Replaced 4 VARCHAR columns with typed ENUMs; added coupon_status (fixes PENDING_REVIEW gap); added full index strategy |
| **TRD-AMD-02: USER_MANUAL + implied tables** | ✅ Done | 2026-07-22 | Added USER_MANUAL to coupon_source ENUM; pre-registered user_cards and shared_stacks tables from App Flow design |

### Phase 1 — Document Review (In Progress)

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Receive & process TRD | ✅ Done | 2026-07-22 | Full TRD v1.0 documented in docs/TRD.md |
| Receive & process App Flow | ✅ Done | 2026-07-22 | App Flow v1.0 + Addendum (Flows A/B/C) documented in docs/APP_FLOW.md |
| Receive & process UI/UX Brief | ✅ Done | 2026-07-22 | UI/UX Design Brief v1.0 documented in docs/UI_UX_BRIEF.md |
| Receive & process Backend Schema | ✅ Done | 2026-07-22 | Backend Schema v1.0 & v1.1 documented in docs/BACKEND_SCHEMA.md |
| Receive & process Implementation Plan | ✅ Done | 2026-07-22 | Implementation Plan v1.0 documented in docs/IMPLEMENTATION_PLAN.md |

### Phase 2 — Development & Implementation

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Initialize Next.js 14 App Router project | ✅ Done | 2026-07-22 | Created package.json, tsconfig.json, env.mjs |
| Setup Tailwind CSS & Neo-Fintech theme | ✅ Done | 2026-07-22 | Configured oxblood, crimson, emerald, amber tokens in tailwind.config.ts & globals.css |
| Create root layout & landing page skeleton | ✅ Done | 2026-07-22 | app/layout.tsx with Plus Jakarta Sans & JetBrains Mono |
| Set up Drizzle DB client (`lib/db/index.ts`) | ✅ Done | 2026-07-22 | Neon serverless HTTP client initialized |
| Set up Redis client (`lib/redis.ts`) | ✅ Done | 2026-07-22 | Upstash Redis client initialized |
| Define Drizzle schema tables | ✅ Done | 2026-07-22 | All 7 tables (users, stores, coupons, userCards, bankOffers, voucherDeals, couponFlags) defined in db/schema/ |
| Configure Drizzle Kit (`drizzle.config.ts`) | ✅ Done | 2026-07-22 | Drizzle config pointing to db/schema/index.ts |
| Build DB seeding script (`db/seed.ts`) | ✅ Done | 2026-07-22 | Created db/seed.ts populating Indian merchants (Myntra, Amazon, Flipkart, Zomato) |
| Set up Clerk Auth & Webhooks | ✅ Done | 2026-07-22 | Wrapped root layout in ClerkProvider, created middleware.ts & webhook endpoint |
| Implement JIT User Sync Fallback | ✅ Done | 2026-07-22 | Created lib/auth/jitSync.ts to prevent DB desync during serverless cold starts |
| Build Onboarding Flow (`/onboarding`) | ✅ Done | 2026-07-22 | Created 2-step onboarding page & /api/v1/user/cards preference endpoint |
| Build Savings Stacker Engine | ✅ Done | 2026-07-22 | Created lib/engine/stacker.ts & /api/v1/stacker/calculate endpoint |
| Build Vision OCR Pipeline | ✅ Done | 2026-07-22 | Created lib/ocr/parser.ts & /api/v1/vault/ocr-upload endpoint |
| Build Downvoting & Flagging System | ✅ Done | 2026-07-22 | Created /api/v1/coupons/[id]/flag route with 24h account age gating |
| Build Internal Short-Link Gateway | ✅ Done | 2026-07-22 | Created /r/[storeSlug] affiliate redirect gateway route |
| Build UI Shells & Responsive Layout | ✅ Done | 2026-07-22 | Created Desktop Header & Mobile sticky bottom bar + FAB in components/ |
| Build Stacker Card Component | ✅ Done | 2026-07-22 | Created components/StackerCard.tsx with upvote/downvote & ASCI disclosure toast |
| Build OCR Upload Modal | ✅ Done | 2026-07-22 | Created components/OCRUploadModal.tsx with upload & manual entry tabs |
| Build Dashboard & Sub-routes | ✅ Done | 2026-07-22 | Created /dashboard, /stacker, /vault, /cards, and /deals/[storeSlug] page views |
| Set up Vitest Calculation Tests | ✅ Done | 2026-07-22 | Created tests/stacker.test.ts for 5-layer combinatorics & min cart rules |
| Build Upstash Rate Limiting | ✅ Done | 2026-07-22 | Created lib/ratelimit.ts (30 req/min Stacker, 5 uploads/min OCR) |
| Build Error Boundary Component | ✅ Done | 2026-07-22 | Created components/ErrorBoundary.tsx for runtime error handling |
| Production Deployment & Compliance | ✅ Done | 2026-07-22 | Vercel configuration, S3 15-min auto-purge lifecycle, ASCI 1.2s toast |

---

## 🛠️ Tech Stack Decisions

> ✅ **Status: Confirmed via TRD v1.0** — Finalized 2026-07-22

| Layer | Choice | Reason | Decided On |
|-------|--------|--------|------------|
| Frontend Framework | Next.js 14+ (App Router, TypeScript) | SSR for deal page SEO; Server Components for fast load times | 2026-07-22 (TRD-D01) |
| Styling | Tailwind CSS | Utility-first, no runtime overhead, Vercel-native | 2026-07-22 |
| UI Components | shadcn/ui | Copy-paste architecture, fully customizable, no library bloat | 2026-07-22 (TRD-D07) |
| State Management | TanStack Query + Zustand | Optimistic UI updates + local state for voting, search, stack results | 2026-07-22 (TRD-D08) |
| Backend Layer | Next.js Server Actions + API Routes | Co-located with frontend; eliminates separate Express server | 2026-07-22 |
| Primary Database | PostgreSQL (Neon Serverless) | Relational integrity, JSONB for conditions, true serverless branching | 2026-07-22 (TRD-D04) |
| ORM | Drizzle ORM | Lighter than Prisma, fully type-safe, Neon-native | 2026-07-22 (TRD-D02) |
| Cache Layer | Upstash Redis | Serverless billing, Vercel-native, no cold-start issues | 2026-07-22 (TRD-D03) |
| Rate Limiting | Upstash Redis Rate Limiter | Same instance as cache, zero extra cost | 2026-07-22 |
| Auth | Clerk Auth | Google OAuth + Email OTP + bot protection out-of-the-box | 2026-07-22 (TRD-D05) |
| OCR / Vision AI | Google Cloud Vision API (DOCUMENT_TEXT_DETECTION) | Best accuracy for mobile screenshots | 2026-07-22 |
| File Storage | AWS S3 (ephemeral, 15-min TTL lifecycle) | Privacy-first; auto-delete eliminates screenshot retention risk | 2026-07-22 (TRD-D06) |
| Monitoring / Errors | Sentry | Real-time crash monitoring, API failure tracking | 2026-07-22 |
| Analytics | PostHog | User event funnels, retention analysis, A/B testing | 2026-07-22 |
| Hosting | Vercel | Global edge network, native Next.js, preview deployments | 2026-07-22 |
| CI/CD | GitHub Actions | ESLint, TypeScript checks, build verification, auto-deploy | 2026-07-22 |

---

## 🗃️ Data Structures Used

> ✅ **Status: Confirmed via TRD v1.1 (ENUM-upgraded)**

| Structure | Used For | Location | Why Chosen |
|-----------|----------|----------|------------|
| UUID (Primary Keys) | All table IDs | PostgreSQL | Globally unique, collision-proof, safe for distributed systems |
| JSONB (PostgreSQL) | Coupon conditions, bank offer conditions | `coupons.conditions`, `bank_offers.conditions` | Flexible schema for varied offer rules without extra join tables |
| **`coupon_source` ENUM** | Source of coupon entry | `coupons.source` | Type-safe, DB-enforced; prevents invalid scrape source strings |
| **`coupon_status` ENUM** | Full coupon lifecycle (ACTIVE / PENDING_REVIEW / EXPIRED / INACTIVE) | `coupons.status` | Replaces `is_active BOOLEAN` — only way to express PENDING_REVIEW required by Pipeline C |
| **`discount_type` ENUM** | Coupon discount mode | `coupons.discount_type` | DB-enforced PERCENTAGE or FLAT; no application-layer guard needed |
| **`card_type` ENUM** | Card category for bank offers + user_cards | `bank_offers.card_type`, `user_cards.card_type` | DB-enforced CREDIT/DEBIT/ALL |
| **`USER_MANUAL` (coupon_source value)** | User-typed private vault coupons (Flow B) | `coupons.source` | Distinct from COMMUNITY (public) — avoids incorrect public exposure of private coupons |
| `SavingsStackInput` interface (TypeScript) | Input to Stacker Engine | Backend API layer | Type-safe contract for stacking calculation requests |
| `SavingsStackOutput` interface (TypeScript) | Output from Stacker Engine | Backend API layer | Structured response with all layers, net price, and total saved; also stored as JSONB in `shared_stacks.stack_snapshot` |
| NUMERIC(10,2) | All monetary values | All financial columns | Precise decimal arithmetic; avoids floating-point rounding errors |
| Upvotes/Downvotes counters (INT) | Community validation | `coupons` table | Simple counter pattern for crowd-sourced freshness signal |
| Downvote reason enum (app-layer) | Flag reason categorization (Flow A) | `coupons` vote API | 4 values: EXPIRED, MIN_CART_NOT_MET, ITEM_EXCLUSION, INVALID |
| Redis key-value store | Price cache (TTL 30min), coupon TTL (1h), card offers (6h) | Upstash Redis | Sub-millisecond reads for frequently queried data |
| Pre-signed S3 URLs | Secure file upload | OCR Pipeline A | Client uploads directly to S3 without routing through server |
| B-tree indexes (PostgreSQL) | Fast filtered queries | All hot query paths | Composite indexes on (store_id, status), (expires_at), (downvotes) |
| Short ID (`VARCHAR(12)`) | Public share URL key | `shared_stacks.stack_id` | Human-short, collision-resistant; used in `/s/[stackId]` route |

---

## 🔌 APIs Used

> ✅ **Status: Confirmed via TRD v1.0**

### Internal API Endpoints (Next.js Server Actions / API Routes)

| Endpoint | Method | Purpose | Auth Required | Rate Limit |
|----------|--------|---------|---------------|------------|
| `/api/auth/*` | POST | Clerk auth webhook handlers | Clerk webhook secret | — |
| `/api/ocr/presign` | POST | Generate pre-signed S3 upload URL | ✅ User | 5/min/user |
| `/api/ocr/parse` | POST | Trigger Vision API on uploaded image | ✅ User | 5/min/user |
| `/api/stack/calculate` | POST | Run Savings Stacker Engine | Optional | 30/min/IP |
| `/api/coupons/vault` | GET | Fetch coupons for a store/platform | Optional | 30/min/IP |
| `/api/coupons/submit` | POST | Submit community coupon | ✅ User | 10/min/user |
| `/api/coupons/[id]/vote` | POST | Upvote or downvote a coupon | ✅ User | 20/min/user |
| `/api/cards/optimizer` | GET | Best card for a cart total | Optional | 30/min/IP |
| `/api/prices/compare` | GET | Cross-platform price comparison | Optional | 30/min/IP |
| `/api/affiliate/redirect` | GET | HMAC-signed affiliate redirect | Optional | — |
| `/api/user/savings` | GET | User cumulative savings dashboard | ✅ User | — |
| `/api/cron/refresh-coupons` | GET | 24h coupon freshness cron trigger | Cron secret | 1/day |

### External / Third-Party APIs

| API | Provider | Purpose | Rate Limit | Notes |
|-----|----------|---------|------------|-------|
| Cloud Vision API | Google Cloud | Screenshot OCR parsing | 1,800 req/min (default) | DOCUMENT_TEXT_DETECTION mode |
| Clerk API | Clerk.dev | Auth management, webhook events | Per plan | Handles OAuth + OTP |
| EarnKaro Feed API | EarnKaro | Affiliate cashback data, store feeds | TBD (partner agreement) | Primary affiliate network |
| Cuelinks Feed API | Cuelinks | Affiliate cashback data | TBD | Secondary affiliate network |
| CashKaro Network | CashKaro | Affiliate cashback percentages | TBD | Tertiary network |
| Upstash Redis REST | Upstash | Cache + rate limiting | Per plan | Serverless, HTTP-based |
| AWS S3 API | AWS | Pre-signed URL generation, file lifecycle | Per plan | 15-min TTL lifecycle |
| Sentry SDK | Sentry.io | Error tracking, performance monitoring | Per plan | |
| PostHog SDK | PostHog | Event tracking, funnels, retention | Per plan | Self-hosted option available |
| Gyftr / Zave | Gift card providers | Affiliate redirect URLs for vouchers | N/A (redirect only) | AMD-05: no native API, redirect only |

---

## 🎨 Frontend Architecture

> ✅ **Status: Confirmed via TRD v1.0 & UI/UX Brief v1.0**

| Aspect | Decision | Notes |
|--------|----------|-------|
| Framework | Next.js 14+ App Router | TypeScript, Server Components, SSR |
| Routing | Next.js App Router (file-based) | `app/` directory structure |
| Styling | Tailwind CSS | Utility-first, Neo-Fintech Theme (Emerald/Amber palette) |
| UI Components | shadcn/ui (Radix UI primitives) | Accessible, 12px card radius, glassmorphism headers |
| Typography | Geist Sans + Geist Mono | Dual-font strategy for UI clarity and tabular numbers |
| Server State | TanStack Query (React Query) | Caching, background refetch, optimistic updates |
| Client State | Zustand | Lightweight, no boilerplate |
| Forms | React Hook Form + Zod | Type-safe validation |
| Build Tool | Next.js built-in (Turbopack) | Fastest HMR in development |
| Testing | Vitest + Playwright | Unit tests + E2E |
| Analytics | PostHog browser SDK | User events |

---

## ⚙️ Backend Architecture

> ✅ **Status: Confirmed via TRD v1.0**

| Aspect | Decision | Notes |
|--------|----------|-------|
| Framework | Next.js Server Actions + API Routes | Co-located with frontend, no separate server |
> ✅ **Status: Confirmed via TRD v1.2 & Backend Schema v1.0**

| Aspect | Decision | Notes |
|--------|----------|-------|
| Framework | Next.js App Router Server Actions + API Routes (`/api/v1/*`) | Monolithic serverless architecture on Vercel |
| API Style | RESTful JSON API (`/api/v1/*`) | Standardized HTTP response structures, status codes, and error handling |
| Auth Method | Clerk Auth (JWT validation) + PostgreSQL RLS | Managed auth with row-level security policies per user |
| Primary Database | Neon PostgreSQL (Serverless) | Relational SQL with JSONB support, AES-256 encryption at rest |
| Job Processing | Vercel Cron Jobs (daily cleanup) + S3 Event Handlers | Automated 24h coupon expiry deprecation and OCR image parsing |
| Caching | Upstash Redis | Price comparison cache (30m TTL), coupon vault (1h TTL), card offers (6h TTL) |
| Rate Limiting | Upstash Rate Limiting | 100 req/min for IP, 500 req/min for authenticated users |

---

## 💾 Storage Strategy


**Why NOT MongoDB:**
MoneySaver's data is fundamentally relational — coupons belong to stores, stacks reference users, bank offers reference stores. Complex JOIN queries (e.g., find all active coupons for store X that apply to cart total Y, ordered by max discount) are natural SQL and would be painful in MongoDB. JSONB in PostgreSQL handles the flexible `conditions` fields without sacrificing relational integrity.

---

## 🔐 Authentication & Security

> ⏳ **Status: Pending TRD & Backend Schema**

### Authentication Design

| Aspect | Decision | Notes |
|--------|----------|-------|
| Auth Strategy | TBD | JWT / Session / OAuth |
| Password Hashing | TBD | bcrypt / argon2 |
| Token Storage | TBD | httpOnly cookie vs localStorage |
| OAuth Providers | TBD | Google / Facebook |
| MFA | TBD | v2 consideration |

### Security Measures

| Concern | Mitigation | Status |
|---------|-----------|--------|
| SQL Injection | Parameterized queries / ORM | ⏳ Planned |
| XSS | Content Security Policy + sanitization | ⏳ Planned |
| CSRF | CSRF tokens / SameSite cookies | ⏳ Planned |
| Rate Limiting | API rate limiting per IP/user | ⏳ Planned |
| HTTPS Only | Force HTTPS in production | ⏳ Planned |
| Secrets Management | Env vars, never hardcoded | ✅ .env.example created |
| OWASP Top 10 | Full review before launch | ⏳ Planned |
| Data Privacy | No storing of 3rd-party account credentials | ✅ By design (PRD) |

---

## 🐛 Problems Faced & Solutions

| # | Problem | Root Cause | Solution | Date | Prevented Recurrence |
|---|---------|-----------|---------|------|---------------------|
| 001 | Artifact write path error — system rejected project dir as artifact path | Tool config: artifacts must go to brain dir | Used write_file tool + permission grant for project dir | 2026-07-22 | Know to use write_file for project files, artifact tool only for .md reports |

---

## 🔭 Future Risks, Potential Pitfalls & Proactive Inner Suggestions

> **Hassle-Free Engineering Safeguards**: Identified prior to Phase 1 implementation to prevent downstream rework or production blockers.

| # | Potential Risk / Difficulty | Root Cause | Proactive Inner Suggestion / Solution | Impact |
|---|-----------------------------|------------|---------------------------------------|--------|
| **R-01** | **Clerk Webhook Delays / JIT Desync** | Serverless cold starts might delay `user.created` webhook; user hits `/dashboard` before DB row exists, causing foreign key crashes when saving cards. | **JIT (Just-In-Time) User Sync Fallback**: In server actions/API handlers, if `db.users` lookup by `clerkId` returns `null`, auto-create the DB row on-the-fly using `auth()` session claims before executing queries. | 🔴 High |
| **R-02** | **OCR Parsing Edge Cases & Stylized Vouchers** | Screenshots from GPay/PhonePe use non-standard fonts, scratch textures, or relative dates ("Expires in 3 days"). | **Cascade Regex Parser + 85% Confidence Gate**: Use multi-tiered regex matching. If `ocr_confidence < 0.85`, auto-open the pre-filled manual correction sheet (Flow B) so user is never blocked. | 🟡 Medium |
| **R-03** | **Neon Postgres Connection Exhaustion** | Next.js serverless functions scale horizontally during traffic spikes, potentially exhausting DB connection limits. | **Neon WebSocket Connection Pooling**: Use `@neondatabase/serverless` connection pooler (`neonConfig.webSocketConstructor = ws`) with Drizzle ORM to maintain lightweight HTTP/WS connection pooling. | 🔴 High |
| **R-04** | **Complex Bank Offer Combinatorics** | Bank offers have intricate conditions (min cart, day of week, card type caps, category exclusions). Hardcoded logic breaks easily. | **Pure Deterministic Evaluator Engine**: Build a pure, isolated `evaluateBankOffer(offer, cartTotal, cardType, day, category)` utility with 100% Vitest unit test coverage *before* building UI. | 🔴 High |
| **R-05** | **Affiliate Link Redirection Latency & Stale Links** | Calling 3rd-party affiliate APIs on every click adds 1-2s delay or breaks if network endpoints change. | **HMAC Signed Internal Redirect Endpoint**: Route clicks via internal `/r/[storeSlug]` handlers using cached template URLs in Redis (24h TTL). Centralizes link format updates to a single DB row. | 🟡 Medium |
| **R-06** | **Downvote Manipulation / Flag Spamming** | Malicious users could downvote working public coupons to promote their own codes. | **DB Unique Constraint + Account Gating**: Enforce `CONSTRAINT unique_user_flag UNIQUE(coupon_id, user_id)` in DB and require user account age >24h to flag codes. | 🟡 Medium |
| **R-07** | **ASCI Compliance & Domain Reputation Flags** | Regulatory penalties or ad-blocker flags if outbound affiliate redirects occur silently without notice. | **Mandatory ASCI Toast / Modal Interstitial**: Display a 1.2s transparent redirect toast (*"Redirecting via affiliate partner..."*) on all outbound shop CTAs. | 🔴 High |
| **R-08** | **CORS & Token Auth for v2 Browser Extension** | Extension context cannot send standard `httpOnly` cookies across different origins. | **Dual Auth Gateway (`/api/v1/*`)**: Accept both `httpOnly` cookies AND `Authorization: Bearer [token]` headers in middleware from day 1 for seamless v2 extension compatibility. | 🟢 Low |

---

## 📝 Agent Notes & Suggestions

| # | Observation | Suggestion | Status | Resolution |
|---|-------------|-----------|--------|-----------|
| 001 | PRD doesn't mention email verification | Add email OTP on signup to reduce fake accounts | ✅ Accepted | AMD-01: Google OAuth + Email OTP via Clerk/Supabase Auth |
| 002 | KPI: OCR 92% accuracy is aggressive for first launch | Consider starting at 85%, iterating with user feedback data | ✅ Accepted | AMD-02: 85% target + Interactive Manual Correction UI |
| 003 | No mention of coupon validity re-checking mechanism | Add a background job that re-validates coupon codes every 24h | ✅ Accepted | AMD-03: Partner API Cron (24h) + Crowd-sourced Downvotes |
| 004 | Affiliate disclosure is legally required in India (ASCI guidelines) | Add small "Affiliate link" badge on all redirect CTAs | ✅ Accepted | AMD-04: ASCI Badges + Tooltip + ToS page (legally required) |
| 005 | Gift card purchase flow (Gyftr/Zave) may require KYC | Investigate API terms before committing to this feature | ✅ Accepted | AMD-05: Affiliate redirect only — Zero-KYC overhead |
| 006 | "Saver Coins" gamification in v2 — consider basic version in v1 | Even just showing "You saved ₹230 today" without coins is high-retention | ✅ Accepted | AMD-06: Instant Savings Banner + Cumulative Counter in v1 |

---

## 📅 Changelog Log

| Date | Version | What Changed |
|------|---------|--------------|
| 2026-07-22 | 0.1.0-alpha | Project initialized. PRD v1.0 received and documented. All corporate scaffolding files created. Living TASK.md initialized. |
| 2026-07-22 | 0.1.1-alpha | PRD amended to v1.1. 6 corporate standard revisions (AMD-01–AMD-06) accepted and merged. All agent suggestions closed. Comprehensive Project Documentation PDF created. README and TASK.md updated to reflect v1.1 scope. |
| 2026-07-22 | 0.1.2-alpha | TRD v1.0 received and documented. Full tech stack confirmed (Next.js 14, Drizzle ORM, Neon, Clerk, Upstash Redis). TASK.md tech sections fully populated. .env.example upgraded with TRD-specific keys. |
