import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSupportClient } from './support-client'

export default async function AdminSupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: tickets } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })

  return <AdminSupportClient tickets={tickets || []} />
}
