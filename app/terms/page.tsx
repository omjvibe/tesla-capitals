import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Brand } from '@/components/platform-shell'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 md:px-16 lg:px-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <Brand />
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Legal Framework</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
            <p className="mt-2 text-xs text-muted-foreground">Effective Date: January 1, 2026 · Tesla Capital Platforms Inc.</p>
          </div>

          <section className="space-y-4 text-sm leading-7 text-muted-foreground">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Tesla Capital investment platform, mobile services, or associated financial engines, you agree to be bound by these Terms of Service and all applicable federal and international securities regulations.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. Financial & Investment Eligibility</h2>
            <p>
              Participation in private equity funds, technological asset inventory, and equity portfolios is restricted to accredited or verified investors who have satisfied obligatory Know Your Customer (KYC) and Anti-Money Laundering (AML) standards.
            </p>

            <h2 className="text-xl font-bold text-foreground">3. Digital Wallets & Custody</h2>
            <p>
              All deposits made via cryptocurrency or wire transfer are held in segregated, audited custodial vaults. Balance debits and credits occur synchronously upon blockchain network confirmation or admin clearinghouse settlement.
            </p>

            <h2 className="text-xl font-bold text-foreground">4. VIP Subscriptions & Membership</h2>
            <p>
              VIP Membership tiers ($122 to $5,000 monthly) provide percentage discounts on asset allocations and preferential deal access. Membership fees are non-refundable and auto-deducted from available cash balances upon request.
            </p>

            <h2 className="text-xl font-bold text-foreground">5. Limitation of Liability</h2>
            <p>
              Tesla Capital Platforms Inc. is not liable for market fluctuations, network latency during asset swaps, or unauthorized access resulting from user credential exposure.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
