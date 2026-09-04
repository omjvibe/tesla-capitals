import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminVipClient } from './vip-client'

export default async function AdminVipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tiers } = await supabase.from('vip_tiers').select('*').order('price')

  return <AdminVipClient tiers={tiers || []} />
}
