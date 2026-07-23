# 🎨 UI/UX Design System Brief

**App Name**: MoneySaver (SaverStack)  
**Document**: 04 — UI/UX Design System Brief  
**Version**: 1.1 (Updated with Luxury Neo-Fintech Oxblood & Crimson Accent System)  
**Date**: 2026-07-22  
**Status**: ✅ Complete  
**Prepared By**: Product Owner + AI Engineering Lead  

---

## 1. Aesthetic Direction & Brand Vibe

MoneySaver (SaverStack) adopts a **Utility-First Neo-Fintech** aesthetic direction—combining the clean performance density of tools like Linear with the high-trust financial polish of Cred and Revolut, infused with a **Luxury Deep Oxblood & Velvet Crimson** accent system.

- **Tone**: Transparent, precise, rewarding, and modern.
- **Core Design Principle**: **Financial Clarity Over Clutter**. Unlike traditional coupon websites that rely on aggressive popups, banner ads, and fake timer countdowns, MoneySaver treats savings as a calculated financial transaction. Every discount is presented as a clean mathematical line-item.
- **Color Accent Logic**: **Deep Oxblood & Velvet Crimson** provide a luxury neo-fintech aesthetic for deal highlights, premium vault badges, and hero banners, while **Emerald Green** remains strictly dedicated to positive financial savings callouts and primary actions.

## 2. Color Palette & Design Tokens

The color system uses high-contrast neutrals balanced with an authoritative emerald green for verified savings, gold accents for reward milestones, and deep oxblood/crimson for hero stack highlights and premium branding.

### Light & Dark Mode Palettes

```
LIGHT MODE PALETTE                                DARK MODE PALETTE
┌─────────────────────────────────────────┐      ┌─────────────────────────────────────────┐
│ Background: Zinc Off-White (#FAFAFA)    │      │ Background: Deep Obsidian (#090D16)     │
│ Surface: Pure White (#FFFFFF)           │      │ Surface: Dark Slate (#111827)           │
│ Text Primary: Slate 900 (#0F172A)       │      │ Text Primary: Slate 50 (#F8FAFC)        │
│ Net Savings CTA: Emerald Green (#059669)│      │ Net Savings CTA: Emerald Green (#10B981)│
│ Brand Hero/Accent: Velvet Crimson(#991B1B)│    │ Brand Hero/Accent: Deep Oxblood(#450A0A)│
│ Accent Highlight: Amber Gold (#F59E0B)  │      │ Accent Highlight: Amber Gold (#FBBF24)  │
└─────────────────────────────────────────┘      └─────────────────────────────────────────┘
```

### Complete Color Role Matrix

| Token Name | Light / Dark Hex Code | CSS Variable Name | Purpose / Application |
|---|---|---|---|
| `brand-oxblood` | `#450A0A` | `--brand-oxblood` | Deep container backgrounds, hero deal cards, high-tier stack banners |
| `brand-crimson` | `#991B1B` | `--brand-crimson` | Secondary buttons, premium vault badges, active border outlines |
| `brand-emerald` | `#059669` (Light) / `#10B981` (Dark) | `--brand-emerald` | "Net Payable" savings callouts, verified status tags, primary action CTAs |
| `brand-amber` | `#F59E0B` (Light) / `#FBBF24` (Dark) | `--brand-amber` | Reward coin balance, percentage discount badges, promo code highlights |
| `bg-app` | `#FAFAFA` (Light) / `#090D16` (Dark) | `--bg-app` | Base application background |
| `bg-surface` | `#FFFFFF` (Light) / `#111827` (Dark) | `--bg-surface` | Elevated cards, tables, drawers, and modal popups |
| `bg-surface-subtle` | `#F1F5F9` (Light) / `#1E293B` (Dark) | `--bg-surface-subtle` | Table headers, secondary chips |
| `border-subtle` | `#E2E8F0` (Light) / `#1F2937` (Dark) | `--border-subtle` | 1px card borders, dividers |
| `text-primary` | `#0F172A` (Light) / `#F8FAFC` (Dark) | `--text-primary` | Headings, main prices, active tabs |
| `text-secondary` | `#64748B` (Light) / `#94A3B8` (Dark) | `--text-secondary` | Subtitles, helper text, timestamps |
| `state-error` | `#EF4444` (Light) / `#F87171` (Dark) | `--state-error` | Expired coupon flags, invalid inputs, system errors |

## 3. Typography & Type Scale

MoneySaver utilizes a dual-font strategy: a modern sans-serif for UI clarity paired with a strict monospace font for monetary alignment.

- **Primary Sans Font**: Plus Jakarta Sans or Geist Sans
- **Monospace Font**: JetBrains Mono or Geist Mono (Enforces tabular lining numerals so monetary figures align cleanly across comparison matrices).

