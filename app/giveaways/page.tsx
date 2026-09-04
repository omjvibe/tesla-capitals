import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GiveawaysClient } from './giveaways-client'

export default async function GiveawaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: giveaways } = await supabase
    .from('giveaways')
    .select('*')
    .in('status', ['active', 'ended'])
    .order('ends_at', { ascending: true })

  const { data: userEntries } = await supabase
    .from('giveaway_entries')
    .select('giveaway_id')
    .eq('user_id', user.id)

  const enteredIds = new Set((userEntries || []).map(e => e.giveaway_id))

  return <GiveawaysClient giveaways={giveaways || []} enteredIds={enteredIds} userId={user.id} />
}
