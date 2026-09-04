import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminWalletClient } from './wallet-admin-client'

export default async function AdminWalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: depositRequests } = await supabase.from('deposit_requests').select('*, user:profiles(full_name, email)').order('created_at', { ascending: false })
  const { data: withdrawalRequests } = await supabase.from('withdrawal_requests').select('*, user:profiles(full_name, email)').order('created_at', { ascending: false })
  const { data: cryptoAddresses } = await supabase.from('crypto_addresses').select('*').order('currency')
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, wallet_balance, realized_pnl, unrealized_pnl').order('created_at', { ascending: false })

  return (
    <AdminWalletClient
      depositRequests={depositRequests || []}
      withdrawalRequests={withdrawalRequests || []}
      cryptoAddresses={cryptoAddresses || []}
      profiles={profiles || []}
    />
  )
}
