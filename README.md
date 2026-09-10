# ⚡ TESLA CAPITALS

<div align="center">

![Tesla Capitals Banner](public/tesla-seeklogo.png)

### Next-Generation Energy, Autonomous Tech & Financial Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18%20Tables%20%2B%20RLS-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Resend](https://img.shields.io/badge/Resend-Email%20Engine-black?style=for-the-badge&logo=resend)](https://resend.com/)
[![Smartsupp](https://img.shields.io/badge/Smartsupp-Live%20Chat-orange?style=for-the-badge)](https://www.smartsupp.com/)

**Domain:** `https://www.teslacapitals.app` &bull; **Support:** `support@teslacapitals.app`

</div>

---

## 📖 Executive Summary

**Tesla Capitals** is a high-performance, institutional-grade web application merging Tesla's signature industrial aesthetic with modern fintech architecture. The platform delivers a unified ecosystem spanning **curated investment funds, live stock trading, digital asset treasury, Tesla vehicle & energy store, 5-tier VIP rewards, identity verification (KYC), promotional giveaways, and a comprehensive back-office operations suite**.

Built with **Next.js 16 (Turbopack)**, **Supabase SSR**, and **PostgreSQL with Row-Level Security (RLS)**, the application enforces complete mathematical balance validation, automated transaction ledger accounting, and administrative authorization gates.

---

## 🏛️ Application Architecture

The ecosystem is partitioned into **four distinct operating layers**:

```text
TESLA CAPITALS PLATFORM
│
├── 🌐 1. PUBLIC MARKETING & KNOWLEDGE HUB
│   ├── /                         # Hero video, stock ticker, dynamic counters, platform showcase
│   ├── /learn                    # Sustainable energy & autonomous driving insights
│   ├── /about                    # Mission, corporate philosophy, platform milestones
│   ├── /terms                    # Legal Terms of Service
│   ├── /privacy                  # Data Privacy Policy
│   └── /risk-disclosure          # Financial Risk Warnings & Investment Disclaimers
│
├── 🔐 2. AUTHENTICATION & SECURITY GATEWAY
│   ├── /login                    # Credentials + Google & X/Twitter OAuth + Error Diagnostic
│   ├── /signup                   # Verified registration with email activation requirement
│   ├── /forgot-password          # Password reset trigger
│   ├── /reset-password           # Secure session recovery & password update
│   └── /auth/callback            # Server-side PKCE code exchange & role redirection
│
├── 💼 3. MEMBER WEALTH PLATFORM (Authenticated)
│   ├── /dashboard                # Net worth KPI, asset allocation, Recharts performance, activity
│   ├── /wallet                   # Available cash, realized/unrealized P&L, crypto deposit & withdrawal, swap
│   ├── /investments              # Growth & Clean Energy fund discovery with balance-backed purchases
│   ├── /investments/[id]         # Fund analytics, capital allocation calculator, purchase confirmation
│   ├── /stocks                   # Live ticker feed, 30-day performance trends, market capitalizations
│   ├── /stocks/[symbol]          # Stock charts, company filings, balance-funded share acquisition
│   ├── /portfolio                # Consolidated equity holdings, position P&L tracking
│   ├── /inventory                # Vehicles (Model S/3/X/Y/Cybertruck), Powerwall, Solar Roof
│   ├── /inventory/[id]           # Technical specs, real-time stock quantity, balance-checked checkout
│   ├── /orders                   # Live order status tracking (Pending → Confirmed → Shipped → Delivered)
│   ├── /vip                      # 5-Tier membership matrix (Standard to Platinum, 0% to 25% discounts)
│   ├── /giveaways                # Promotional lotteries, ticket counts, real-time countdown clocks
│   ├── /account                  # Personal profile, KYC document uploader with base64 fallback
│   ├── /support                  # Support ticket creation, message threading, attachment uploads
│   └── /notifications            # Account activity alerts, payout notices, KYC approvals
│
└── 🛡️ 4. EXECUTIVE ADMIN COMMAND CENTER (Admin Gated)
    ├── /admin                    # High-level KPIs: Active investments, orders, KYC queue, ticket load
    ├── /admin/users              # User directory, KYC mandate toggle, user ↔ admin role switching
    ├── /admin/wallet             # Deposit/withdrawal queue, user balance overrides, crypto addresses (PIN guarded)
    ├── /admin/investments        # Investment fund creation, APR edits, status toggle (Active/Archived)
    ├── /admin/stocks             # Stock ticker manager, live price updates, custom icon URL input
    ├── /admin/inventory          # Product store management, pricing, stock levels, image CDN URLs
    ├── /admin/orders             # Order pipeline status updater (Pending → Delivered), shipment tracking
    ├── /admin/kyc                # Document review modal, 1-click approve/reject syncing profile status
    ├── /admin/vip                # VIP tier creator/editor (pricing, discount %, custom bullet benefits)
    ├── /admin/giveaways          # Giveaway publisher, participant viewer, automated random winner picker
    ├── /admin/emails             # Outbound Resend email center (support@teslacapitals.app) with templates
    ├── /admin/support            # Support ticket desk, reply composer, ticket resolution
    └── /admin/settings           # System status monitor, connection health, admin audit trail
```

---

## 🌟 Core System Features

### 1. 💳 Digital Treasury & Multi-Asset Wallet
* **Available Balance Engine**: Users fund investments, stocks, memberships, and inventory directly from their liquid cash balance. All balances are verified before database commits.
* **Crypto Deposit Requests**: Users choose an asset (Bitcoin, Ethereum, USDT-TRC20, Solana), copy the admin-specified address, and submit their transaction hash and payment screenshot.
* **Withdrawal Requests**: Secure payouts with destination address validation and admin review queues.
* **Instant Asset Swap**: Converter simulation between USD, BTC, ETH, and USDT.
* **Transaction Rollback Protection**: If an order or investment insertion fails, deducted wallet balances are immediately restored with full transaction journaling.

### 2. 🛡️ Admin Security PIN for Crypto Addresses
* Public deposit addresses (BTC, ETH, USDT, SOL) can be updated directly from `/admin/wallet`.
* To prevent unauthorized tampering, modifying any deposit address requires entering the **4-digit Admin Security PIN** (`8888` by default or configured via `NEXT_PUBLIC_ADMIN_PIN`).

### 3. 👑 5-Tier VIP Membership Hierarchy
Dynamic tiers configured in PostgreSQL offering platform-wide investment and store discounts:
| Tier | Monthly Fee | Deal Discount | Key Platform Perks |
| :--- | :---: | :---: | :--- |
| **Standard** | $0 / mo | 0% | Public markets access, basic portfolio tracking |
| **Bronze** | $122 / mo | 5% | Priority trade execution, monthly market digest |
| **Silver** | $499 / mo | 10% | Direct analyst chat, early giveaway lottery entries |
| **Gold** | $1,499 / mo | 18% | Exclusive private deal flow, dedicated wealth manager |
| **Platinum** | $5,000 / mo | 25% | 0% trading fee surcharge, annual executive retreat invitation, 24/7 Apex support |

### 4. 📑 Resilient Identity Verification (KYC)
* Multi-document submission: Government ID, International Passport, and Proof of Address.
* Dual Storage Pipeline: Directly uploads to Supabase Storage bucket `kyc-documents` with an automatic, resilient Base64 image fallback for uninterrupted submissions.
* Admin Review Modal: Interactive previewer in `/admin/kyc` allowing 1-click approval or rejection with automatic profile status synchronization.
* Conditional Gating: When `is_kyc_mandated` is enabled by an admin, unverified users are directed to complete verification before initiating financial transactions.

### 5. 📬 Resend Email Support Center (`@teslacapitals.app`)
* In-app admin email client (`/admin/emails`) connected to Resend's REST API.
* Pre-built corporate templates: **Welcome Member**, **Deposit Received & Credited**, and **KYC Verification Notice**.
* Outbound message audit log tracking recipient, subject, dispatch status, and timestamp.

### 6. 🎨 Luxury Minimalist Aesthetics & Micro-Interactivity
* **Inter Typography & Sharp Borders**: Minimalist Tesla-inspired design language utilizing deep blacks (`#090a0f`), dark charcoal cards (`#121520`), and Tesla Red accents (`#e82127`).
* **Light / Dark / System Theme Toggle**: Custom ThemeProvider preventing layout flash (FOUC).
* **Smartsupp Live Support**: Embedded official live chat widget (`key: c05be36e24ee807115b86998797a8d2b55e08c7a`).
* **Google Translate Hub**: Seamless multi-language switcher supporting **10 languages** (English, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Russian, Korean).
* **Animated Elements**: Marquee stock ticker with hover-pause, dynamic stats counters via `IntersectionObserver`, and global toast notifications.

---

## 🗄️ Database Architecture (PostgreSQL)

The platform is powered by **18 normalized PostgreSQL tables** in Supabase, guarded by Row-Level Security:

```
┌──────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│   profiles   │──────<│   user_investments   │>──────│     investments      │
└──────────────┘       └──────────────────────┘       └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐       ┌──────────────────────┐
       │               │  portfolio_holdings  │>──────│        stocks        │
       │               └──────────────────────┘       └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐       ┌──────────────────────┐
       │               │        orders        │>──────│       products       │
       │               └──────────────────────┘       └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐       ┌──────────────────────┐
       │               │      user_vips       │>──────│      vip_tiers       │
       │               └──────────────────────┘       └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐       ┌──────────────────────┐
       │               │   giveaway_entries   │>──────│      giveaways       │
       │               └──────────────────────┘       └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │     transactions     │ (Financial Ledger)
       │               └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │   deposit_requests   │ (Crypto Deposits)
       │               └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │ withdrawal_requests  │ (Payouts)
       │               └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │    kyc_documents     │ (Identity Files)
       │               └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │   support_tickets    │───< ticket_messages
       │               └──────────────────────┘
       │
       └──────────────<┌──────────────────────┐
                       │    notifications     │
                       └──────────────────────┘
```

### Storage Buckets
* `kyc-documents`: Identity verification documents & government IDs.
* `product-images`: Vehicle, energy, and accessory catalog media.
* `avatars`: User account profile photographs.
* `giveaway-images`: High-resolution lottery promotional banners.
* `support-attachments`: Technical support message files.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20+ or v24+
* **Package Manager**: `pnpm` (recommended) or `npm`
* **Supabase**: An active Supabase project

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/omjvibe/tesla-capitals.git
cd tesla-capitals

# Install packages
pnpm install
```

### 2. Environment Variables Configuration
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Resend Email Configuration (Optional / Production)
RESEND_API_KEY="re_your_resend_api_key"

# Admin Security PIN (Optional, defaults to 8888)
NEXT_PUBLIC_ADMIN_PIN="8888"
```

### 3. Execute Supabase Database Migrations
Run the SQL migration files in order inside your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

1. `supabase/migrations/001_foundation.sql` &mdash; *18-table relational schema*
2. `supabase/migrations/002_rls.sql` &mdash; *Row-Level Security policies & is_admin() function*
3. `supabase/migrations/003_triggers.sql` &mdash; *Auto-profile creation on auth signup*
4. `supabase/migrations/004_storage.sql` &mdash; *Initial storage buckets & policies*
5. `supabase/migrations/005_expansion.sql` &mdash; *Wallet balance columns, crypto tables, email logs*
6. `supabase/migrations/006_fixes_and_storage.sql` &mdash; *VIP discount columns, public KYC bucket, 5 VIP tiers*
7. `supabase/seed.sql` &mdash; *Initial catalog for stocks, funds, and vehicles*

### 4. Seed First Admin Account
Execute this snippet in the Supabase SQL Editor to grant administrator privileges to your primary account:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 5. Launch Local Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Production Compilation
```bash
pnpm build
```
*Validates 100% of all 41 routes with zero TypeScript or prerender errors.*

---

## 📧 Anti-Spam Supabase Auth Email Templates

Custom-tailored, minimal HTML email templates styled with Tesla Capitals' sharp dark branding are located in `supabase/templates/`:

* [`confirm_signup.html`](supabase/templates/confirm_signup.html) &mdash; New user account verification
* [`reset_password.html`](supabase/templates/reset_password.html) &mdash; Password reset token & button
* [`magic_link.html`](supabase/templates/magic_link.html) &mdash; One-click passwordless sign-in
* [`change_email.html`](supabase/templates/change_email.html) &mdash; Email address modification confirmation
* [`invite_user.html`](supabase/templates/invite_user.html) &mdash; Administrator user invite

*Engineered with a high text-to-HTML ratio and zero external image bloat to guarantee 100% inbox delivery and bypass spam filters.*

---

## 🔒 Security & Compliance

* **Row-Level Security (RLS)**: Enforced on all tables. Users cannot read or manipulate data outside their own `user_id`.
* **Server-Side Role Guarding**: Middleware intercepts protected routes. All `/admin/*` endpoints strictly require a verified `role = 'admin'` record.
* **Admin Security PIN**: Modifying public payment addresses requires double-verification via security PIN.
* **Strict Balance Checks**: Prevents overdrawing by performing atomic database validation prior to order or investment creation.

---

<div align="center">

Made with pride for **Tesla Capitals** &bull; Accelerating the Future of Capital

</div>
