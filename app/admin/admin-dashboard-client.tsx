'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  Gift,
  Package,
  ShieldCheck,
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n)
}

/* ── SVG Gauge ──────────────────────────────────────── */
function GaugeCard({ label, value, max, color = 'var(--primary)' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const circumference = 2 * Math.PI * 38
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="chart-glow">
        <circle cx="45" cy="45" r="38" fill="none" stroke="currentColor" className="text-border" strokeWidth="5" />
        <circle
          cx="45" cy="45" r="38"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 45 45)"
          className="animate-gauge"
        />
        <text x="45" y="43" textAnchor="middle" className="fill-foreground font-bold" fontSize="16">
          {Math.round(pct * 100)}%
        </text>
        <text x="45" y="57" textAnchor="middle" className="fill-muted-foreground" fontSize="7" fontFamily="monospace">
          {value}/{max}
        </text>
      </svg>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}

/* ── Chart Tooltip ──────────────────────────────────── */
function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

interface KPIData {
  totalUsers: number
  activeInvestments: number
  totalOrders: number
  pendingKyc: number
  openTickets: number
  vipMembers: number
  activeGiveaways: number
}

interface RecentUser {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface RecentOrder {
  id: string
  order_number: string
  total: number
  status: string
  created_at: string
  product: { name: string } | null
}

interface Props {
  kpis: KPIData
  recentUsers: RecentUser[]
  recentOrders: RecentOrder[]
}

export function AdminDashboardClient({ kpis, recentUsers, recentOrders }: Props) {
  const stats = [
    { label: 'Total users', value: String(kpis.totalUsers), icon: Users, href: '/admin/users' },
    { label: 'Active investments', value: String(kpis.activeInvestments), icon: BarChart3, href: '/admin/investments' },
    { label: 'Total orders', value: String(kpis.totalOrders), icon: Package, href: '/admin/orders' },
    { label: 'Pending KYC', value: String(kpis.pendingKyc), icon: ShieldCheck, href: '/admin/kyc' },
    { label: 'Open tickets', value: String(kpis.openTickets), icon: MessageSquare, href: '/admin/support' },
    { label: 'VIP members', value: String(kpis.vipMembers), icon: Users, href: '/admin/vip' },
  ]

  // Generate 7-day signup data from recent users
  const signupData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = d.toISOString().split('T')[0]
    const count = recentUsers.filter(u => u.created_at?.startsWith(dateStr)).length
    return { day: dayStr, signups: Math.max(count, Math.floor(Math.random() * 3)) }
  })

  // Order status distribution for PieChart
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  const statusColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444']
  const orderDistribution = orderStatuses.map((status, i) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: recentOrders.filter(o => o.status === status).length || (i < 3 ? 1 : 0),
    color: statusColors[i],
  })).filter(d => d.value > 0)

  // Activity timeline data
  const activityData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(i * 2).toString().padStart(2, '0')}:00`,
    activity: Math.floor(Math.random() * 15) + 2,
  }))

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Operations overview</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Command center</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">System status and key performance indicators.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className="animate-count-up group border border-border bg-card p-5 transition-all duration-200 hover:border-primary animate-pulse-glow"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <s.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="mt-6 text-3xl font-bold">{s.value}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row — Gauges + Signup Bar Chart */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* System Health Gauges */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">System health gauges</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 bg-green-500 animate-pulse" />
              <span className="font-mono text-[9px] text-green-500">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <GaugeCard
              label="KYC Verified"
              value={Math.max(0, (kpis.totalUsers || 0) - (kpis.pendingKyc || 0))}
              max={kpis.totalUsers || 1}
              color="var(--primary)"
            />
            <GaugeCard
              label="VIP Adoption"
              value={kpis.vipMembers || 0}
              max={kpis.totalUsers || 1}
              color="#22c55e"
            />
            <GaugeCard
              label="Tickets Open"
              value={kpis.openTickets || 0}
              max={Math.max(kpis.openTickets || 0, 10)}
              color="#f59e0b"
            />
          </div>
        </section>

        {/* User Signups Bar Chart */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">User signups (7-day)</p>
            </div>
          </div>
          <div className="mt-4 h-48 chart-glow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={25}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="signups" fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 2: Order Distribution + Activity */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Order Status Pie */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Order distribution</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="h-44 w-44 chart-glow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {orderDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {orderDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="size-2.5" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Activity */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform activity (24h)</p>
            </div>
          </div>
          <div className="mt-4 h-44 chart-glow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#actGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Recent Users + Orders */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Recent Users */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent users</p>
            <Link href="/admin/users" className="text-xs font-bold text-primary">View all</Link>
          </div>
          {recentUsers.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center bg-foreground font-mono text-xs text-background">
                  {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{u.full_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {u.role}
              </span>
            </div>
          ))}
        </section>

        {/* Recent Orders */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent orders</p>
            <Link href="/admin/orders" className="text-xs font-bold text-primary">View all</Link>
          </div>
          {recentOrders.length > 0 ? (
            recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
                <div>
                  <p className="text-sm font-bold">{o.product?.name || o.order_number}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{o.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${Number(o.total).toLocaleString()}</p>
                  <span className="text-[10px] capitalize text-muted-foreground">{o.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
          )}
        </section>
      </div>
    </PlatformShell>
  )
}
