import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvestmentsClient } from './investments-client'
import { ROADSTER_INVESTMENTS, isPremiumVip, isRoadsterInvestment, applyRoadsterDiscount } from '@/lib/data/roadster-defaults'

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: dbInvestments } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const userIsPremiumVip = isPremiumVip(profile)

  let investments = (dbInvestments || [])

  if (userIsPremiumVip) {
    // Merge Roadster investments with 15% discount applied
    const existingIds = new Set(investments.map(i => i.id))
    const missingRoadster = ROADSTER_INVESTMENTS.filter(r => !existingIds.has(r.id))
    investments = [...missingRoadster, ...investments].map(inv => {
      if (isRoadsterInvestment(inv.id, inv.name)) {
        return {
          ...inv,
          min_amount: applyRoadsterDiscount(Number(inv.min_amount)),
        }
      }
      return inv
    })
  } else {
    // Hide flying car deals from non-premium members
    investments = investments.filter(inv => !isRoadsterInvestment(inv.id, inv.name))
  }

  const { data: holdings } = await supabase
    .from('investment_holdings')
    .select('investment_id, amount, current_value')
    .eq('user_id', user.id)
    .eq('status', 'active')

  return <InvestmentsClient investments={investments} holdings={holdings || []} profile={profile} />
}

