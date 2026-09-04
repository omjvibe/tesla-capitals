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

  return (
    <WalletClient
      profile={profile}
      cryptoAddresses={cryptoAddresses || []}
      depositRequests={depositRequests || []}
      withdrawalRequests={withdrawalRequests || []}
      transactions={transactions || []}
    />
  )
}
