import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminRealEstateClient } from './real-estate-admin-client'
import type { RealEstateProperty, RealEstateInvestment, Profile } from '@/types'

export default async function AdminRealEstatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch properties
  const { data: properties } = await supabase
    .from('real_estate_properties')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch investments
  const { data: rawInvestments } = await supabase
    .from('real_estate_investments')
    .select('*')
    .order('invested_at', { ascending: false })

  // Fetch profiles for investor lookup
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, vip_tier')

  const profilesMap = new Map((profiles || []).map(p => [p.id, p]))
  const propertiesMap = new Map((properties || []).map(p => [p.id, p]))

  const investments: RealEstateInvestment[] = (rawInvestments || []).map(inv => ({
    ...inv,
    user: profilesMap.get(inv.user_id),
    property: propertiesMap.get(inv.property_id),
  }))

  return (
    <AdminRealEstateClient
      initialProperties={(properties || []) as RealEstateProperty[]}
      initialInvestments={investments}
    />
  )
}

