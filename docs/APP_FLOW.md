# 📱 App Flow & Navigation Brief

**App Name**: MoneySaver (SaverStack)  
**Document**: 03 — App Flow & Navigation  
**Version**: 1.1 (Updated with ASCI Interstitial Toast, /r/ Gateway & Proactive Safeguards)  
**Date**: 2026-07-22  
**Status**: ✅ Complete (includes Addendum — Integrated Modals & Flow Enhancements)  
**Prepared By**: Product Owner + AI Engineering Lead  

> This document defines every screen, every click, every navigation path, every modal, and every system state behavior in MoneySaver v1.0.

---

## Table of Contents
1. [Complete Screen Directory & Route Map](#1-complete-screen-directory--route-map)
2. [Global Navigation Architecture](#2-global-navigation-architecture)
3. [Entry Points & Auth Flow Sequence](#3-entry-points--auth-flow-sequence)
4. [Key User Journeys](#4-key-user-journeys)
5. [Modals, Drawers & Overlay Interactions](#5-modals-drawers--overlay-interactions)
6. [Edge Cases & System State Behaviors](#6-edge-cases--system-state-behaviors)
7. [Global Action & Redirect Matrix](#7-global-action--redirect-matrix)
8. [Engineering Notes & Schema Implications](#8-engineering-notes--schema-implications)

---

## 1. Complete Screen Directory & Route Map

### 1.1 Route Tree

```
/ (Landing Page - Public)
├── /auth/login                     (Auth Modal / Screen)
├── /auth/signup                    (Auth Modal / Screen)
├── /onboarding                     (2-Step Preference Setup)
├── /s/[stackId]                    (Shared Stack Preview - Public)
├── /r/[storeSlug]                  (Internal Affiliate Redirect Gateway - Public)
└── /dashboard                      (App Shell - Auth Required)
    ├── /stacker                    (Price & Deal Calculation Engine)
    ├── /vault                      (Personal Coupon Management)
    ├── /cards                      (Payment Method Preferences)
    ├── /deals/[storeSlug]          (Store-Specific Deal Matrix)
    └── /profile                    (Account & Savings Analytics)
```

### 1.2 Route Reference Table

| Route | Page Name | Access Level | Core Purpose |
|-------|-----------|--------------|---------------|
| `/` | Landing Page | Public | Product value prop, live interactive stack calculator preview, "How it Works" demo, CTA to sign up. |
| `/auth/login` | Login / Signup | Public | Google OAuth 1-tap sign-in or Email OTP verification via Clerk. |
| `/onboarding` | User Onboarding | Authenticated (First Time Only) | Quick 2-step setup: Select owned bank cards/UPI apps and upload first reward screenshot (optional). |
| `/dashboard` | Home Dashboard | Authenticated | Primary hub: Global search bar, "Savings Today" counter, trending store deals, quick access to Vault. |
| `/stacker` | Savings Stacker | Authenticated / Guest (Limited) | Input product URL or cart value → outputs side-by-side Net Payable Price breakdown across stores. |
| `/vault` | Coupon Vault | Authenticated | View, edit, filter, and upload personal scratch cards/reward coupons parsed via OCR or entered manually. |
| `/cards` | My Payment Methods | Authenticated | Toggle owned credit cards (e.g., HDFC Millennia, SBI Cashback) and UPI apps to filter valid bank offers. |
| `/deals/[storeSlug]` | Store Deal Matrix | Authenticated / Public | Dedicated page for a merchant (e.g., `/deals/myntra`) showing all active coupons, card offers, and cashback links. |
| `/profile` | Profile & Lifetime Savings | Authenticated | Cumulative savings breakdown, referral link, account security settings. |
| `/s/[stackId]` | Shared Stack Preview | Public | Social share landing page for a user-generated savings stack (e.g., "Rohan saved ₹723 on Myntra!"). |

---

## 2. Global Navigation Architecture

> The navigation structure adapts dynamically based on device viewport to maximize usability on mobile devices, where the majority of deal discovery and coupon management happens.

### 2.1 Mobile Navigation — Sticky Bottom Bar

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP SHELL                         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │                    Page Content                    │     │
│  │                  (scrollable area)                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [ 🏠 Home ]  [ ⚡ Stacker ]  [ ➕ ]  [ 🎟️ Vault ]  [ 💳 Cards ]  │
│  │                         ↑ FAB                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Navigation Rules:**
- Fixed bottom navigation bar with **4 primary tab destinations**
- **Floating Action Button (FAB)** — prominently centered, triggers Screenshot OCR Upload (Bottom Sheet with tabs: "📷 Upload Screenshot" | "✍️ Enter Manually")
- Active tab highlighted with emerald accent color
- Haptic feedback on tab switch (native mobile web)

### 2.2 Desktop Navigation — Top Header Shell

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [ 💰 MoneySaver ]  [ 🔍 Search Stores or paste product URL... Cmd+K ]  [ Stacker ] [ Vault ] [ Cards ]  [ 👤 Avatar ▼ ]  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Desktop Navigation Rules:**
- Top persistent navigation bar, fixed on scroll
- **Centered global search bar** (keyboard shortcut: `Cmd/Ctrl + K`) for store name lookup and product URL paste
- Profile avatar dropdown: links to `/profile`, "My Savings", "Logout"
- Active route underlined with emerald accent

### 2.3 Global Navigation Rules

| Rule | Behavior |
|------|----------|
| **Contextual Back Buttons** | Sub-routes (e.g., `/deals/myntra`, `/profile/settings`) render a top-left `←` back arrow pointing strictly to the previous logical parent route, never breaking browser history |
| **Auth Guard** | Protected routes redirect unauthenticated users to `/auth/login?redirect=[originalPath]` — after sign-in, user is returned to their intended destination |
| **First-Time Redirect** | New users after sign-up are redirected to `/onboarding` before `/dashboard` |
| **Returning User Bypass** | Authenticated returning users bypass `/` and land directly on `/dashboard` |
| **Deep Link Support** | `/deals/[storeSlug]?price=[value]` and `/s/[stackId]` are fully public and render stacker data without auth |

---

## 3. Entry Points & Auth Flow Sequence

### 3.1 Entry Points

| Visitor Type | Entry Point | Initial Experience |
|-------------|-------------|--------------------|
| **Unauthenticated Direct** | `/` (Landing Page) | Can try demo Stacker widget; clicking "Save Coupon" or "Apply Stack" triggers Auth modal |
| **Authenticated Returning User** | Auto-redirected → `/dashboard` | Personalized savings counter + trending deals |
| **Deep-Linked Visitor (Shared Deal)** | `/deals/myntra?price=2499` | Full stacker calculation visible immediately; affiliate links trigger seamless auth-prompt overlay if required for tracking |
| **Shared Stack Preview Visitor** | `/s/[stackId]?ref=[userId]` | Renders the social savings card; CTA: "Find your own best stack → Sign Up" |

### 3.2 Auth & Onboarding Pipeline

```
[Visitor clicks "Get Started" / "Sign In"]
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: 1-Click Authentication (~5 sec)         │
│                                                             │
│  [ Continue with Google ] — Google OAuth 1-tap              │
│             OR                                              │
│  [ Enter Email ] → 6-digit OTP → [ Verify ]                 │
│                 (via Clerk Auth)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴───────────┐
              │ NEW USER?              │ RETURNING USER?
              ▼                       ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│  → /onboarding          │   │  → /dashboard            │
│  (Proceed to Step 2)    │   │  (Skip onboarding)       │
└─────────────┬───────────┘   └──────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│    STEP 2: Payment Method Selection (~15 sec)               │
│                                                             │
│  "Which credit cards or payment apps do you use?"           │
│                                                             │
│  [ HDFC ] [ ICICI ] [ SBI Cashback ] [ Axis ] [ Kotak ]     │
│  [ GPay UPI ] [ PhonePe ] [ Amazon Pay ] [ Paytm ]          │
│                                                             │
│  Selections → saved to `user_cards` table                   │
└──────────────────────────┬──────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│    STEP 3: First Reward Upload — Optional (~10 sec)         │
│                                                             │
│  "Got an unused Google Pay or PhonePe reward card?"         │
│  Drag-and-drop or upload screenshot to parse instantly.     │
│                                                             │
│  [ Upload Screenshot ]          [ Skip to Dashboard → ]     │
└──────────────────────────┬──────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│    STEP 4: Land on /dashboard (Instant)                     │
│                                                             │
│  Pre-filled card preferences applied.                       │
│  Personalized "Estimated Monthly Savings" banner shown.     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key User Journeys

### Journey 1 (Updated): The 60-Second Stacker + Community Validation & Share

```
[Paste Product URL or Search Store on Dashboard]
               │
               ▼
   [System Fetches Base Price & Merchant Data]
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│             NET EFFECTIVE PRICE MATRIX                      │
│  Base Price: ₹2,499                                         │
│                                                             │
│  - Coupon 'INSIDER400': ₹400 off  [Works 👍] [Expired 👎]   │
│  - Card Offer (SBI Cashback): ₹210 off                      │
│  - Affiliate Cashback (CashKaro): ₹113 back                 │
├─────────────────────────────────────────────────────────────┤
│  NET PAYABLE AMOUNT: ₹1,776  (You Save ₹723 / 28.9%)        │
├─────────────────────────────────────────────────────────────┤
│  [ 🛒 Shop Now via Affiliate ]  [ 🚀 Share & Stack Deal ]   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │                              ▼
               │                  [Opens Share Modal — Flow C]
               ▼
 [ASCI Disclosure Toast: "Redirecting to Myntra via EarnKaro..."]
               │
               ▼
   [Opens external merchant site in new tab (target="_blank")]
```

**Inline Coupon Feedback (Community Validation):**  
Every coupon row in the matrix shows `[Works 👍]` and `[Expired 👎]` buttons. Tapping `👎` opens the Downvote Modal (Flow A). Tapping `👍` increments `upvotes` counter optimistically.

**Savings Share Trigger:**  
When total savings ≥ ₹100, a floating badge persists: *"🔥 You're saving ₹723! Share this stack & earn 50 Saver Coins."*

---

### Journey 2 (Updated): Screenshot OCR Vaulting + Manual Fallback Toggle

```
[Tap '+' FAB on Mobile / "Upload" button on Desktop]
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Add Reward Coupon                         │
│                                                             │
│  ┌──────────────────────────┐  ┌────────────────────────┐   │
│  │ 📷  Upload Screenshot   │  │ ✍️  Enter Manually      │   │
│  └────────────┬─────────────┘  └───────────┬────────────┘   │
└───────────────┼─────────────────────────────┼───────────────┘
               │                             │
               ▼                             ▼
  [Vision OCR Engine Processes]   [Manual Entry Drawer — Flow B]
               │                             │
               ▼                             │
 ┌───────────────────────────────────┐        │
 │   Overlay: "Analyzing Reward..." │        │
 │   [scanning beam animation]       │        │
 │   • Reading image...              │        │
 │   • Extracting promo code...      │        │
 │   • Validating expiry date...     │        │
 └──────────────────┬────────────────┘        │
                   │                         │
                   ▼                         │
 ┌───────────────────────────────────────────────────────────┐
 │            Interactive Parsing Verification               │
 │  Store:  [ Myntra            ▼ ]  (Extracted / editable) │
 │  Code:   [ INSIDER200          ]  (Editable)             │
 │  Value:  [ ₹200 Flat Off       ]  (Editable)             │
 │  Expiry: [ 30 Aug 2026         ]  (Date Picker)          │
 └──────────────────────────────┬────────────────────────────┘
                               │
                               └─────────────────────┐
                                                     │
                                                     ▼
                                    [Saved to `coupons` table]
                                    [source = 'USER_OCR' or 'USER_MANUAL']
                                    [status = 'ACTIVE']
                                    [Auto-applied in future Stacker searches]
```

---

## 5. Modals, Drawers & Overlay Interactions

### 5.1 Complete Overlay Trigger Directory

| Trigger Event | UI Component Type | User Action / Content | Backend System Action |
|--------------|------------------|----------------------|---------------------|
| Tap `+` FAB Button | Mobile Bottom Sheet / Desktop Center Modal | Tabbed: "📷 Upload Screenshot" or "✍️ Enter Manually" | Routes to Vision OCR engine or manual payload handler based on selected tab |
| Tap `[Expired 👎]` | Center Dialog Modal | 4-option reason selection (see Flow A) | Gated on user account age > 24h; Increments `downvotes` in DB; triggers Pipeline C if `downvotes ≥ 3` |
| Tap `[Works 👍]` | Inline Optimistic UI | Card upvote count increments instantly | Increments `upvotes` counter in `coupons` table |
| Tap "Enter Code Manually" | Right Slide-over Drawer / Mobile Bottom Sheet | Form: Brand, Code, Discount Type, Value, Expiry, Min Cart | Inserts record into `coupons` with `source = 'USER_MANUAL'` |
| Outbound Link Click | ASCI Interstitial Toast Notification (Bottom Center, 1.2s) | "Redirecting to Myntra via EarnKaro... We may earn a commission. ₹230 saved!" | Routes to `/r/[storeSlug]`; logs `affiliate_clicks` record; opens URL in new tab |
| Filter Cards | Side Drawer (Right) | Quick-toggle payment methods without leaving Stacker page | Updates `user_cards` preferences in-session |
| Unauthenticated Action (e.g., "Save Coupon") | Center Dialog Modal | "Sign in to save this coupon code to your vault" + Google / OTP buttons | Redirects to auth flow with `redirect` param preserved |
| Click "Share My Stack" | Center Card Modal + Preview | Dynamic social preview card + 1-tap WhatsApp / Copy Link | Generates referral URL `/s/[stackId]?ref=[userId]` |

---

### Flow A: Community Downvote & Flag Modal

```
[User Taps 👎 on Coupon Card]
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│               Flag Expired / Invalid Code                   │
│  Why didn't this code work for you?                         │
│                                                             │
│  ( ) Code expired or inactive                               │
│  ( ) Minimum cart value not met                             │
│  ( ) Not applicable on selected items                       │
│  ( ) Code is completely invalid                             │
│                                                             │
│  [ Cancel ]                        [ Submit Flag ]          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
   [Optimistic UI: Coupon card dimmed & marked "Flagged by you"]
                               │
                               ▼
   [API: POST /api/coupons/[id]/vote  →  { action: 'downvote', reason: '...' }]
                               │
                               ▼
   [PostgreSQL: downvotes++ on coupons table]
                               │
                               ▼
   [IF downvotes >= 3 OR flag_ratio > 60% within 12h:]
   [  UPDATE coupons SET status = 'PENDING_REVIEW' WHERE id = $1]
   [  Coupon hidden from primary Stacker calculations]
```

**Reason values stored in DB:**

| Reason Option | DB Value Stored |
|--------------|----------------|
| Code expired or inactive | `EXPIRED` |
| Minimum cart value not met | `MIN_CART_NOT_MET` |
| Not applicable on selected items | `ITEM_EXCLUSION` |
| Code is completely invalid | `INVALID` |

---

### Flow B: Manual Coupon Entry Drawer (OCR Fallback)

> For physical vouchers, SMS promo codes, or cases where OCR parse confidence < 60%.

```
[User selects "✍️ Enter Manually" tab OR OCR fails]
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Add Coupon to My Vault                     │
│                                                             │
│  Store Name:      [ Select Store (e.g., Myntra)       ▼ ]   │
│  Promo Code:      [ INSIDER500                         ]    │
│  Discount Type:   (•) Flat Amount (₹)   ( ) Percentage (%)  │
│  Discount Value:  [ 500                                ]    │
│  Min Cart Value:  [ 1999                               ]    │
│  Expiry Date:     [ 2026-08-31                     📅  ]    │
│                                                             │
│                        [ Save to My Vault ]                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
   [API: POST /api/coupons/submit  →  { source: 'USER_MANUAL', ... }]
                               │
                               ▼
   [Inserted into `coupons` table:]
   [  source = 'USER_MANUAL'  (coupon_source ENUM — TRD-AMD-02)]
   [  status = 'ACTIVE']
   [  user_id = currentUser.id]
                               │
                               ▼
   [Success Toast: "Coupon saved! It'll auto-apply in your next stack."]
   [Auto-applied in future Stacker searches for this store]
```

---

### Flow C: Share & Stack Invite Modal

> Triggers automatically when calculated stack savings ≥ ₹100 (post-calculation or post-purchase).

```
[Stacker Engine output: Total Saved ≥ ₹100]
              │
              ▼
   [Floating badge appears:]
   ["🔥 You're saving ₹723! Share this stack & earn 50 Saver Coins."]
              │
              │ [User clicks "Share Stack" or badge]
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Share Your Stack 🚀                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🎉 Rohan saved ₹723 (28% off) on Myntra!           │    │
│  │                                                     │    │
│  │  ₹400  — Coupon INSIDER400                          │    │
│  │  ₹210  — SBI Cashback Card Offer                   │    │
│  │  ₹113  — CashKaro Affiliate Cashback               │    │
│  │  ──────────────────────────────────────            │    │
│  │  TOTAL SAVED: ₹723 / Net Payable: ₹1,776           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [ 💬 Share on WhatsApp ]     [ 🔗 Copy Link ]              │
│                                                             │
│  Link: moneysaver.app/s/[stackId]?ref=[userId]              │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
   [Backend: generates /s/[stackId] — stores stack snapshot]
   [Referral tracked: ref=[userId] credited with 50 Saver Coins on conversion]
```

---

## 6. Edge Cases & System State Behaviors

### 6.1 Empty States

| Screen | Empty State Trigger | UI Display | Primary CTA |
|--------|--------------------|-----------|--------------|
| `/vault` | No coupons added | Illustration: empty wallet | "Upload a screenshot of your GPay/PhonePe reward to start stacking!" |
| `/cards` | No cards selected | Banner warning | "Select your bank cards to unlock up to 10% instant card discounts." |
| `/stacker` — no coupons for store | No active user coupons for searched store | Fallback message | "Stacking default bank instant discounts and affiliate cashbacks instead." |
| `/dashboard` | New user, no history | Welcome illustration | "Search a store or paste a product URL to see your first savings stack!" |

### 6.2 Error States

| Error | Trigger Condition | UI Response | Fallback |
|-------|------------------|------------|----------|
| **OCR Unreadable / Low Confidence** | Vision API parse confidence < 85% | Auto-opens Flow B manual entry drawer with raw detected text pre-filled and inline warning: *"Please verify the extracted details below."* | Pre-fills detected text in Flow B manual form |
| **Invalid Product URL** | URL not matching supported domains (Amazon, Flipkart, Myntra, Zomato, Ajio) | Toast: "Please paste a valid product link from Amazon, Flipkart, Myntra, Zomato, or Ajio." | — |
| **Network / API Timeout** | Affiliate query fails after 2 retries | Stacker renders with badge: "Showing cached rates from 1 hour ago." | Upstash Redis cached data |
| **OCR Upload Failure (S3)** | Pre-signed URL expired or upload fails | Toast: "Upload failed. Please try again." | Retry button; fallback to manual entry |
| **Auth Session Expired** | Clerk JWT expired mid-session | Seamless re-auth modal (no page reload) | Returns to same route post re-auth |

### 6.3 Loading States

| Feature | Loading Behavior | Duration Target |
|---------|-----------------|----------------|
| **Stacker Engine Calculation** | Pulsing skeleton UI placeholders matching price card layout | ≤ 150ms |
| **OCR Upload Processing** | Scanning beam animation over image preview + micro-status text: "Reading image... → Extracting promo code... → Validating expiry..." | ≤ 8 seconds |
| **Store Deal Matrix** | Shimmer cards for each deal row | ≤ 2 seconds |
| **Dashboard Initial Load** | Skeleton for savings counter + deal cards | ≤ 2.5s (LCP target) |

### 6.4 Offline / Degraded Mode

| Scenario | Behavior |
|----------|----------|
| Full offline | Show last cached `/dashboard` state; disable Stacker input; toast: "You're offline. Showing saved data." |
| Partial API failure (affiliate only) | Stacker shows coupon + card discounts; hides cashback row with note: "Cashback data unavailable — checking rates." |

---

## 7. Global Action & Redirect Matrix

| User Trigger | Origin Route | Redirect Destination | Condition / Parameters |
|-------------|-------------|---------------------|------------------------|
| Click "Sign In" | `/` (Landing) | `/dashboard` | Successful auth (Returning user) |
| Click "Sign Up" | `/` (Landing) | `/onboarding` | Successful auth (New user creation) |
| Complete Onboarding | `/onboarding` | `/dashboard` | Card selection saved to `user_cards` in DB |
| Click Store Card | `/dashboard` | `/deals/[storeSlug]` | Passes store slug via URL parameter |
| Paste Product URL | `/dashboard` or `/stacker` | `/stacker?url=[encodedUrl]` | URL validated against supported domain list |
| Click "Shop Now" | `/stacker` | External Store Site | Opens in new tab (`target="_blank"`) via affiliate redirect; logs `affiliate_clicks` |
| Delete Coupon | `/vault` | `/vault` | In-place optimistic UI removal + success Toast |
| Submit Flag (Flow A) | Any (Modal) | Same page | Downvote recorded; optimistic UI dim |
| Save Manual Coupon (Flow B) | Any (Modal) | `/vault` (or same page) | Coupon inserted; auto-applied in next Stacker |
| Click "Share Stack" | `/stacker` | Share Modal (Flow C) | Stack snapshot generated; `/s/[stackId]` URL created |
| Visit Shared Stack Link | `/s/[stackId]?ref=[userId]` | `/s/[stackId]` | Public access; affiliate referral tracked via `ref` param |
| Log Out | `/profile` | `/` (Landing) | Clears Clerk session + resets local Zustand state |
| Unauthenticated CTA | Any public page | Auth Modal (overlay) | Preserves current page context; redirects post-login |

---

## 8. Engineering Notes & Schema Implications

> These are technical notes for the backend engineering phase arising from App Flow design decisions.

### 8.1 TRD-AMD-02: `USER_MANUAL` Added to `coupon_source` ENUM

Flow B (Manual Coupon Entry Drawer) introduces coupons entered directly by the user via the form — distinct from `USER_OCR` (parsed from screenshot) and `COMMUNITY` (community submissions). The `coupon_source` ENUM must be extended:

```sql
-- TRD-AMD-02: Add USER_MANUAL to coupon_source ENUM
ALTER TYPE coupon_source ADD VALUE 'USER_MANUAL';
-- Full ENUM after AMD-02:
-- 'PUBLIC_SCRAPED' | 'USER_OCR' | 'COMMUNITY' | 'USER_MANUAL'
```

**Why separate from `COMMUNITY`?**  
`COMMUNITY` = a user submits a coupon to the public vault (visible to all users after review).  
`USER_MANUAL` = a user adds a personal coupon to their *own* vault only (`user_id IS NOT NULL`). They are functionally different and require different query paths and review workflows.

### 8.2 New Implied DB Table: `user_cards`

Onboarding Step 2 saves payment card/UPI preferences. A new table is required (to be fully specified in Backend Schema — Document 05):

```sql
-- Implied by Onboarding Step 2 & /cards page
-- Full specification deferred to Document 05 (Backend Schema)
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
```

### 8.3 New Implied DB Table: `shared_stacks`

Flow C (Share Stack) requires persistent stack snapshot storage for public `/s/[stackId]` URLs:

```sql
-- Implied by Flow C: Share & Stack Invite Modal
-- Full specification deferred to Document 05 (Backend Schema)
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

### 8.4 New API Endpoints Implied by App Flow

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/stacks/share` | POST | Create shared stack snapshot → returns `stackId` | ✅ User |
| `/api/stacks/[stackId]` | GET | Fetch public shared stack for `/s/[stackId]` | Public |
| `/api/user/cards` | GET | Fetch user's saved card preferences | ✅ User |
| `/api/user/cards` | POST | Save/update card preferences from Onboarding or `/cards` | ✅ User |
| `/api/coupons/[id]/vote` | POST | Already in TRD; extended with `reason` field (Flow A) | ✅ User |

### 8.5 Referral Tracking URL Pattern

Shared stack URLs follow this structure:

```
https://moneysaver.app/s/[stackId]?ref=[userId]

Example:
https://moneysaver.app/s/a3k9m2?ref=rohan123

Query params:
- stackId: short ID referencing shared_stacks table
- ref:     user ID of the sharing user (for Saver Coins credit on conversion)
```

### 8.6 OCR Confidence Threshold

Per the error handling spec, Vision API parse confidence is threshold-gated:
- **≥ 60% confidence**: Pre-fill the interactive form (Pipeline A, TRD §2)
- **< 60% confidence**: Show error card + pre-fill whatever text was detected → open Flow B (Manual Entry)

---

*Document prepared for MoneySaver — SaverStack | App Flow Version 1.0 | 2026-07-22*  
*Includes Addendum: Integrated Modals & Flow Enhancements (Flows A, B, C)*
