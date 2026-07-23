# 💰 MoneySaver — SaverStack

> **"Never pay full price again — stack every coupon, card offer, and cashback in one click."**

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)](.) [![Version](https://img.shields.io/badge/version-1.0.0-blue)](.) [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE) [![PRD](https://img.shields.io/badge/doc-PRD%20v1.1%20✓-brightgreen)](./docs/PRD.md) [![TRD](https://img.shields.io/badge/doc-TRD%20v1.3%20✓-brightgreen)](./docs/TRD.md) [![App%20Flow](https://img.shields.io/badge/doc-App%20Flow%20v1.1%20✓-brightgreen)](./docs/APP_FLOW.md) [![UI/UX](https://img.shields.io/badge/doc-UI/UX%20v1.1%20✓-brightgreen)](./docs/UI_UX_BRIEF.md) [![Backend%20Schema](https://img.shields.io/badge/doc-Backend%20v1.2%20✓-brightgreen)](./docs/BACKEND_SCHEMA.md) [![Impl%20Plan](https://img.shields.io/badge/doc-Impl%20Plan%20v1.1%20✓-brightgreen)](./docs/IMPLEMENTATION_PLAN.md) [![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](.) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](.) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](.) [![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](.)

---

## 📌 What is MoneySaver?

MoneySaver is an **intelligent savings aggregation and stacking platform** for Indian online shoppers. It eliminates the fragmented, time-consuming process of manually hunting coupons, cashbacks, card offers, and discounted gift vouchers across 5+ platforms — replacing it with a single-click, transparent **Net Payable Price Matrix**.

### The Problem We Solve

| Pain Point | Status Quo | MoneySaver Solution |
|---|---|---|
| Forgotten reward vouchers | Expire unused in GPay/PhonePe | OCR Screenshot Parser auto-captures them |
| Fragmented cashback portals | 3+ tabs open simultaneously | Unified Savings Stacker Engine |
| Unknown bank card offers | Found only after checkout | Payment & Card Optimizer |
| Price comparison is manual | User checks 4+ sites | Cross-Platform Price Matrix |
| Coupon codes are expired | Wastes time at checkout | Community Vault + verified scraping |

---

## 🎯 Target Audience

- **Primary**: Gen Z & Millennial Indian digital shoppers, Ages 18–35
- **Behavior**: Frequent buyers on Myntra, Amazon, Flipkart, Zomato, with active payment wallets and credit cards
- **Personas**:
  - 🎓 **Rohan** — College student, fashion + food, wants max discount in under 60 seconds
  - 💼 **Ananya** — Young professional, electronics + household, wants card-stacked net price

---

## ✨ Core Features (v1.0)

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 Must Have | **Screenshot Coupon Parser (OCR)** | Vision AI parses reward screenshots → extracts code, amount, platform, expiry |
| 🔴 Must Have | **Community & System Coupon Vault** | Scraped + user-submitted live promo codes |
| 🔴 Must Have | **Multi-Tier Savings Stacker Engine** | Layers: base price → store coupon → cashback % → gift voucher → bank/UPI offer |
| 🔴 Must Have | **Cross-Platform Price Matrix** | Amazon vs Flipkart vs Brand Site — net final payable price |
| 🔴 Must Have | **Payment & Card Optimizer** | Best card/UPI for your cart total |
| 🔴 Must Have | **Discounted Voucher Integration** | Buy 5%-off gift cards (Zave/Gyftr) to layer on cart |
| 🔴 Must Have | **Product & Store Deal Search** | Enter URL or store name → instant best stack |
| 🟡 v2 | **Savings Tracker & Coins Wallet** | Gamified rupees-saved tracker + Saver Coins |
| 🟡 v2 | **Auto-Sync Browser Extension** | Detects cart value at checkout, pops optimal stack |

---

## 🚫 Out of Scope — v1.0

- ❌ Automated Account Scraping (no user passwords/logins to 3rd-party apps)
- ❌ Illegal / Expired Offer Listings
- ❌ In-App Direct Product Checkout (affiliate redirect only)
- ❌ False "100% working" guarantees — all stacks show conditional terms

---

## 📊 Success KPIs (Launch + 90 Days)

| Metric | KPI | Target |
|--------|-----|--------|
| User Value | Avg. Savings Per User | ≥ ₹150/transaction |
| Engagement | OCR Parse Success Rate | ≥ 92% accuracy |
| Conversion | Affiliate Click-Through Rate | ≥ 25% |
| Retention | 30-Day Repeat Users | ≥ 35% |
| Business | GMV Facilitated | ₹10,00,000+ |

---

## 🏗️ Tech Stack

> ✅ **Confirmed via TRD v1.0** — Finalized 2026-07-22

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14+ (App Router, TypeScript) | SSR for deal page SEO; Server Components for fast load times |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible, zero runtime overhead |
| **State** | TanStack Query + Zustand | Optimistic UI updates for voting + instant local state |
| **Backend** | Next.js Server Actions + API Routes | Co-located with frontend, no separate server needed |
| **Database** | PostgreSQL — Neon (Serverless) + Drizzle ORM | Relational integrity + JSONB + true environment branching |
| **Auth** | Clerk (Google OAuth + Email OTP) | Zero-boilerplate auth with bot protection built-in |
| **Cache** | Upstash Redis (Serverless) | Serverless billing, Vercel-native, no cold-start |
| **OCR** | Google Cloud Vision API | Best accuracy for mobile screenshots |
| **Storage** | AWS S3 (Ephemeral, 15-min TTL) | Privacy-first; screenshots auto-deleted post-parse |
| **Monitoring** | Sentry + PostHog | Error tracking + user event funnels |
| **Hosting** | Vercel | Global edge, native Next.js, preview deployments |
| **CI/CD** | GitHub Actions | Lint → Type-check → Build → Deploy |

---

## 📁 Project Structure

```
money-saver/
├── docs/                    # All planning documents
│   ├── PRD.md               # Product Requirements Document ✓
│   ├── TRD.md               # Technical Requirements Document (pending)
│   ├── APP_FLOW.md          # App Flow & Navigation (pending)
│   ├── UI_UX_BRIEF.md       # Design System & UI Brief (pending)
│   ├── BACKEND_SCHEMA.md    # DB Schema, Auth, Relationships (pending)
│   └── IMPLEMENTATION_PLAN.md # Step-by-step build sequence (pending)
├── frontend/                # Frontend application (pending)
├── backend/                 # Backend API server (pending)
├── scripts/                 # Utility and automation scripts
├── .github/workflows/       # GitHub Actions CI/CD workflows
├── TASK.md                  # Living development task log ✓
├── CHANGELOG.md             # Version history ✓
├── CONTRIBUTING.md          # Contribution guidelines ✓
├── CODE_OF_CONDUCT.md       # Community standards ✓
├── SECURITY.md              # Security policy ✓
├── LICENSE                  # MIT License ✓
└── README.md                # This file ✓
```

---

## 📄 Documentation

All planning documents live in [`/docs`](./docs/):

1. [PRD — Product Requirements Document](./docs/PRD.md) ✅ v1.1
2. [TRD — Technical Requirements Document](./docs/TRD.md) ✅ v1.3 (incl. TRD-AMD-03 Proactive Safeguards)
3. [App Flow & Navigation](./docs/APP_FLOW.md) ✅ v1.1 (incl. ASCI Toast & /r/ Gateway)
4. [UI/UX Design Brief](./docs/UI_UX_BRIEF.md) ✅ v1.1 (Neo-Fintech + Oxblood/Crimson)
5. [Backend Schema & API Specs](./docs/BACKEND_SCHEMA.md) ✅ v1.2 (incl. Section 8 Safeguard Specs)
6. [Implementation Plan & Roadmap](./docs/IMPLEMENTATION_PLAN.md) ✅ v1.1 (7-Phase 15-Day Build Roadmap)
7. [Project Documentation](./docs/PROJECT_DOCUMENTATION.html) ✅ 30-min comprehensive doc

---

## 🚀 Getting Started

> ⚠️ Development hasn't started yet. This section will be updated after the Implementation Plan is finalized.

```bash
# Clone the repository
git clone https://github.com/your-org/money-saver.git
cd money-saver

# Install dependencies (frontend)
cd frontend && npm install

# Install dependencies (backend)
cd ../backend && npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting pull requests.

---

## 🔐 Security

Please read [SECURITY.md](./SECURITY.md) for our responsible disclosure policy.

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

*Built with ❤️ for Indian shoppers who deserve to save more.*
