import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminStocksClient } from './stocks-client'

export default async function AdminStocksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: stocks } = await supabase
    .from('stocks')
    .select('*')
    .order('symbol')

  return <AdminStocksClient stocks={stocks || []} />
}
