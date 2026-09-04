import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminInventoryClient } from './inventory-client'

export default async function AdminInventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminInventoryClient products={products || []} />
}
