import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminInvestmentsClient } from './investments-client'

export default async function AdminInvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminInvestmentsClient investments={investments || []} />
}
