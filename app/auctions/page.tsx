import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuctionsClient } from './auctions-client'
import type { Auction } from '@/types'

export default async function AuctionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, wallet_balance, is_kyc_mandated, kyc_status, vip_tier')
    .eq('id', user.id)
    .single()

  const { data: auctions } = await supabase
    .from('auctions')
    .select('*')
    .order('ends_at', { ascending: true })

  return <AuctionsClient initialAuctions={auctions || []} profile={profile} />
}
