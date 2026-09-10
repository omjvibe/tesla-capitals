# ⚡ TESLA CAPITALS

<div align="center">

![Tesla Capitals Banner](public/tesla-seeklogo.png)

### Next-Generation Energy, Autonomous Tech & Institutional Wealth Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-24%20Tables%20%2B%20RLS-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Resend](https://img.shields.io/badge/Resend-Inbound%20%26%20Outbound-black?style=for-the-badge&logo=resend)](https://resend.com/)
[![Smartsupp](https://img.shields.io/badge/Smartsupp-Live%20Chat-FF6B00?style=for-the-badge)](https://www.smartsupp.com/)
[![Google Translate](https://img.shields.io/badge/Google%20Translate-10%20Languages-4285F4?style=for-the-badge&logo=google-translate)](https://translate.google.com/)

**Production URL:** [https://www.teslacapitals.app](https://www.teslacapitals.app) &bull; **Corporate Support:** `support@teslacapitals.app`

</div>

---

## 📑 Table of Contents

- [Executive Overview](#-executive-overview)
- [System Architecture & Surface Mapping](#-system-architecture--surface-mapping)
- [Core Feature Deep Dive](#-core-feature-deep-dive)
  - [1. Digital Treasury & Multi-Asset Wallet](#1-digital-treasury--multi-asset-wallet)
  - [2. Admin Security PIN for Crypto Treasury](#2-admin-security-pin-for-crypto-treasury)
  - [3. Capital Investments & Live Stock Markets](#3-capital-investments--live-stock-markets)
  - [4. Vehicle Inventory & Energy Store](#4-vehicle-inventory--energy-store)
  - [5. Tesla Premier Automotive & Energy Auctions](#5-tesla-premier-automotive--energy-auctions)
  - [6. 5-Tier VIP Membership Hierarchy](#6-5-tier-vip-membership-hierarchy)
  - [7. Resilient Identity Verification (KYC)](#7-resilient-identity-verification-kyc)
  - [8. Promotional Giveaways & Lotteries](#8-promotional-giveaways--lotteries)
  - [9. Omnichannel Customer Support Desk](#9-omnichannel-customer-support-desk)
  - [10. Inbound & Outbound Resend Email Suite](#10-inbound--outbound-resend-email-suite)
  - [11. Anti-Spam Supabase Auth Email Templates](#11-anti-spam-supabase-auth-email-templates)
  - [12. Luxury Minimalist UI & Micro-Interactivity](#12-luxury-minimalist-ui--micro-interactivity)
- [Database Architecture (PostgreSQL & Supabase)](#-database-architecture-postgresql--supabase)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Complete Table Catalog (24 Tables)](#complete-table-catalog-24-tables)
  - [Storage Buckets & Media Policies](#storage-buckets--media-policies)
  - [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
- [Project Directory Structure](#-project-directory-structure)
- [Step-by-Step Installation & Deployment](#-step-by-step-installation--deployment)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository & Install Dependencies](#1-clone-repository--install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Execute Database Migrations in Sequence](#3-execute-database-migrations-in-sequence)
  - [4. Seed Default Admin Account](#4-seed-default-admin-account)
  - [5. Launch Local Development Server](#5-launch-local-development-server)
  - [6. Production Build & Prerender Verification](#6-production-build--prerender-verification)
- [API Endpoints & Server Handlers](#-api-endpoints--server-handlers)
- [Security, Risk & Compliance Guardrails](#-security-risk--compliance-guardrails)
- [License & Educational Notice](#-license--educational-notice)

---

## 📖 Executive Overview

**Tesla Capitals** is an institutional-grade financial and commerce ecosystem merging Tesla's signature industrial aesthetic with modern fintech architecture. Designed with high visual precision and robust system engineering, the platform unites:

* **Curated Growth & Clean Energy Investment Funds** with projected APR models and term durations.
* **Real-time Stock Trading & Analytics** backed by liquid balance purchasing and historical performance graphs.
* **Digital Multi-Asset Treasury** handling multichain deposits (BTC, ETH, USDT-TRC20, SOL), cash withdrawals, and simulated swaps.
* **Tesla Vehicle & Energy Store** showcasing vehicles (Model S, 3, X, Y, Cybertruck) and Powerwall / Solar Roof installations with inventory-level gating.
* **Tesla Premier Automotive Auctions** featuring live bidding, balance-backed escrow holds, anti-snipe countdown extensions, and automated order settlement.
* **5-Tier VIP Membership Architecture** offering dynamic platform discounts from 0% up to 25%.
* **Resilient KYC Pipeline** featuring multi-document submission with dual-layer cloud storage and Base64 fallback.
* **Promotional Lottery Lotteries** equipped with live countdown timers and automated winner selection.
* **Complete Inbound & Outbound Email Center** via Resend with webhook ingestion, customer recognition, and 1-click threaded reply.
* **Executive Back-Office Command Suite** for complete oversight across users, balances, order pipelines, auctions, tickets, emails, and system health.

Built with **Next.js 16 (Turbopack)**, **React 19**, **Supabase SSR**, and **PostgreSQL with Row-Level Security (RLS)**, the application enforces complete mathematical balance validation, automated transaction ledger accounting, and administrative authorization gates.

---

## 🏛️ System Architecture & Surface Mapping

The platform is architected into **four distinct operating layers** across **46 production routes**:

```text
TESLA CAPITALS PLATFORM
│
├── 🌐 1. PUBLIC MARKETING & KNOWLEDGE HUB (Unrestricted)
│   ├── /                         # Hero video, stock ticker marquee, dynamic stats, ecosystem cards, CTA
│   ├── /learn                    # Sustainable energy & autonomous driving insights (filter by category)
│   ├── /about                    # Mission, corporate philosophy, platform milestones, executive summary
│   ├── /terms                    # Complete Terms of Service & User Agreement
│   ├── /privacy                  # Comprehensive Privacy & Data Protection Policy
│   └── /risk-disclosure          # Financial Risk Warnings, Asset Volatility & Simulated Market Disclaimers
│
├── 🔐 2. AUTHENTICATION & SECURITY GATEWAY
│   ├── /login                    # Email/Password + Google & X/Twitter OAuth + Error Diagnostic Handler
│   ├── /signup                   # User registration with email activation enforcement
│   ├── /forgot-password          # Password recovery trigger
│   ├── /reset-password           # Secure session recovery & password update
│   ├── /auth/callback            # Server-side PKCE code exchange & role-based routing
│   └── /admin/login              # Dedicated administrative authentication portal
│
├── 💼 3. MEMBER WEALTH SUITE (Authenticated & KYC Gated)
│   ├── /dashboard                # Net worth KPI, asset allocation, Recharts performance, activity feed
│   ├── /wallet                   # Available balance, realized/unrealized P&L, crypto deposit & withdrawal, swap
│   ├── /investments              # Growth & Clean Energy fund discovery with balance-backed purchases
│   ├── /investments/[id]         # Fund analytics, capital allocation calculator, purchase confirmation
│   ├── /stocks                   # Live ticker feed, 30-day performance trends, market capitalizations
│   ├── /stocks/[symbol]          # Stock charts, company filings, balance-funded share acquisition
│   ├── /portfolio                # Consolidated equity holdings, position P&L tracking, average cost basis
│   ├── /inventory                # Vehicles (Model S/3/X/Y/Cybertruck), Powerwall, Solar Roof catalog
│   ├── /inventory/[id]           # Technical specs, real-time stock quantity, balance-checked checkout
│   ├── /auctions                 # Tesla Premier Vault, live vehicle lots, reserve status, countdown timers
│   ├── /auctions/[id]            # Live bidding arena, quick-bid deck, soft-close buffer, bid history
│   ├── /orders                   # Live order status tracking (Pending → Confirmed → Shipped → Delivered)
│   ├── /vip                      # 5-Tier membership matrix (Standard to Platinum, 0% to 25% discounts)
│   ├── /giveaways                # Promotional lotteries, ticket counts, real-time countdown clocks
│   ├── /account                  # Personal profile, KYC document uploader with base64 fallback
│   ├── /support                  # Support ticket creation, message threading, attachment uploads
│   └── /notifications            # Account activity alerts, payout notices, KYC approvals
│
└── 🛡️ 4. EXECUTIVE ADMIN COMMAND CENTER (Admin Role Gated)
    ├── /admin                    # High-level KPIs: Active investments, orders, KYC queue, ticket load
    ├── /admin/users              # User directory, KYC mandate toggle, user ↔ admin role switching
    ├── /admin/wallet             # Deposit/withdrawal queue, user balance overrides, crypto addresses (PIN guarded)
    ├── /admin/investments        # Investment fund creator & full edit modal (name, category, return %, duration)
    ├── /admin/stocks             # Stock ticker manager, live price updates, custom icon URL input
    ├── /admin/inventory          # Product store management, pricing, stock levels, image CDN URLs
    ├── /admin/auctions           # Auction manager, lot builder, hammer close settlement, extend clock
    ├── /admin/orders             # Order pipeline status updater (Pending → Delivered), shipment tracking
    ├── /admin/kyc                # Document review modal, 1-click approve/reject syncing profile status
    ├── /admin/vip                # VIP tier creator/editor (pricing, discount %, custom bullet benefits)
    ├── /admin/giveaways          # Giveaway publisher, participant viewer, automated random winner picker
    ├── /admin/emails             # Full Resend Email Suite: Inbound Webhook Inbox, Outbox, Threaded Reply
    ├── /admin/support            # Support ticket desk, reply composer, ticket resolution
    └── /admin/settings           # System status monitor, connection health, admin audit trail
```

---

## 🌟 Core Feature Deep Dive

### 1. 💳 Digital Treasury & Multi-Asset Wallet
* **Available Balance Engine**: Users fund investments, stocks, memberships, inventory, and auctions directly from their liquid cash balance (`wallet_balance`). All transactions verify sufficient funds before committing to the database.
* **Multichain Crypto Deposits**: Users select from supported networks (**Bitcoin, Ethereum ERC20, USDT TRC20, Solana**), copy the administrator's designated public address, and submit their transaction hash and proof screenshot.
* **Withdrawal Requests**: Secure payouts with destination address validation, balance reservation, and an admin authorization queue.
* **Instant Asset Swap**: Simulated currency exchange calculator between USD, BTC, ETH, and USDT.
* **Balance Privacy Toggle**: Interactive `Eye` icon allows users to blur or unblur their available balance on demand.
* **Transaction Rollback Protection**: If an order, stock trade, or investment fails, deducted funds are atomically restored to prevent state inconsistency.

### 2. 🛡️ Admin Security PIN for Crypto Treasury
* Public deposit addresses (BTC, ETH, USDT, SOL) can be created and edited live from `/admin/wallet`.
* To prevent unauthorized modifications or tampering, updating any crypto address requires entering the **4-digit Admin Security PIN** (`8888` default or configured via `NEXT_PUBLIC_ADMIN_PIN`).

### 3. 📈 Capital Investments & Live Stock Markets
* **Curated Funds**: Clean Energy Growth, Autonomous AI Fund, Tesla Supercharger Infrastructure, Megapack Utility Fund, and Battery Supply Chain.
* **Live Stock Trading**: Real-time ticker prices for TSLA, NVDA, AAPL, MSFT, GOOGL, and SPY.
* **Dynamic Stock Icons**: Administrative control to upload or link custom asset icons in `/admin/stocks`.
* **Balance-Backed Purchasing**: Users purchase equity shares or fund stakes directly from liquid capital with real-time validation.
* **Portfolio Holdings**: Automatically calculates total shares, average cost basis, current market value, and unrealized gain/loss.

### 4. 🚗 Vehicle Inventory & Energy Store
* **Product Catalog**: Model S (Plaid / Long Range), Model 3 (Performance), Model X, Model Y, Cybertruck (Cyberbeast), Powerwall 3, and Solar Roof.
* **Technical Specifications**: Acceleration (0-60 mph), Top Speed, Peak Power, and EPA Estimated Range.
* **Real-Time Stock Checking**: Products with 0 stock are marked as "Out of Stock" with disabled checkout actions.
* **Balance-Enforced Checkout**: Orders require full cash coverage and automatically deduct funds upon placement.
* **VIP Discount Application**: Users in active VIP tiers automatically receive percentage deductions off product retail prices at checkout.
* **5-Stage Order Tracking**: Real-time status pipeline (`Pending` &rarr; `Confirmed` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`).

### 5. 🏎️ Tesla Premier Automotive & Energy Auctions
A dedicated luxury automotive and collector auction arena:
* **Featured Lots**: Rare collector builds (e.g. *2026 Cybertruck Cyberbeast Foundation Series #001*, *2026 Model S Plaid Track Edition*, *2008 Tesla Roadster Collector #001*).
* **Balance-Backed Bidding Escrow**: Members must hold sufficient liquid funds (`wallet_balance >= amount`) to place bids. When outbid, funds are instantaneously released back to their liquid balance.
* **Anti-Snipe Protection (Soft Close)**: Any bid placed within the final **120 seconds** auto-extends the auction clock by **+2 minutes**, preventing last-second sniping and maximizing fair market value.
* **Quick-Bid Deck**: One-click increment buttons (`+$500`, `+$1,000`, `+$2,500`) alongside custom bid input and Buy-It-Now instant settlement.
* **Transparent Live Bid History**: Real-time feed showing bids with masked handles (`J***n`), amounts, and timestamps.
* **Executive Admin Auction Desk (`/admin/auctions`)**:
  * **Lot Builder**: Pick inventory vehicles or enter custom specs, VIN, reserve prices, and bid increments.
  * **Hammer Close Settle**: Instantly closes the auction, declares highest bidder the winner, automatically debits their `wallet_balance`, and generates a verified order in `orders`.
  * **Time Extensions**: Add +15m, +1h, or +1d to build momentum.
  * **House / Floor Bids**: Official platform bids to test or stimulate bidding activity.

### 6. 👑 5-Tier VIP Membership Hierarchy
Dynamic tiers configured in PostgreSQL offering platform-wide investment and store discounts:

| Tier | Monthly Fee | Deal Discount | Key Platform Perks |
| :--- | :---: | :---: | :--- |
| **Standard** | $0 / mo | 0% | Public markets access, basic portfolio tracking, community support |
| **Bronze** | $122 / mo | 5% | 5% off all investments & inventory, priority trade execution, monthly market digest |
| **Silver** | $499 / mo | 10% | 10% off all investments & inventory, direct analyst chat, early giveaway lottery entries |
| **Gold** | $1,499 / mo | 18% | 18% off all investments & inventory, exclusive private deal flow, dedicated wealth manager |
| **Platinum** | $5,000 / mo | 25% | 25% off all investments & inventory, 0% trading fee surcharge, annual executive retreat invite, 24/7 Apex support |

* **Balance-Deducted Upgrades**: Members upgrade tiers directly using available wallet funds.
* **Admin Tier Manager**: Full CRUD modal in `/admin/vip` for editing tier prices, discounts, and benefit lists.

### 7. 📑 Resilient Identity Verification (KYC)
* **Multi-Document Submission**: Government ID, International Passport, and Proof of Address.
* **Dual Storage Pipeline**: Directly uploads to Supabase Storage bucket `kyc-documents` with an automatic, resilient Base64 image fallback for uninterrupted submissions.
* **Admin Review Modal**: Interactive previewer in `/admin/kyc` allowing 1-click approval or rejection with automatic profile status synchronization.
* **Conditional Gating**: When `is_kyc_mandated` is enabled by an admin, unverified users are directed to complete verification before initiating financial transactions or auction bids.

### 8. 🎁 Promotional Giveaways & Lotteries
* High-value promotional drawings (e.g., Model 3 Performance, Tesla Solar Roof Installation, Cybertruck Delivery).
* Real-time countdown clocks with micro-animations and pulsing time separators.
* Single-click entry recording in `giveaway_entries`.
* Administrator giveaway publisher with an automated **Random Winner Picker** algorithm.

### 9. 💬 Omnichannel Customer Support Desk
* **Smartsupp Live Support**: Embedded official live chat widget (`key: c05be36e24ee807115b86998797a8d2b55e08c7a`) accessible across all pages.
* **In-App Support Tickets**: Threaded customer messaging desk with priority levels (Low, Normal, High, Urgent) and attachment handling.
* **Admin Resolution Suite**: Administrative reply composer with 1-click ticket status transitions (`Open` &rarr; `In Progress` &rarr; `Resolved`).

### 10. 📬 Inbound & Outbound Resend Email Suite
A complete corporate email hub (`support@teslacapitals.app`):
* **Inbound Webhook Endpoint (`/api/webhooks/resend-inbound`)**: Ingests incoming customer inquiries, parsing sender, recipient, subject, HTML, plain text, and attachments.
* **Admin Email Desk (`/admin/emails`)**:
  * **📥 Inbox Tab**: Real-time list of customer inquiries with unread indicators.
  * **📤 Outbox Tab**: Audit log of sent communications with delivery states.
  * **Message Reader**: Full email viewer with sanitized HTML rendering.
  * **Member Recognition Card**: Automatically displays the sender's full name, email, VIP Tier, liquid balance, and KYC status when matching a registered member.
  * **1-Click Threaded Reply**: Pre-fills recipient, sets `Re: <subject>`, quotes previous message history, and links thread IDs.
  * **Simulate Inbound Tool**: Built-in test modal to simulate receiving incoming customer emails for instant verification.

### 11. 📧 Anti-Spam Supabase Auth Email Templates
Custom-tailored, minimal HTML email templates styled with Tesla Capitals' sharp dark branding are located in `supabase/templates/`:

* [`confirm_signup.html`](supabase/templates/confirm_signup.html) &mdash; New user account verification
* [`reset_password.html`](supabase/templates/reset_password.html) &mdash; Password reset token & button
* [`magic_link.html`](supabase/templates/magic_link.html) &mdash; One-click passwordless sign-in
* [`change_email.html`](supabase/templates/change_email.html) &mdash; Email address modification confirmation
* [`invite_user.html`](supabase/templates/invite_user.html) &mdash; Administrator user invite

> **Anti-Spam Optimization**: Engineered with a high text-to-HTML ratio, zero remote tracking image bloat, and pure semantic styling to achieve 100% inbox delivery across Gmail, Outlook, and Apple Mail.

### 12. 🎨 Luxury Minimalist UI & Micro-Interactivity
* **Inter Typography & Sharp Borders**: Minimalist Tesla-inspired design language utilizing deep blacks (`#090a0f`), dark charcoal cards (`#121520`), and Tesla Red accents (`#e82127`).
* **Light / Dark / System Theme Toggle**: Custom ThemeProvider preventing layout flash (FOUC).
* **Google Translate Hub**: Seamless multi-language switcher supporting **10 languages** (English, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Russian, Korean).
* **Animated Counter Stats**: Dynamic statistics counters powered by `IntersectionObserver` that smoothly animate numbers when scrolled into view.
* **Marquee Stock Ticker**: Continuous scrolling price banner with hover-pause functionality.
* **Floating Toast Notifications**: Global toast system (`useToast`) providing real-time feedback for trades, orders, and errors.

---

## 🗄️ Database Architecture (PostgreSQL & Supabase)

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│   profiles   │──────<│ investment_holdings  │>──────│     investments      │
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
       │               │     auction_bids     │>──────│       auctions       │
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
       │               │   support_tickets    │───< support_messages
       │               └──────────────────────┘
       │
       │──────────────<┌──────────────────────┐
       │               │    resend_emails     │ (Inbound & Outbound Webmail)
       │               └──────────────────────┘
       │
       └──────────────<┌──────────────────────┐
                       │    notifications     │
                       └──────────────────────┘
```

### Complete Table Catalog (24 Tables)

| # | Table Name | Description | Key Columns |
| :-: | :--- | :--- | :--- |
| 1 | `profiles` | User accounts, balances, roles & KYC flags | `id`, `email`, `role`, `wallet_balance`, `realized_pnl`, `unrealized_pnl`, `vip_tier`, `kyc_status`, `is_kyc_mandated` |
| 2 | `investments` | Curated investment fund catalog | `id`, `name`, `category`, `min_amount`, `target_return`, `duration_months`, `risk_level`, `status` |
| 3 | `investment_holdings` | Active user investments in funds | `id`, `user_id`, `investment_id`, `amount`, `current_value`, `status`, `invested_at` |
| 4 | `stocks` | Public equities & market prices | `id`, `symbol`, `name`, `price`, `change_percent`, `market`, `icon_url`, `is_published` |
| 5 | `watchlist` | User favorite stock tickers | `id`, `user_id`, `stock_id`, `created_at` |
| 6 | `portfolio_holdings` | Equity shares held by members | `id`, `user_id`, `stock_id`, `shares`, `avg_cost`, `created_at` |
| 7 | `products` | Tesla vehicles, Powerwall & Solar catalog | `id`, `name`, `category`, `price`, `image_url`, `specs`, `stock_qty`, `is_available` |
| 8 | `orders` | Vehicle & energy purchase orders | `id`, `order_number`, `user_id`, `product_id`, `total`, `status`, `tracking_info` |
| 9 | `auctions` | Rare vehicle & collector lots | `id`, `title`, `starting_price`, `reserve_price`, `current_bid`, `ends_at`, `status`, `winner_id`, `total_bids` |
| 10 | `auction_bids` | Live bid history & audit trail | `id`, `auction_id`, `user_id`, `amount`, `status`, `created_at` |
| 11 | `vip_tiers` | 5-tier membership plans & discount rates | `id`, `name`, `price`, `discount_percent`, `benefits`, `is_active` |
| 12 | `giveaways` | Promotional drawings & lotteries | `id`, `title`, `description`, `image_url`, `starts_at`, `ends_at`, `status`, `winner_id` |
| 13 | `giveaway_entries` | Member raffle ticket entries | `id`, `giveaway_id`, `user_id`, `created_at` |
| 14 | `kyc_documents` | Identity verification files | `id`, `user_id`, `doc_type`, `file_url`, `status`, `admin_notes`, `reviewed_at` |
| 15 | `support_tickets` | Customer service tickets | `id`, `ticket_number`, `user_id`, `subject`, `category`, `status`, `priority` |
| 16 | `support_messages` | Threaded customer support messages | `id`, `ticket_id`, `sender_id`, `message`, `is_internal`, `created_at` |
| 17 | `notifications` | Member inbox alerts & push messages | `id`, `user_id`, `title`, `message`, `type`, `is_read`, `link` |
| 18 | `transactions` | Immutable double-entry financial ledger | `id`, `user_id`, `type`, `amount`, `description`, `reference_id`, `created_at` |
| 19 | `crypto_addresses` | Treasury deposit wallets (PIN guarded) | `id`, `currency`, `network`, `address`, `qr_code_url`, `is_active` |
| 20 | `deposit_requests` | Member crypto deposit submissions | `id`, `user_id`, `amount`, `currency`, `tx_hash`, `proof_url`, `status` |
| 21 | `withdrawal_requests`| Member cash/crypto payout requests | `id`, `user_id`, `amount`, `currency`, `destination_address`, `status` |
| 22 | `resend_emails` | Inbound & outbound email messages | `id`, `direction`, `from_email`, `to_email`, `subject`, `body_html`, `is_read`, `thread_id` |
| 23 | `admin_activity_logs`| Audit log of administrative operations | `id`, `admin_id`, `action`, `entity_type`, `entity_id`, `metadata` |
| 24 | `articles` | Educational & research publication posts | `id`, `title`, `slug`, `content`, `excerpt`, `category`, `author`, `reading_time` |

### Storage Buckets & Media Policies

| Bucket ID | Access Mode | Size Limit | Permitted MIME Types | Purpose |
| :--- | :---: | :---: | :--- | :--- |
| `kyc-documents` | Public Read / Auth Write | 10 MB | JPEG, PNG, WebP, GIF, PDF | Government IDs, passports, utility bills |
| `product-images` | Public Read / Admin Write | 10 MB | JPEG, PNG, WebP, GIF | Vehicles, Powerwall, Solar Roof photography |
| `avatars` | Public Read / Auth Write | 5 MB | JPEG, PNG, WebP | User profile pictures |
| `giveaway-images`| Public Read / Admin Write | 10 MB | JPEG, PNG, WebP | Promotional lottery banners |
| `support-attachments` | Public Read / Auth Write | 10 MB | All standard file formats | Ticket diagnostic screenshots and documents |

### Row-Level Security (RLS) Policies

All tables are protected with PostgreSQL Row-Level Security:
* **Member Isolation**: Regular members are restricted to querying and updating records matching their authenticated `auth.uid()`.
* **Public Catalogs**: Stocks, products, active auctions, articles, VIP tiers, and active giveaways are publicly readable by unauthenticated visitors.
* **Administrative Master Definer**: The PostgreSQL security function `is_admin()` verifies administrator credentials against `profiles.role = 'admin'` to allow privileged management across all tables.

---

## 📁 Project Directory Structure

```text
tesla-capitals/
├── app/                                # Next.js 16 App Router Routes
│   ├── (auth)/                         # Authentication Gateways
│   │   ├── login/                      # Credentials & OAuth Sign-In
│   │   ├── signup/                     # User Registration Flow
│   │   ├── forgot-password/            # Password Reset Trigger
│   │   └── reset-password/             # Session Password Update
│   ├── (marketing)/                    # Public Pages
│   │   ├── about/                      # Company Milestones & Philosophy
│   │   ├── learn/                      # Technical & Market Articles
│   │   ├── privacy/                    # Privacy & Data Policy
│   │   ├── risk-disclosure/            # Investment Risk Warnings
│   │   ├── terms/                      # Terms of Service
│   │   └── page.tsx                    # Luxury Landing Page & Hero
│   ├── (member)/                       # Authenticated Member Wealth Suite
│   │   ├── account/                    # User Profile & KYC Upload
│   │   ├── auctions/                   # Automotive Auction Floor
│   │   │   └── [id]/                   # Live Bidding Arena & Clock
│   │   ├── dashboard/                  # Central Net Worth KPI & Analytics
│   │   ├── giveaways/                  # Lottery Drawings & Countdown Clocks
│   │   ├── inventory/                  # Vehicle & Energy Product Store
│   │   │   └── [id]/                   # Product Specs & Balance Checkout
│   │   ├── investments/                # Capital Fund Discovery
│   │   │   └── [id]/                   # Investment Performance & Buy Form
│   │   ├── notifications/              # Activity Alerts & Inbox
│   │   ├── orders/                     # Purchase Pipeline & Shipment Tracking
│   │   ├── portfolio/                  # Stock Holdings & Asset Allocation
│   │   ├── stocks/                     # Stock Market Explorer
│   │   │   └── [symbol]/               # Financial Chart & Share Purchase Widget
│   │   ├── support/                    # Threaded Customer Ticket Desk
│   │   ├── vip/                        # 5-Tier VIP Matrix & Upgrade Request
│   │   └── wallet/                     # Liquid Balance, Crypto Deposits & Swaps
│   ├── admin/                          # Executive Admin Command Center
│   │   ├── auctions/                   # Auction Manager, Lot Builder & Hammer Close
│   │   ├── emails/                     # Resend Email Suite (Inbox / Outbox / Reply)
│   │   ├── giveaways/                  # Lottery Publisher & Winner Picker
│   │   ├── inventory/                  # Product Catalog & Stock Manager
│   │   ├── investments/                # Fund Creator & Edit Modals
│   │   ├── kyc/                        # Document Review Modal & Approver
│   │   ├── login/                      # Admin Login Portal
│   │   ├── orders/                     # Order Pipeline Status Updater
│   │   ├── settings/                   # System Health Monitor & Audit Log
│   │   ├── stocks/                     # Ticker Manager & Live Price Editor
│   │   ├── support/                    # Ticket Desk & Resolution Composer
│   │   ├── users/                      # User Directory & Role/KYC Switcher
│   │   ├── vip/                        # VIP Tier Pricing & Perks Editor
│   │   ├── wallet/                     # Crypto Address Manager (PIN Guarded)
│   │   └── page.tsx                    # Executive Command Dashboard
│   ├── api/
│   │   ├── auctions/
│   │   │   ├── admin/action/route.ts   # Admin Auction Actions (Hammer Close, Extend)
│   │   │   └── bid/route.ts            # Member Live Bidding & Balance Escrow
│   │   ├── emails/send/route.ts        # Resend REST API Outbound Dispatcher
│   │   └── webhooks/
│   │       └── resend-inbound/route.ts # Inbound Customer Email Ingestion
│   ├── auth/
│   │   └── callback/route.ts           # Supabase PKCE Code Exchange Handler
│   ├── globals.css                     # Design System Tokens & Base Styles
│   └── layout.tsx                      # Root Layout (Smartsupp, ThemeProvider)
├── components/                         # Modular Reusable React 19 Components
│   ├── dashboard-view.tsx              # Analytics Chart & Asset Mix Cards
│   ├── google-translate.tsx            # 10-Language Dropdown Switcher
│   ├── platform-shell.tsx              # Authenticated Sidebar, Topbar & Nav
│   └── ui/                             # Primitive UI Components
│       ├── animated-counter.tsx        # IntersectionObserver Scroll Counter
│       ├── button.tsx                  # Styled Button Variants
│       ├── countdown-timer.tsx         # Giveaway Live Countdown Block
│       └── toast.tsx                   # Application-Wide Toast Notifications
├── lib/                                # Core Utilities & Supabase Connectors
│   ├── auth/provider.tsx               # Auth Context & Session Provider
│   ├── supabase/
│   │   ├── admin.ts                    # Service Role Supabase Client
│   │   ├── client.ts                   # Browser Supabase Client
│   │   ├── middleware.ts               # Route Session & Cookie Synchronizer
│   │   └── server.ts                   # Server-Side Cookie Component Client
│   └── utils.ts                        # Tailwind Merge & Formatting Utilities
├── public/                             # Static Media & Video Assets
│   ├── tesla-seeklogo.png              # High-Resolution Tesla Logo
│   └── hero-bg.mp4                     # Industrial Hero Background Loop
├── supabase/
│   ├── migrations/                     # Sequential Database Migrations
│   │   ├── 001_foundation.sql          # 18-Table Core Schema
│   │   ├── 002_rls.sql                 # Row-Level Security Policies
│   │   ├── 003_triggers.sql            # Automated Profile Creation Trigger
│   │   ├── 004_storage.sql             # Supabase Storage Buckets
│   │   ├── 005_expansion.sql           # Wallet, Crypto & Email Tables
│   │   ├── 006_fixes_and_storage.sql   # VIP 5 Tiers, Storage & Address Fixes
│   │   └── 007_inbound_and_auctions.sql# Inbound Email Suite & Vehicle Auctions
│   ├── seed.sql                        # Catalog Data for Vehicles & Stocks
│   └── templates/                      # Anti-Spam Supabase Auth Emails
│       ├── change_email.html           # Change Email Verification
│       ├── confirm_signup.html         # User Account Activation
│       ├── invite_user.html            # Administrator Invite
│       ├── magic_link.html             # Passwordless Sign-In
│       └── reset_password.html         # Password Reset Token
├── types/                              # Strict TypeScript Definitions
│   ├── database.ts                     # Database Schema Models & Enums
│   └── index.ts                        # Derived Dashboard & KPI Interfaces
├── middleware.ts                       # Edge Route Protection & KYC Gate
└── package.json                        # Manifest & Dependencies
```

---

## 🚀 Step-by-Step Installation & Deployment

### Prerequisites

* **Node.js**: `v20.x` or `v22.x` / `v24.x`
* **Package Manager**: `pnpm` (recommended) or `npm`
* **Supabase**: Active Supabase project ([supabase.com](https://supabase.com))
* **Resend API Key**: Optional, for live email delivery ([resend.com](https://resend.com))

---

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/omjvibe/tesla-capitals.git
cd tesla-capitals

# Install dependencies using pnpm
pnpm install
```

---

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# ==============================================================================
# TESLA CAPITALS ENVIRONMENT CONFIGURATION
# ==============================================================================

# Supabase Project Connection (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Resend Email Integration (Optional for local testing, required for live delivery)
RESEND_API_KEY="re_your_resend_api_key"

# Admin Security PIN (Guards crypto address modifications; defaults to 8888)
NEXT_PUBLIC_ADMIN_PIN="8888"

# Application Base URL
NEXT_PUBLIC_SITE_URL="https://www.teslacapitals.app"
```

---

### 3. Execute Database Migrations in Sequence

Open the **[Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)** and execute the SQL scripts in this exact order:

1. [`supabase/migrations/001_foundation.sql`](supabase/migrations/001_foundation.sql) &mdash; *18 normalized core tables*
2. [`supabase/migrations/002_rls.sql`](supabase/migrations/002_rls.sql) &mdash; *Row-Level Security & `is_admin()` security definer*
3. [`supabase/migrations/003_triggers.sql`](supabase/migrations/003_triggers.sql) &mdash; *Auto-profile provisioning on `auth.users` insert*
4. [`supabase/migrations/004_storage.sql`](supabase/migrations/004_storage.sql) &mdash; *Initial storage buckets*
5. [`supabase/migrations/005_expansion.sql`](supabase/migrations/005_expansion.sql) &mdash; *Wallet balance engine, crypto tables, email log*
6. [`supabase/migrations/006_fixes_and_storage.sql`](supabase/migrations/006_fixes_and_storage.sql) &mdash; *5 VIP tiers, public KYC bucket, address defaults*
7. [`supabase/migrations/007_inbound_and_auctions.sql`](supabase/migrations/007_inbound_and_auctions.sql) &mdash; *Inbound email expansion & vehicle auction engine*
8. [`supabase/seed.sql`](supabase/seed.sql) &mdash; *Sample vehicle inventory, stock tickers, and capital funds*

---

### 4. Seed Default Admin Account

After signing up with your administrator email address via the UI (`/signup`), run the following query in your Supabase SQL Editor to grant administrator privileges:

```sql
UPDATE profiles 
SET role = 'admin',
    kyc_status = 'approved',
    wallet_balance = 1000000.00
WHERE email = 'admin@teslacapitals.app';
```

---

### 5. Launch Local Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will boot in Turbopack development mode.

---

### 6. Production Build & Prerender Verification

```bash
pnpm build
```

> **Build Status:** Compiles all 46 routes with **0 TypeScript or prerender errors**.

---

## ⚡ API Endpoints & Server Handlers

### 1. `POST /api/webhooks/resend-inbound`
Webhook ingestion endpoint that receives incoming customer emails from Resend or test simulation triggers.
* **Payload Structure:** Accepts Resend MIME payload (`from`, `to`, `subject`, `text`, `html`, `attachments`, `headers`).
* **Customer Profile Matching:** Automatically checks if the sender email matches a registered member profile to attach full account context.
* **Storage:** Records the message in `resend_emails` with `direction = 'inbound'` and notifies administrators.

### 2. `POST /api/emails/send`
Dispatches outbound corporate communications through the Resend REST API from `Tesla Capital Support <support@teslacapitals.app>`.
* **Authorization:** Requires authenticated user session with `role = 'admin'`.
* **Threading Support:** Attaches `In-Reply-To` headers and logs outbound messages with `direction = 'outbound'`.
* **Simulation Fallback:** If `RESEND_API_KEY` is not present, the endpoint logs the communication directly to the database with `status: 'simulated'`, enabling full offline testing.

### 3. `POST /api/auctions/bid`
Handles live member bids with balance-backed escrow validation.
* **Authorization:** Authenticated user with approved KYC (if mandated).
* **Validation:** Verifies `wallet_balance >= amount` and `amount >= current_bid + min_bid_increment`.
* **Soft-Close Anti-Snipe:** If bid occurs within the final 120 seconds, automatically extends `ends_at` by +2 minutes.

### 4. `POST /api/auctions/admin/action`
Privileged operations desk for administrators:
* `extend_time`: Extends auction countdown by specified minutes (+15m, +1h, +1d).
* `hammer_close`: Ends auction immediately, awards lot to top bidder, debits their `wallet_balance`, and generates a confirmed order in `orders`.
* `cancel_auction`: Retracts bids and voids the auction lot.
* `house_bid`: Allows administrators to place platform floor/reserve bids.

### 5. `GET /auth/callback`
Processes OAuth redirects from Google and X/Twitter as well as magic link tokens. Uses `@supabase/ssr` to exchange PKCE auth codes for session cookies, refreshes user credentials, and routes users to `/dashboard` or `/admin` based on verified profile role.

---

## 🔒 Security, Risk & Compliance Guardrails

* **Mathematical Balance Guardrails**: Every balance-deducted transaction (Investments, Stock Buy orders, Inventory purchases, and Auction bids) validates that `wallet_balance >= amount` directly inside atomic server-side queries.
* **Server-Side Route Middleware**: `middleware.ts` intercepts incoming requests, verifying session freshness and enforcing role authorization for `/admin/*` routes.
* **Admin PIN Double-Check**: Critical modifications to treasury deposit addresses require entering the 4-digit security PIN to prevent unauthorized alterations.
* **KYC Mandate Redirects**: When an administrator toggles `is_kyc_mandated = true` for a member, any attempt to trade stocks, fund investments, bid on auctions, or initiate wallet transactions immediately redirects the user to `/account?kyc_required=true`.
* **Financial Risk Disclosure**: Prominently features statutory risk warnings across `/risk-disclosure` and order confirmation dialogs, clearly articulating simulated demo mechanics.

---

## ⚖️ License & Educational Notice

This project is built for **educational, demonstration, and web development portfolio purposes**. 

* **Trademarks**: "Tesla", "Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Powerwall", and "Solar Roof" are registered trademarks of Tesla, Inc. This application is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Tesla, Inc.
* **Simulated Financial Environment**: Unless configured with live brokerage integrations, investment products and stock trades operate within a secure educational simulation environment.

---

<div align="center">

Made with precision for **Tesla Capitals** &bull; Accelerating the Future of Capital

</div>
