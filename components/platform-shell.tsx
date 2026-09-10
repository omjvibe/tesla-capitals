'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BarChart3, Bell, BriefcaseBusiness, ChevronRight, CircleHelp, Gavel, Gift, Home, LogOut, Mail, Menu, Monitor, Moon, Package, Settings, ShieldCheck, Sun, UserRound, Wallet, WalletCards, X } from 'lucide-react'
import { useAuth, useTheme } from '@/lib/auth/provider'
import { GoogleTranslate } from '@/components/google-translate'

const userNav = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/wallet', label: 'Digital Wallet', icon: Wallet },
  { href: '/investments', label: 'Investments', icon: BriefcaseBusiness },
  { href: '/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio', icon: WalletCards },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/auctions', label: 'Auctions', icon: Gavel },
  { href: '/vip', label: 'VIP Membership', icon: ShieldCheck },
  { href: '/giveaways', label: 'Giveaways', icon: Gift },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/account', label: 'Account', icon: UserRound },
  { href: '/support', label: 'Support', icon: CircleHelp },
]

const adminNav = [
  { href: '/admin', label: 'Command center', icon: Home },
  { href: '/admin/wallet', label: 'Wallet Manager', icon: Wallet },
  { href: '/admin/users', label: 'Users', icon: UserRound },
  { href: '/admin/investments', label: 'Investments', icon: BriefcaseBusiness },
  { href: '/admin/stocks', label: 'Stocks', icon: BarChart3 },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/auctions', label: 'Auction Manager', icon: Gavel },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/vip', label: 'VIP Tiers', icon: ShieldCheck },
  { href: '/admin/giveaways', label: 'Giveaways', icon: Gift },
  { href: '/admin/kyc', label: 'KYC Review', icon: ShieldCheck },
  { href: '/admin/emails', label: 'Resend Inbox', icon: Mail },
  { href: '/admin/support', label: 'Support', icon: CircleHelp },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const cycle = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }
  return (
    <button
      aria-label="Toggle theme"
      onClick={cycle}
      title={`Theme: ${theme}`}
      className="grid size-10 place-items-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
    >
      {theme === 'dark' ? <Moon size={17} /> : theme === 'light' ? <Sun size={17} /> : <Monitor size={17} />}
    </button>
  )
}

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-sm font-bold tracking-[0.12em] ${dark ? 'text-white' : 'text-foreground'}`}>
      <Image src="/tesla-seeklogo.png" alt="Tesla Capital" width={80} height={16} className={`h-4 w-auto ${dark ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`} />
      <span className="font-mono tracking-[0.22em]">CAPITAL</span>
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
        <div className="mt-8 border-y border-border py-3">
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
              className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-all duration-200 ${
                pathname === href
                  ? 'border-primary bg-primary text-primary-foreground font-bold shadow-md'
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
              {admin ? 'Administrator' : profile?.vip_tier ? `${profile.vip_tier.toUpperCase()} member` : 'Standard member'}
            </p>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="text-muted-foreground transition-colors hover:text-primary active:scale-90">
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
            <GoogleTranslate />
            {!admin && (
              <Link href="/notifications" className="relative grid size-10 place-items-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95">
                <Bell size={17} />
              </Link>
            )}
            <ThemeToggle />
            <div className="size-2 bg-primary animate-pulse" title="System Online" />
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
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
              pathname === href ? 'text-primary font-bold' : 'text-muted-foreground'
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