```css
/* Typography Configuration */
--font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale Hierarchy

| Level | Size / Line Height | Weight | Font Family | Usage Example |
|---|---|---|---|---|
| Display H1 | 32px / 1.2 | Bold (700) | Sans | Landing hero, Net Payable total (₹1,776) |
| Heading H2 | 22px / 1.3 | SemiBold (600) | Sans | Section titles ("Your Coupon Vault") |
| Heading H3 | 16px / 1.4 | SemiBold (600) | Sans | Store names, card headers |
| Body Large | 15px / 1.5 | Regular (400) | Sans | Stacker line-item descriptions |
| Body Small | 13px / 1.5 | Regular (400) | Sans | Helper microcopy, ASCI legal disclosures |
| Monospace Code | 14px / 1.2 | Medium (500) | Mono | Promo codes (INSIDER500), discount values |
| Badge / Label | 11px / 1.0 | SemiBold (600) | Sans (Uppercase) | Status chips (VERIFIED, 10% OFF) |

## 4. Component Elevation & Styling Rules

| Element Type | Border Radius | Border & Elevation |
|---|---|---|
| Primary Cards | 12px (`rounded-xl`) | 1px `border-subtle` + `shadow-sm` |
| Featured Hero Stacks | 12px (`rounded-xl`) | 1px subtle oxblood border stroke (`border-red-950/20`) + `shadow-md` |
| Buttons & Inputs | 8px (`rounded-lg`) | 1px border-transparent |
| Chips & Badges | 9999px (`rounded-full`) | 0px border + `bg-surface-subtle` |
| Modals & Drawers | 16px (`rounded-2xl`) | 1px `border-subtle` + `shadow-2xl` |

- **Border Stroke Policy**: Every elevated surface features a crisp 1px subtle border stroke (border-slate-200 light / border-slate-800 dark) with a deep oxblood tint (`border-red-950/20`) on featured hero stacks to maintain structural visibility regardless of display brightness.
- **Glassmorphic Navigation**: Sticky top headers and mobile bottom navigation bars utilize `backdrop-blur-md` with `bg-surface/80` transparency to keep scrollable content visible beneath chrome elements.

## 5. Key UI Component Blueprints

### Component 1: The Multi-Tier Savings Stacker Breakdown Card
```text
┌────────────────────────────────────────────────────────────────────────┐
│ MYNTRA CART SAVINGS STACK                                     [SHARE 🚀]│
├────────────────────────────────────────────────────────────────────────┤
│ Original Base Price                                           ₹2,499.00│
│                                                                        │
│ - Store Coupon (INSIDER400)                                  - ₹400.00│
│   [Public Code]  [Works 👍 142]  [Expired 👎 2]                        │
│                                                                        │
│ - Gift Voucher (Gyftr 5% Off)                                 - ₹104.95│
│                                                                        │
│ - Bank Instant Discount (SBI Card 10%)                        - ₹199.40│
│                                                                        │
│ - Outbound Cashback (CashKaro 6%)                             - ₹107.68│
├────────────────────────────────────────────────────────────────────────┤
│ NET PAYABLE AMOUNT                                            ₹1,686.97│
│ Total Savings: ₹812.03 (32.5% OFF)                              [EMERALD]│
├────────────────────────────────────────────────────────────────────────┤
│ [ Shop Now via CashKaro Link ↗ ]  (ASCI Commission Disclosure Applies)│
└────────────────────────────────────────────────────────────────────────┘
```

### Component 2: Interactive OCR Upload Bottom Sheet (Mobile)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ ═ (Drag Handle)                                                        │
│                                                                        │
│  Add Reward Screenshot                                     [ Cancel ]  │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                  [ 📸 Upload Screenshot / Photo ]                   │ │
│ │               Drop image here or browse device files               │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ── OR ENTER MANUALLY ───────────────────────────────────────────────── │
│ Store Name            Promo Code                                       │
│ [ Myntra         ▼ ]  [ INSIDER200                     ]               │
│                                                                        │
│ Discount Amount ($/%) Expiry Date                                      │
│ [ ₹200             ]  [ 2026-08-31                     📅 ]         │
│                                                                        │
│ [ Save Coupon to Vault ]                                               │
└────────────────────────────────────────────────────────────────────────┘
```

## 6. Responsive Layout & Touch Target Standards

**DESKTOP VIEWPORT (≥ 1024px)**
- Header: Logo | Search Bar (Ctrl+K) | Navigation Tabs | Profile
- Main Content Grid: 8 Cols (Stacker/Matrix) | 4 Cols (Vault Preview)

**MOBILE VIEWPORT (< 768px)**
- Sticky Header: Logo | Search Icon | Filter Drawer Toggle
- Main Single Column Stream
- Floating Action Button (FAB): '+' Upload Coupon
- Sticky Bottom Navigation Bar: Home | Stacker | Vault | Cards

- **Minimum Touch Hit Target**: All interactive controls maintain a strict minimum bounding box of 44 x 44px to eliminate accidental taps on mobile touchscreens.
- **Single-Hand Thumb Zone Alignment**: Primary actionable buttons (e.g., "Shop Now", "Upload Screenshot") are placed within the bottom 40% of the screen height on mobile devices.

## 7. Accessibility (WCAG 2.1 AA Compliance)

- **Color Contrast Ratios**: Text (`text-primary` and `text-secondary`) achieves at least 4.5:1 contrast against all background states. Large numeric display totals (H1) achieve at least 3.0:1 contrast ratio.
- **Dynamic Text Rescaling**: Supports system font scaling up to 200% without breaking card layouts.
- **Keyboard Navigation & Focus Rings**: Every interactive element includes a high-visibility focus ring: `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2`. Full keyboard navigation support for the Cmd/Ctrl + K global store search drawer.
- **Screen Reader Live Regions**: The calculation engine wraps updating total values inside an `aria-live="polite"` container, ensuring screen readers announce updated net payable values when user card choices or coupons change.
