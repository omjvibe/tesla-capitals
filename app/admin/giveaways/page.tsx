import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminGiveawaysClient } from './giveaways-client'

export default async function AdminGiveawaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: giveaways } = await supabase.from('giveaways').select('*').order('created_at', { ascending: false })

  return <AdminGiveawaysClient giveaways={giveaways || []} />
}
