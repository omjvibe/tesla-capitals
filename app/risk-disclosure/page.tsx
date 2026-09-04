import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Brand } from '@/components/platform-shell'

export default function RiskDisclosurePage() {
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
          <div className="border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <p className="font-mono text-xs uppercase tracking-[0.25em] font-bold">Important Notice</p>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Risk Disclosure Statement</h1>
            <p className="mt-2 text-xs text-muted-foreground">High-Risk Asset Allocation Notice · Tesla Capital</p>
          </div>

          <section className="space-y-4 text-sm leading-7 text-muted-foreground">
            <h2 className="text-xl font-bold text-foreground">1. Capital Loss Risk</h2>
            <p>
              Investing in public equities, renewable technology funds, private placements, and digital assets carries inherent risk of loss. Capital values can fluctuate significantly, and past performance is not indicative of future returns.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. Liquidity Constraints</h2>
            <p>
              Certain private equity investments and specialized hardware inventory orders may have mandatory lock-up periods or liquidity restrictions preventing immediate redemption.
            </p>

            <h2 className="text-xl font-bold text-foreground">3. Crypto Volatility & Exchange Rates</h2>
            <p>
              Cryptocurrency deposits and withdrawals are subject to market volatility and blockchain network congestion. Tesla Capital is not responsible for slippage during asset swaps.
            </p>

            <h2 className="text-xl font-bold text-foreground">4. Regulatory & Tax Responsibilities</h2>
            <p>
              Investors are solely responsible for understanding and fulfilling their personal tax obligations and regulatory compliance requirements within their jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
