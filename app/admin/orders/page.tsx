import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminOrdersClient } from './orders-client'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, product:products(name)')
    .order('created_at', { ascending: false })

  return <AdminOrdersClient orders={orders || []} />
}
