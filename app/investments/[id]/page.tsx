import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InvestmentDetailClient } from './detail-client'
import {
  ROADSTER_INVESTMENTS,
  isPremiumVip,
  isRoadsterInvestment,
  applyRoadsterDiscount,
} from '@/lib/data/roadster-defaults'
import { VipLockedCard } from '@/components/vip-locked-card'
import { PlatformShell } from '@/components/platform-shell'

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: dbInvestment } = await supabase.from('investments').select('*').eq('id', id).single()
  const baseInvestment = dbInvestment || ROADSTER_INVESTMENTS.find(r => r.id === id) || null

  if (!baseInvestment) notFound()

  const isRoadster = isRoadsterInvestment(id, baseInvestment.name)
  const userIsPremiumVip = isPremiumVip(profile)

  // Gate flying car deal behind Premium VIP ($2,000+)
  if (isRoadster && !userIsPremiumVip) {
    return (
      <PlatformShell>
        <VipLockedCard
          title={baseInvestment.name}
          description="Access to this private Tesla Roadster SpaceX syndicate is exclusively reserved for Premium VIP members ($2,000+ / Platinum). Upgrade your membership to unlock access and enjoy an automatic 15% discount on minimum capital allocation."
          returnUrl="/investments"
        />
      </PlatformShell>
    )
  }

  // Apply 15% discount for Premium VIP members
  const investment = isRoadster
    ? { ...baseInvestment, min_amount: applyRoadsterDiscount(Number(baseInvestment.min_amount)) }
    : baseInvestment

  const { data: holding } = await supabase
    .from('investment_holdings')
    .select('*')
    .eq('user_id', user.id)
    .eq('investment_id', id)
    .eq('status', 'active')
    .maybeSingle()

  return <InvestmentDetailClient investment={investment} holding={holding} profile={profile} userId={user.id} />
}
