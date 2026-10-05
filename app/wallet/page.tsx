import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WalletClient } from './wallet-client'

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: cryptoAddresses } = await supabase.from('crypto_addresses').select('*').eq('is_active', true)
  const { data: depositRequests } = await supabase.from('deposit_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: withdrawalRequests } = await supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

  const { data: investmentHoldings } = await supabase
    .from('investment_holdings')
    .select('*, investment:investments(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: portfolioHoldings } = await supabase
    .from('portfolio_holdings')
    .select('*, stock:stocks(*)')
    .eq('user_id', user.id)

  const investmentTotal = (investmentHoldings || []).reduce((sum, h) => sum + Number(h.current_value || 0), 0)
  const stockTotal = (portfolioHoldings || []).reduce((sum, h) => sum + (Number(h.shares || 0) * Number(h.stock?.price || 0)), 0)
  const walletBalance = Number(profile?.wallet_balance || 0)
  const totalBalance = investmentTotal + stockTotal + walletBalance

  return (
    <WalletClient
      profile={profile}
      cryptoAddresses={cryptoAddresses || []}
      depositRequests={depositRequests || []}
      withdrawalRequests={withdrawalRequests || []}
      transactions={transactions || []}
      totalBalance={totalBalance}
      investmentTotal={investmentTotal}
      stockTotal={stockTotal}
    />
  )
}
