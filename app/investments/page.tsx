import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvestmentsClient } from './investments-client'
import { ROADSTER_INVESTMENTS } from '@/lib/data/roadster-defaults'

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbInvestments } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Merge Roadster investments so they are always visible to investors
  const existingIds = new Set((dbInvestments || []).map(i => i.id))
  const missingRoadster = ROADSTER_INVESTMENTS.filter(r => !existingIds.has(r.id))
  const investments = [...missingRoadster, ...(dbInvestments || [])]

  const { data: holdings } = await supabase
    .from('investment_holdings')
    .select('investment_id, amount, current_value')
    .eq('user_id', user.id)
    .eq('status', 'active')

  return <InvestmentsClient investments={investments} holdings={holdings || []} />
}

