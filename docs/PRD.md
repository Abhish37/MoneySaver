# 📦 Product Requirements Document (PRD)

**App Name**: MoneySaver
**Codename**: SaverStack
**Version**: 1.0
**Date**: 2026-07-22
**Status**: ✅ Complete

---

> **Tagline**: *"Never pay full price again — stack every coupon, card offer, and cashback in one click."*

---

## Table of Contents

1. [Problem Statement & Target Audience](#1-problem-statement--target-audience)
2. [Core Value Proposition](#2-core-value-proposition)
3. [Target User Personas](#3-target-user-personas)
4. [Feature Specifications](#4-feature-specifications)
5. [User Stories](#5-user-stories)
6. [Out of Scope](#6-out-of-scope)
7. [Success Metrics & KPIs](#7-success-metrics--kpis)

---

## 1. Problem Statement & Target Audience

### Problem Statement

Indian online shoppers consistently overpay because the savings landscape is deeply fragmented. To get the best price on a single product, a user must simultaneously:

- Check **2–3 cashback portals** (CashKaro, EarnKaro, GoPaisa)
- Hunt for **active coupon codes** across multiple aggregator sites
- Remember and apply **bank/card-specific offers** that change monthly
- Recall unused **reward vouchers** sitting in GPay, PhonePe, or Amazon Pay wallets
- Compare prices across **Amazon, Flipkart, Myntra, and brand websites**
- Optionally buy **discounted gift cards** from Gyftr or Zave to layer additional savings

This fragmentation means the average user either:
- **Gives up** and pays full price (majority)
- **Spends 20–40 minutes** manually stacking, risking expired or invalid offers
- **Forgets** high-value vouchers they already own, letting them expire unused

### Target Audience

| Segment | Description |
|---------|-------------|
| **Age Range** | 18–35 years old |
| **Demographics** | Gen Z & Millennial Indian digital shoppers |
| **Shopping Habits** | Frequent buyers on Myntra, Amazon, Flipkart, Swiggy/Zomato |
| **Payment Behavior** | Active use of UPI wallets (GPay, PhonePe) and credit/debit cards |
| **Savings Awareness** | Knows discounts exist but finds the process too time-consuming |

---

## 2. Core Value Proposition

MoneySaver is an **intelligent savings aggregation and stacking platform** that:

1. **Aggregates** every available discount layer for a product or cart — coupons, cashbacks, card offers, and discounted gift cards — into one place.
2. **Stacks** these layers intelligently using a proprietary **Multi-Tier Savings Stacker Engine** to calculate the single lowest **Net Payable Price**.
3. **Captures** forgotten rewards automatically via an **OCR Screenshot Parser** that reads wallet/GPay screenshots and extracts usable voucher codes.
4. **Compares** prices across platforms (Amazon vs Flipkart vs Brand Site) so users always start from the lowest base price.
5. **Recommends** the optimal payment method (credit card + bank offer + UPI cashback) to maximize total savings.

**The promise**: A user searches for any product → MoneySaver shows the single lowest net payable amount → One-click redirect to checkout.

---

## 3. Target User Personas

### 🎓 Persona 1 — Rohan

| Attribute | Detail |
|-----------|--------|
| **Name** | Rohan Sharma |
| **Age** | 21 |
| **Occupation** | Engineering college student, Pune |
| **Devices** | Android smartphone (primary), laptop |
| **Monthly Online Spend** | ₹2,000–₹5,000 |
| **Shopping Platforms** | Myntra, Swiggy, Amazon |
| **Payment Method** | GPay UPI, HDFC Student Credit Card |
| **Pain Point** | Knows discount codes exist, but can never find working ones fast enough at checkout |
| **Goal** | Get maximum discount on fashion and food orders in under 60 seconds |
| **Motivation** | Every rupee saved = more money for weekend plans |
| **Preferred Feature** | Quick coupon search + one-click stack for cart value |

---

### 💼 Persona 2 — Ananya

| Attribute | Detail |
|-----------|--------|
| **Name** | Ananya Iyer |
| **Age** | 29 |
| **Occupation** | Product Manager at a Bengaluru startup |
| **Devices** | iPhone (primary), MacBook |
| **Monthly Online Spend** | ₹8,000–₹20,000 |
| **Shopping Platforms** | Amazon (electronics), Flipkart, Nykaa, brand websites |
| **Payment Method** | HDFC Regalia Credit Card, ICICI Amazon Pay Card, Apple Pay |
| **Pain Point** | Has multiple high-cashback credit cards but never remembers which card gives the best offer for each platform |
| **Goal** | See the exact net payable price after applying her best card offer + any available coupon, without manually cross-checking |
| **Motivation** | Wants to feel financially smart; dislikes paying more than necessary for planned purchases |
| **Preferred Feature** | Card & Payment Optimizer — "tell me exactly which card to use and why" |

---

## 4. Feature Specifications

### v1.0 — Must Have Features

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| F-01 | **Screenshot Coupon Parser (OCR)** | 🔴 Must Have | User uploads or pastes a screenshot from GPay, PhonePe, Amazon Pay, or any rewards wallet. Vision AI (Google Cloud Vision or equivalent) parses the image and extracts: voucher/coupon code, rupee amount or percentage, applicable platform/store, and expiry date. Extracted codes are saved to the user's personal Coupon Vault. |
| F-02 | **Community & System Coupon Vault** | 🔴 Must Have | A centralized database of active promo codes sourced from: (a) automated scraping of public coupon sites (CouponDuniya, GrabOn, Couponzguru), and (b) user-submitted codes from the community. All codes display: success rate %, number of recent uses, expiry date, and applicable terms. |
| F-03 | **Multi-Tier Savings Stacker Engine** | 🔴 Must Have | The core algorithm that calculates the lowest Net Payable Price by stacking discount layers in the correct order: Base Product Price → Store/Brand Coupon → Cashback Portal % → Gift Voucher Offset → Bank/Card/UPI Offer. Outputs a transparent breakdown showing how much each layer contributes to total savings. |
| F-04 | **Cross-Platform Price Matrix** | 🔴 Must Have | For any given product (searched by name, URL, or barcode), displays a side-by-side comparison table: Amazon, Flipkart, Myntra, and Brand Website. Shows the base price, best available coupon per platform, applicable cashback, and the resulting Net Payable Price on each platform. Highlights the winning platform. |
| F-05 | **Payment & Card Optimizer** | 🔴 Must Have | User inputs (or the system auto-detects) the cart total and their saved payment methods (credit cards, debit cards, UPI wallets). The system cross-references against a database of current bank offers, credit card cashback rates, and UPI platform offers to recommend: (a) the single best payment method, and (b) the combo (e.g., HDFC card + GPay UPI for an extra 2%) that gives the lowest final amount. |
| F-06 | **Discounted Gift Voucher Integration** | 🔴 Must Have | Integration with Gyftr and Zave APIs to display discounted gift cards for popular brands (Amazon, Myntra, Flipkart, Swiggy). For example, buy a ₹500 Amazon voucher for ₹475 (5% off) and layer it onto a purchase for an additional saving layer. Stacker Engine automatically includes this layer when calculating Net Payable Price. |
| F-07 | **Product & Store Deal Search** | 🔴 Must Have | Primary entry point for users. Accepts: (a) a product URL (Amazon/Flipkart/Myntra), (b) a product name search, or (c) a store/category name. Returns the Cross-Platform Price Matrix and the best Savings Stack for that product immediately. |
| F-08 | **Savings Tracker & Coins Wallet** | 🟡 v2 | A personal dashboard showing cumulative rupees saved over time via MoneySaver. Gamified with "Saver Coins" earned per transaction (could be redeemed for premium features or affiliate-funded rewards in a future phase). |
| F-09 | **Auto-Sync Browser Extension** | 🟡 v2 | A Chrome/Firefox extension that detects when the user is on a supported e-commerce checkout page, reads the cart total, and pops up the optimal savings stack in a side panel — without requiring the user to visit the MoneySaver app separately. |

---

## 5. User Stories

### Story 1 — OCR Voucher Capture

> **As** Rohan (a college student),
> **I want to** upload a screenshot of my GPay reward notification,
> **So that** MoneySaver automatically extracts the voucher code and saves it to my vault, and I never forget to use it before it expires.

**Acceptance Criteria:**
- User can upload any image file or paste a screenshot directly into the OCR parser
- The system extracts: voucher code (if present), monetary value or discount %, applicable store/platform, and expiry date
- Extracted voucher is saved to the user's personal Coupon Vault with a 24-hour expiry reminder
- Parse success rate ≥ 92% on a test set of 100 standard wallet screenshots
- If extraction confidence is low (< 80%), the system prompts the user to confirm or correct the extracted details manually

---

### Story 2 — Best Net Price Stack

> **As** Ananya (a professional shopper),
> **I want to** paste a Flipkart product URL into MoneySaver,
> **So that** I immediately see the lowest net payable price across all platforms with the optimal coupon + card offer pre-applied.

**Acceptance Criteria:**
- User pastes a product URL → system returns results within 5 seconds
- Results display a Cross-Platform Price Matrix comparing at minimum: Amazon, Flipkart, and Brand Website
- Each platform row shows: base price, best applicable coupon (code + discount), cashback %, discounted gift card option, bank card offer, and calculated Net Payable Price
- The row with the lowest Net Payable Price is visually highlighted as "Best Deal"
- One-click CTA redirects to the winning platform's product page (with affiliate tracking)

---

### Story 3 — Card Optimizer for High-Value Purchase

> **As** Ananya,
> **I want to** enter my cart total (₹12,500 on Amazon) and my saved credit cards,
> **So that** MoneySaver tells me exactly which card to use — and how much I'll save — before I complete checkout.

**Acceptance Criteria:**
- User can save multiple payment methods (credit card, debit card, UPI ID) in their profile
- User enters a store name and cart total → system returns a ranked list of payment methods
- Each payment method shows: applicable offer (e.g., "10% off up to ₹1,500 with HDFC card"), effective savings in ₹, and net amount after discount
- The top recommendation is displayed prominently with a clear explanation of why it was chosen
- Offers database is refreshed at minimum every 6 hours

---

### Story 4 — Community Coupon Contribution

> **As** Rohan,
> **I want to** submit a working coupon code I found for Myntra,
> **So that** other users in the community can benefit from it and I earn Saver Coins for my contribution.

**Acceptance Criteria:**
- User can submit a coupon code via a simple form: store, code, discount description, expiry date (optional)
- Submitted codes go through automated validation before appearing in the Community Vault (or are flagged as "unverified" with user count)
- User is notified when their code is validated and live
- User earns Saver Coins (tracked, redeemable in v2) for valid community submissions
- Codes that fail at checkout can be reported as "expired" by users, which triggers removal after 3 reports

---

## 6. Out of Scope

The following are explicitly excluded from MoneySaver v1.0 to maintain focus and legal compliance:

| # | Exclusion | Reason |
|---|-----------|--------|
| OOS-01 | **Automated Account Scraping** — logging into user's Amazon/Flipkart/GPay accounts on their behalf | Privacy risk, violation of platform ToS, and regulatory exposure |
| OOS-02 | **Illegal or Unethical Offer Listings** — sharing coupon codes that violate merchant terms, platform policies, or consumer protection laws | Legal risk and reputational damage |
| OOS-03 | **In-App Direct Product Checkout** — processing transactions or payments within MoneySaver | Requires payment aggregator license (RBI), significant regulatory burden |
| OOS-04 | **False "100% Working" Guarantees** — claiming all coupon codes are guaranteed valid | Consumer protection compliance; all stacks and codes display success rates and terms |

---

## 7. Success Metrics & KPIs

Performance will be evaluated at **Launch + 30 Days**, **Launch + 60 Days**, and **Launch + 90 Days**.

| # | Category | Metric | KPI Target | Measurement Method |
|---|---------|--------|-----------|-------------------|
| KPI-01 | **User Value** | Average Savings Per User Per Transaction | ≥ ₹150 | Tracked via affiliate link parameters + self-reported |
| KPI-02 | **Engagement** | OCR Parse Success Rate | ≥ 92% accuracy | Automated test suite + production error logs |
| KPI-03 | **Conversion** | Affiliate Click-Through Rate | ≥ 25% | Affiliate link click tracking |
| KPI-04 | **Retention** | 30-Day Repeat Users | ≥ 35% | User session analytics |
| KPI-05 | **Business** | GMV Facilitated (Gross Merchandise Value) | ₹10,00,000+ in first 90 days | Sum of cart totals at affiliate redirect |
| KPI-06 | **Community** | Community Coupon Submissions | ≥ 500 valid codes/month | Database count of verified submissions |
| KPI-07 | **Performance** | Product Search Result Latency | ≤ 5 seconds P95 | Server-side performance monitoring |
| KPI-08 | **Quality** | Coupon Code Validity Rate (live codes in vault) | ≥ 70% | Automated code validation jobs |

---

## 8. PRD Amendment — v1.1 (Corporate Standard Revisions)

**Amendment Date**: 2026-07-22
**Requested By**: Product Owner
**Reviewed By**: AI Engineering Lead (SaverStack Agent)
**Status**: ✅ Accepted & Merged into v1 Scope

The following 6 requirements have been **officially revised** from the original PRD v1.0 to align with corporate engineering standards, legal compliance, and realistic launch targets.

| # | Feature / Requirement | Original Plan (v1.0) | Revised Corporate Standard (v1.1) | Reason for Change |
|---|----------------------|---------------------|----------------------------------|-------------------|
| AMD-01 | **Authentication** | Basic Email / Password | Google OAuth + Email OTP via Clerk or Supabase Auth | Reduces friction, eliminates password management risk, higher trust signal for new users |
| AMD-02 | **OCR Ingestion Target** | 92% Automated Parsing (hard KPI) | 85% Automated Target + Interactive Manual Correction UI | 92% is too aggressive for launch; 85% with a fallback UI is more user-friendly and achievable |
| AMD-03 | **Coupon Freshness** | Manual cleanup (ad-hoc) | Partner API Cron Job (24h refresh cycle) + Crowd-sourced Downvote System | Manual cleanup doesn't scale; automated cron + community downvotes creates a self-healing vault |
| AMD-04 | **Compliance** | None defined | ASCI Affiliate Disclosure Badges on ALL outbound CTAs | ASCI (India) guidelines legally require affiliate link disclosure; non-compliance = legal risk |
| AMD-05 | **Gift Vouchers** | Native API Purchase (Gyftr/Zave direct) | Affiliate Link Redirection to Gyftr/Zave (Zero-KYC Overhead) | Direct API purchase requires KYC verification pipeline; affiliate redirect achieves same goal with zero compliance burden |
| AMD-06 | **Retention Loop** | Complex Coin Wallet (v2 feature) | Instant "You Saved ₹X Today" Savings Banner + Cumulative Savings Counter | Simple, immediate visual reward is higher-impact than a complex coin economy for v1 retention |

### Amendment Impact on KPIs

| KPI Affected | Original Target | Revised Target | Impact |
|---|---|---|---|
| KPI-02: OCR Parse Rate | ≥ 92% | ≥ 85% automated + manual correction fallback | More realistic; user trust maintained |
| KPI-04: 30-Day Retention | ≥ 35% | ≥ 35% (now supported by Savings Banner) | Same target, better mechanism |
| KPI-08: Coupon Validity Rate | ≥ 70% | ≥ 80% (improved by 24h cron + downvotes) | Target raised due to better mechanism |

### Compliance Checklist Added (From AMD-04)

| Requirement | Implementation | Priority |
|---|---|---|
| ASCI Affiliate Badge | Show "Affiliate Link ℹ️" badge on every outbound CTA | 🔴 Must Have |
| Badge Tooltip | On hover: "MoneySaver earns a commission if you purchase via this link. This does not affect your price." | 🔴 Must Have |
| Terms & Conditions Link | Footer link to full affiliate disclosure page | 🔴 Must Have |
| Data Privacy Notice | Cookie consent + minimal PII collection notice on first visit | 🔴 Must Have |

---

*Document prepared for MoneySaver — SaverStack | Version 1.1 | 2026-07-22 (Amended)*
*Original Version 1.0 archived for reference. Amendment AMD-01 through AMD-06 are now canonical.*
