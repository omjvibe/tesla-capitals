import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './admin-dashboard-client'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // KPIs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: pendingKyc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')
  const { count: openTickets } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress'])
  const { count: vipMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('vip_tier', 'standard')
  const { count: activeInvestments } = await supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: activeGiveaways } = await supabase.from('giveaways').select('*', { count: 'exact', head: true }).eq('status', 'active')

  // Recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, created_at, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <AdminDashboardClient
      kpis={{
        totalUsers: totalUsers || 0,
        activeInvestments: activeInvestments || 0,
        totalOrders: totalOrders || 0,
        pendingKyc: pendingKyc || 0,
        openTickets: openTickets || 0,
        vipMembers: vipMembers || 0,
        activeGiveaways: activeGiveaways || 0,
      }}
      recentUsers={recentUsers || []}
      recentOrders={(recentOrders || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
        product: o.product,
      }))}
    />
  )
}
