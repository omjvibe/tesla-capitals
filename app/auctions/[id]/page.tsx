import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuctionDetailClient } from './detail-client'
import {
  ROADSTER_AUCTION,
  isPremiumVip,
  isRoadsterAuction,
  applyRoadsterDiscount,
} from '@/lib/data/roadster-defaults'
import { VipLockedCard } from '@/components/vip-locked-card'
import { PlatformShell } from '@/components/platform-shell'
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
  const { data: dbAuction } = await supabase
    .from('auctions')
    .select('*, product:products(*)')
    .eq('id', id)
    .single()

  const baseAuction = dbAuction || (id === ROADSTER_AUCTION.id ? ROADSTER_AUCTION : null)

  if (!baseAuction) {
    notFound()
  }

  const isRoadster = isRoadsterAuction(id, baseAuction.title)
  const userIsPremiumVip = isPremiumVip(profile)

  // Gate flying car auction behind Premium VIP ($2,000+)
  if (isRoadster && !userIsPremiumVip) {
    return (
      <PlatformShell>
        <VipLockedCard
          title={baseAuction.title}
          description="Access to the 2026 Tesla Roadster SpaceX Package Founders Chassis #001 auction is strictly reserved for Premium VIP members ($2,000+ / Platinum). Upgrade your membership to unlock bidding access and receive an automatic 15% discount on the Buy-It-Now allocation."
          returnUrl="/auctions"
        />
      </PlatformShell>
    )
  }

  // Apply 15% discount on Buy Now price for Premium VIP members
  const auction = isRoadster && baseAuction.buy_now_price
    ? { ...baseAuction, buy_now_price: applyRoadsterDiscount(Number(baseAuction.buy_now_price)) }
    : baseAuction

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
