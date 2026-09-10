import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuctionsClient } from '@/app/auctions/auctions-client'
import type { Auction } from '@/types'

export default async function AuctionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: auctions } = await supabase
    .from('auctions')
    .select('*')
    .order('ends_at', { ascending: true })

  return <AuctionsClient initialAuctions={auctions || []} profile={profile} />
}
