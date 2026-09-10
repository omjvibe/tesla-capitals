import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminGiveawaysClient } from './giveaways-client'

export default async function AdminGiveawaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch giveaways with entry counts
  const { data: giveaways } = await supabase
    .from('giveaways')
    .select('*, giveaway_entries(count)')
    .order('created_at', { ascending: false })

  // Fetch all user profiles for participant selection
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, vip_tier')
    .order('full_name', { ascending: true })

  const formattedGiveaways = (giveaways || []).map((g: any) => ({
    ...g,
    entry_count: g.giveaway_entries?.[0]?.count || 0,
  }))

  return <AdminGiveawaysClient giveaways={formattedGiveaways} users={users || []} />
}
