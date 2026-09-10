import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminAuctionsClient } from './auctions-admin-client'
import type { Auction, Product } from '@/types'

export default async function AdminAuctionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch auctions
  const { data: auctions } = await supabase
    .from('auctions')
    .select('*, product:products(*), winner:profiles(email, full_name)')
    .order('created_at', { ascending: false })

  // Fetch all recent bids with bidder profiles
  const { data: recentBids } = await supabase
    .from('auction_bids')
    .select('*, user:profiles(id, email, full_name, wallet_balance), auction:auctions(title)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch available products from inventory to allow 1-click auction creation
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name')

  return (
    <AdminAuctionsClient
      initialAuctions={auctions || []}
      initialBids={recentBids || []}
      products={products || []}
    />
  )
}
