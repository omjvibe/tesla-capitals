import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuctionDetailClient } from './detail-client'
import type { Auction, AuctionBid, Profile } from '@/types'

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/auctions/${id}`)

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch auction details
  const { data: auction } = await supabase
    .from('auctions')
    .select('*, product:products(*)')
    .eq('id', id)
    .single()

  if (!auction) {
    notFound()
  }

  // Fetch recent bids
  const { data: bids } = await supabase
    .from('auction_bids')
    .select('*, user:profiles(id, email, full_name)')
    .eq('auction_id', id)
    .order('amount', { ascending: false })
    .limit(30)

  return (
    <AuctionDetailClient
      initialAuction={auction}
      initialBids={bids || []}
      profile={profile}
    />
  )
}
