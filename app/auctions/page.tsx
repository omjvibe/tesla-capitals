import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuctionsClient } from '@/app/auctions/auctions-client'
import {
  ROADSTER_AUCTION,
  isPremiumVip,
  isRoadsterAuction,
  applyRoadsterDiscount,
} from '@/lib/data/roadster-defaults'
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

  const { data: dbAuctions } = await supabase
    .from('auctions')
    .select('*')
    .order('ends_at', { ascending: true })

  const userIsPremiumVip = isPremiumVip(profile)

  let auctions = (dbAuctions || [])

  if (userIsPremiumVip) {
    // Include Roadster SpaceX Founders Chassis #001 auction with 15% discount
    const existingIds = new Set(auctions.map(a => a.id))
    const missingRoadster = existingIds.has(ROADSTER_AUCTION.id) ? [] : [ROADSTER_AUCTION]
    auctions = [...missingRoadster, ...auctions].map(a => {
      if (isRoadsterAuction(a.id, a.title)) {
        return {
          ...a,
          buy_now_price: a.buy_now_price ? applyRoadsterDiscount(Number(a.buy_now_price)) : null,
        }
      }
      return a
    })
  } else {
    // Non-premium VIP members do not see the flying car deal
    auctions = auctions.filter(a => !isRoadsterAuction(a.id, a.title))
  }

  return <AuctionsClient initialAuctions={auctions} profile={profile} />
}
