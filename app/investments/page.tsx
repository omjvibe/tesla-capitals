import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvestmentsClient } from './investments-client'

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: holdings } = await supabase
    .from('investment_holdings')
    .select('investment_id, amount, current_value')
    .eq('user_id', user.id)
    .eq('status', 'active')

  return <InvestmentsClient investments={investments || []} holdings={holdings || []} />
}
