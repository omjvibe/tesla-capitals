import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, BarChart3, ChevronRight, Gift, Globe, LineChart, Lock, ShieldCheck, Users, Wallet, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LandingThemeToggle } from './landing-client'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export default async function Home() {
  const supabase = await createClient()
  const { data: stocks } = await supabase.from('stocks').select('symbol, price, change_percent').eq('is_published', true).order('symbol').limit(8)
  const { count: totalMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: totalInvestments } = await supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active')

  const memberCount = totalMembers || 2450
  const investmentCount = totalInvestments || 14

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/tesla-seeklogo.png" alt="Tesla Capital" width={80} height={16} className="h-4 w-auto brightness-0 invert" />
            <span className="font-mono text-sm font-bold tracking-[0.22em] text-white">CAPITAL</span>
          </Link>
          <nav className="hidden items-center gap-8 text-xs text-white/60 md:flex">
            <Link href="/investments" className="transition-colors hover:text-white">Investments</Link>
            <Link href="/stocks" className="transition-colors hover:text-white">Markets</Link>
            <Link href="/learn" className="transition-colors hover:text-white">Learn</Link>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/vip" className="transition-colors hover:text-white">VIP</Link>
            <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LandingThemeToggle />
            <Link href="/signup" className="bg-primary px-5 py-2.5 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero w/ Background Video ────────────────────── */}
      <section className="hero-video-overlay relative flex min-h-screen items-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/teslaherovideo.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-32 md:px-10">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.4em] text-primary">The future of ownership</p>
          <h1 className="max-w-5xl text-5xl font-extrabold leading-[0.92] tracking-[-0.04em] text-white md:text-8xl lg:text-9xl">
            Invest in<br /><span className="text-primary">what&apos;s next.</span>
          </h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-white/70">
            Explore curated investment opportunities, track your portfolio in real-time, and unlock exclusive benefits — all from one unified platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95">
              Start investing <ArrowUpRight size={17} />
            </Link>
            <Link href="/learn" className="inline-flex items-center gap-2 border border-white/30 px-7 py-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 active:scale-95">
              How it works <ChevronRight size={17} />
            </Link>
          </div>
          {/* Floating stats */}
          <div className="mt-16 flex flex-wrap gap-8 border-t border-white/15 pt-8">
            <div>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter end={memberCount} suffix="+" />
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                <AnimatedCounter end={investmentCount} />
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Active opportunities</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Market Ticker ───────────────────────────── */}
      {stocks && stocks.length > 0 && (
        <section className="overflow-hidden border-b border-border bg-foreground text-background">
          <div className="flex animate-ticker gap-12 px-5 py-4 cursor-pointer">
            {[...stocks, ...stocks, ...stocks].map((s, i) => (
              <Link key={i} href={`/stocks/${s.symbol}`} className="flex shrink-0 items-center gap-3 font-mono text-xs transition-opacity hover:opacity-80">
                <span className="font-bold">{s.symbol}</span>
                <span>${Number(s.price).toFixed(2)}</span>
                <span className={Number(s.change_percent) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {Number(s.change_percent) >= 0 ? '+' : ''}{Number(s.change_percent).toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Features Grid ───────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-10">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Why Tesla Capital</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Built for the<br />modern investor.</h2>
        </div>
        <div className="grid border-t border-border md:grid-cols-3">
          {[
            { icon: Zap, tag: 'Built for motion', title: 'Move with conviction.', desc: 'Access curated investment opportunities designed for long-term growth and capital preservation.' },
            { icon: LineChart, tag: 'See clearly', title: 'Your capital. One view.', desc: 'Track investments, stocks, and portfolio performance from a unified real-time dashboard.' },
            { icon: ShieldCheck, tag: 'Stay protected', title: 'Security by design.', desc: 'Enterprise-grade security with KYC verification, RLS policies, and role-based access control.' },
            { icon: Wallet, tag: 'Diversify', title: 'Multiple asset classes.', desc: 'From stocks to structured investments — build a diversified portfolio that matches your risk profile.' },
            { icon: Gift, tag: 'Earn rewards', title: 'VIP membership perks.', desc: 'Unlock exclusive giveaways, priority support, and reduced fees with our tiered membership program.' },
            { icon: Globe, tag: 'Go global', title: 'Borderless access.', desc: 'Invest from anywhere. Our platform supports global markets and multi-currency transactions.' },
          ].map((f, i) => (
            <div key={i} className="group border-b border-border p-8 transition-colors hover:bg-card md:border-b-0 md:border-r md:last:border-r-0 [&:nth-child(3)]:md:border-r-0 [&:nth-child(n+4)]:md:border-t">
              <f.icon className="mb-8 text-primary transition-transform group-hover:scale-110" size={24} />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{f.tag}</p>
              <h3 className="mt-3 text-xl font-bold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="border-b border-border px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Get started in minutes</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">How it works.</h2>
          <div className="mt-16 grid gap-5 md:grid-cols-4">
            {[
              { step: '01', title: 'Create account', desc: 'Sign up with your email and verify your identity through our streamlined KYC process.' },
              { step: '02', title: 'Complete KYC', desc: 'Upload your government-issued ID and proof of address for instant verification.' },
              { step: '03', title: 'Fund & invest', desc: 'Browse curated opportunities, analyze risk profiles, and allocate your capital.' },
              { step: '04', title: 'Track & grow', desc: 'Monitor your portfolio in real-time, receive alerts, and watch your wealth compound.' },
            ].map(s => (
              <div key={s.step} className="group border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                <span className="font-mono text-4xl font-bold text-muted/50 transition-colors group-hover:text-primary">{s.step}</span>
                <h3 className="mt-6 text-lg font-bold">{s.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Preview ────────────────────────────── */}
      <section className="border-b border-border bg-foreground px-5 py-20 text-background md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">Platform at a glance</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Everything you need.<br />Nothing you don&apos;t.</h2>
            </div>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              { icon: BarChart3, title: 'Live Dashboard', desc: 'Portfolio value, asset allocation, market overview, and transaction history — updated in real-time.' },
              { icon: Lock, title: 'Bank-Level Security', desc: 'Row-level security, encrypted sessions, and mandatory email verification protect every account.' },
              { icon: Users, title: 'Admin Command Center', desc: 'Full back-office for user management, KYC review, order processing, and audit trail monitoring.' },
            ].map((f, i) => (
              <div key={i} className="group border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-primary hover:bg-white/10">
                <f.icon className="mb-6 text-primary transition-transform group-hover:scale-110" size={24} />
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Stats ───────────────────────────────── */}
      <section className="border-b border-border px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {[
            { value: memberCount, suffix: '+', label: 'Registered members' },
            { value: investmentCount, suffix: '', label: 'Investment products' },
            { value: 18, suffix: '', label: 'Database tables' },
            { value: 99.9, suffix: '%', label: 'Platform uptime' },
          ].map(s => (
            <div key={s.label} className="border border-border bg-card p-6 text-center transition-all duration-200 hover:border-primary">
              <p className="text-4xl font-bold">
                {typeof s.value === 'number' && s.value !== 99.9 ? (
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                ) : (
                  `${s.value}${s.suffix}`
                )}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">Join the movement</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">The future is<br />closer than you think.</h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                Create your account today and start investing in the companies and technologies building a better tomorrow.
              </p>
            </div>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-primary px-8 py-5 text-sm font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95">
              Create your account <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border px-5 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/tesla-seeklogo.png" alt="Tesla Capital" width={80} height={16} className="h-4 w-auto dark:brightness-0 dark:invert" />
                <span className="font-mono text-sm font-bold tracking-[0.22em]">CAPITAL</span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-5 text-muted-foreground">
                A modern investment platform for building your portfolio around the companies moving humanity forward.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-xs sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/investments" className="text-muted-foreground hover:text-foreground">Investments</Link>
                  <Link href="/stocks" className="text-muted-foreground hover:text-foreground">Markets</Link>
                  <Link href="/inventory" className="text-muted-foreground hover:text-foreground">Inventory</Link>
                  <Link href="/vip" className="text-muted-foreground hover:text-foreground">VIP Membership</Link>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Company</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
                  <Link href="/learn" className="text-muted-foreground hover:text-foreground">Learn</Link>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground">Support</Link>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Account</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
                  <Link href="/signup" className="text-muted-foreground hover:text-foreground">Get started</Link>
                  <Link href="/giveaways" className="text-muted-foreground hover:text-foreground">Giveaways</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-[10px] text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} Tesla Capital. All rights reserved.</span>
            <span>Built with Next.js & Supabase</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
