import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <header className="flex justify-between border-b border-border px-5 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em]">
          <span className="grid size-7 place-items-center bg-primary text-primary-foreground">T</span>
          TESLA CAPITAL
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link href="/signup" className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-24 md:px-10">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">About Tesla Capital</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
          We back the people building a better tomorrow.
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-muted-foreground">
          Tesla Capital is a modern investment platform where you can explore curated opportunities, 
          track your portfolio performance, and access exclusive membership benefits — all from one unified experience.
        </p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-5 border-t border-border pt-8 md:grid-cols-4">
          {[
            { value: '2024', label: 'Founded' },
            { value: '100+', label: 'Markets' },
            { value: '50K+', label: 'Members' },
            { value: '99.9%', label: 'Uptime' },
          ].map(s => (
            <div key={s.label} className="border border-border bg-card p-5">
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mission sections */}
        <div className="mt-16 space-y-12 border-t border-border pt-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Our mission</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Accelerating the transition to sustainable investment.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              We believe that the future belongs to those who invest in it. Our platform makes it straightforward 
              for anyone to build a portfolio around the companies and technologies creating meaningful change.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Technology</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Built for the modern investor.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Enterprise-grade infrastructure with real-time portfolio tracking, KYC verification, 
              and role-based access control. Every interaction is secured, every transaction is logged.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Innovation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">The future is closer than you think.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              From VIP memberships to exclusive giveaways, from investment discovery to portfolio analytics — 
              we are building the tools that make investing feel intentional rather than overwhelming.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 border border-primary bg-primary/5 p-10 text-center">
          <h2 className="text-3xl font-bold">Ready to invest in the future?</h2>
          <p className="mt-4 text-sm text-muted-foreground">Join thousands of investors building portfolios with purpose.</p>
          <Link href="/signup" className="mt-8 inline-block bg-primary px-8 py-4 text-sm font-bold text-primary-foreground">
            Create your account
          </Link>
        </div>
      </section>
    </main>
  )
}
