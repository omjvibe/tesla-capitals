import Link from 'next/link'
import { ArrowUpRight, ChevronRight, LineChart, ShieldCheck, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: stocks } = await supabase.from('stocks').select('symbol, price, change_percent').eq('is_published', true).order('symbol').limit(6)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em]">
          <span className="grid size-7 place-items-center bg-primary text-primary-foreground">T</span>
          TESLA CAPITAL
        </Link>
        <nav className="hidden items-center gap-8 text-xs text-muted-foreground md:flex">
          <Link href="/learn" className="hover:text-foreground">Learn</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
        </nav>
        <Link href="/signup" className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Get started</Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-primary">The future of ownership</p>
          <h1 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-[-0.06em] md:text-8xl">Invest in <span className="text-primary">what&apos;s next.</span></h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground">
            Explore investment opportunities, track your portfolio, and discover exclusive benefits from one unified platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-3 bg-primary px-6 py-4 text-sm font-bold text-primary-foreground">Start investing <ArrowUpRight size={17} /></Link>
            <Link href="/learn" className="inline-flex items-center gap-2 border border-border px-6 py-4 text-sm font-bold hover:border-foreground">How it works <ChevronRight size={17} /></Link>
          </div>
        </div>
        <div className="pointer-events-none absolute right-[-5%] top-20 hidden select-none font-mono text-[28rem] font-bold leading-none text-muted/50 lg:block">T</div>
      </section>

      {/* Features */}
      <section className="grid border-b border-border md:grid-cols-3">
        <div className="border-b border-border p-8 md:border-b-0 md:border-r">
          <Zap className="mb-10 text-primary" size={24} />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Built for motion</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Move with conviction.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Access curated investment opportunities designed for long-term growth.</p>
        </div>
        <div className="border-b border-border p-8 md:border-b-0 md:border-r">
          <LineChart className="mb-10 text-primary" size={24} />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">See clearly</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Your capital. One view.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Track investments, stocks, and portfolio performance from a unified dashboard.</p>
        </div>
        <div className="p-8">
          <ShieldCheck className="mb-10 text-primary" size={24} />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Stay protected</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Security by design.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Enterprise-grade security with KYC verification and role-based access control.</p>
        </div>
      </section>

      {/* Market Ticker */}
      {stocks && stocks.length > 0 && (
        <section className="overflow-hidden border-b border-border bg-foreground text-background">
          <div className="flex animate-[scroll_20s_linear_infinite] gap-12 px-5 py-4">
            {[...stocks, ...stocks].map((s, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 font-mono text-xs">
                <span className="font-bold">{s.symbol}</span>
                <span>${Number(s.price).toFixed(2)}</span>
                <span className={Number(s.change_percent) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {Number(s.change_percent) >= 0 ? '+' : ''}{Number(s.change_percent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Explore the platform</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Designed for<br />the long term.</h2>
          </div>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-primary px-6 py-4 text-sm font-bold text-primary-foreground">
            Create your account <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="flex flex-col justify-between gap-5 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Tesla Capital</span>
          <div className="flex gap-6">
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
