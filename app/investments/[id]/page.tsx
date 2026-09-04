import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InvestmentDetailClient } from './detail-client'

export default async function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: investment } = await supabase.from('investments').select('*').eq('id', id).single()

  if (!investment) notFound()

  const { data: holding } = await supabase
    .from('investment_holdings')
    .select('*')
    .eq('user_id', user.id)
    .eq('investment_id', id)
    .eq('status', 'active')
    .maybeSingle()

  return <InvestmentDetailClient investment={investment} holding={holding} profile={profile} userId={user.id} />
}
