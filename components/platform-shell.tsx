'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BarChart3, Bell, BriefcaseBusiness, ChevronRight, CircleHelp, Gift, Home, LogOut, Menu, Moon, Package, Settings, ShieldCheck, Sun, UserRound, WalletCards, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/provider'

const userNav = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/investments', label: 'Investments', icon: BriefcaseBusiness },
  { href: '/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio', icon: WalletCards },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/vip', label: 'VIP Membership', icon: ShieldCheck },
  { href: '/giveaways', label: 'Giveaways', icon: Gift },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/account', label: 'Account', icon: UserRound },
  { href: '/support', label: 'Support', icon: CircleHelp },
]

const adminNav = [
  { href: '/admin', label: 'Command center', icon: Home },
  { href: '/admin/users', label: 'Users', icon: UserRound },
  { href: '/admin/investments', label: 'Investments', icon: BriefcaseBusiness },
  { href: '/admin/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/vip', label: 'VIP Tiers', icon: ShieldCheck },
  { href: '/admin/giveaways', label: 'Giveaways', icon: Gift },
  { href: '/admin/kyc', label: 'KYC Review', icon: ShieldCheck },
  { href: '/admin/support', label: 'Support', icon: CircleHelp },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => { document.documentElement.classList.toggle('dark'); setDark(!dark) }}
      className="grid size-10 place-items-center border border-border text-muted-foreground hover:border-primary hover:text-primary"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em] ${dark ? 'text-white' : 'text-foreground'}`}>
      <span className="grid size-7 place-items-center bg-primary text-primary-foreground">T</span>
      TESLA CAPITAL
    </Link>
  )
}

export function PlatformShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = admin ? adminNav : userNav

  const handleSignOut = async () => {
    await signOut()
    router.push(admin ? '/admin/login' : '/login')
    router.refresh()
  }

  const displayName = profile?.full_name || profile?.email || 'User'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card px-4 py-5 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Brand />
          <button onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>
        <div className="mt-10 border-y border-border py-3">
          <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {admin ? 'Admin control' : 'Personal account'}
          </p>
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition-colors ${
                pathname === href
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent text-muted-foreground hover:border-primary hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {pathname === href && <ChevronRight className="ml-auto" size={15} />}
            </Link>
          ))}
        </nav>
        {/* User info */}
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <div className="grid size-9 place-items-center bg-foreground font-mono text-sm text-background">
            {loading ? '...' : initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{loading ? 'Loading...' : displayName}</p>
            <p className="text-[10px] text-muted-foreground">
              {admin ? 'Administrator' : profile?.vip_tier === 'platinum' ? 'Platinum member' : profile?.vip_tier === 'vip' ? 'VIP member' : 'Standard member'}
            </p>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="text-muted-foreground hover:text-primary">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
          <button aria-label="Open navigation" onClick={() => setOpen(true)} className="lg:hidden">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {admin ? 'Operations / Command center' : 'Workspace / Overview'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!admin && (
              <Link href="/notifications" className="relative grid size-10 place-items-center border border-border text-muted-foreground hover:border-primary hover:text-primary">
                <Bell size={17} />
              </Link>
            )}
            <ThemeToggle />
            <div className="size-2 bg-primary" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 pb-24 md:p-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
        {nav.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] ${
              pathname === href ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={18} />
            <span>{label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
