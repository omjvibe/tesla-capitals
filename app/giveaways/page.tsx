import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GiveawaysClient } from './giveaways-client'

export default async function GiveawaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, wallet_balance, vip_tier')
    .eq('id', user.id)
    .single()

  const { data: giveaways } = await supabase
    .from('giveaways')
    .select('*, giveaway_entries(count)')
    .in('status', ['active', 'ended'])
    .order('ends_at', { ascending: true })

  const { data: userEntries } = await supabase
    .from('giveaway_entries')
    .select('giveaway_id')
    .eq('user_id', user.id)

  const enteredIds = (userEntries || []).map(e => e.giveaway_id)

  const formattedGiveaways = (giveaways || []).map((g: any) => ({
    ...g,
    entry_count: g.giveaway_entries?.[0]?.count || 0,
  }))

  return (
    <GiveawaysClient
      giveaways={formattedGiveaways}
      enteredIds={enteredIds}
      userId={user.id}
      userProfile={profile || { id: user.id, wallet_balance: 0, vip_tier: 'bronze' }}
    />
  )
}
