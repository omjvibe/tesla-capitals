import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: investmentHoldings } = await supabase
    .from('investment_holdings')
    .select('*, investment:investments(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: portfolioHoldings } = await supabase
    .from('portfolio_holdings')
    .select('*, stock:stocks(*)')
    .eq('user_id', user.id)

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: stocks } = await supabase
    .from('stocks')
    .select('*')
    .eq('is_published', true)
    .order('symbol')
    .limit(6)

  // Calculate totals
  const investmentTotal = (investmentHoldings || []).reduce((sum, h) => sum + Number(h.current_value), 0)
  const stockTotal = (portfolioHoldings || []).reduce((sum, h) => sum + (Number(h.shares) * Number(h.stock?.price || 0)), 0)
  const totalBalance = investmentTotal + stockTotal
  const investedAmount = (investmentHoldings || []).reduce((sum, h) => sum + Number(h.amount), 0)
  const stockCostBasis = (portfolioHoldings || []).reduce((sum, h) => sum + (Number(h.shares) * Number(h.avg_cost)), 0)
  const allTimeChange = totalBalance - investedAmount - stockCostBasis
  const allTimePercent = (investedAmount + stockCostBasis) > 0
    ? ((allTimeChange / (investedAmount + stockCostBasis)) * 100)
    : 0

  return (
    <DashboardClient
      profile={profile}
      investmentHoldings={investmentHoldings || []}
      portfolioHoldings={portfolioHoldings || []}
      recentTransactions={recentTransactions || []}
      stocks={stocks || []}
      stats={{
        totalBalance,
        investedAmount: investedAmount + stockCostBasis,
        availableCash: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        allTimeChange,
        allTimeChangePercent: allTimePercent,
      }}
    />
  )
}
