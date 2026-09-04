import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowUpRight, Clock } from 'lucide-react'

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const categories = ['All', ...new Set((articles || []).map(a => a.category))]

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
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Knowledge center</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
          Knowledge is power.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Learn how Tesla is shaping the future and how you can be part of it.
        </p>

        {(articles && articles.length > 0) ? (
          <div className="mt-16 grid gap-5 border-t border-border pt-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(a => (
              <article key={a.id} className="group border border-border bg-card p-6 transition-colors hover:border-primary">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="bg-primary/10 px-2 py-0.5 font-mono font-bold uppercase text-primary">{a.category}</span>
                  <span>·</span>
                  <span>{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h2 className="mt-4 text-lg font-bold leading-tight">{a.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">{a.excerpt || a.content?.slice(0, 150)}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{a.reading_time} min read</span>
                  </div>
                  <ArrowUpRight size={16} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-16 border-t border-border pt-16 text-center">
            <p className="text-lg font-bold">No articles yet</p>
            <p className="mt-2 text-sm text-muted-foreground">New content will be published here regularly.</p>
          </div>
        )}
      </section>
    </main>
  )
}
