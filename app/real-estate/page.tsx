import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RealEstateClient } from './real-estate-client'
import type { RealEstateProperty, RealEstateInvestment } from '@/types'

export const dynamic = 'force-dynamic'

export default async function RealEstatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch active properties
  const { data: properties } = await supabase
    .from('real_estate_properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch user's real estate investments
  const { data: rawHoldings } = await supabase
    .from('real_estate_investments')
    .select('*, property:real_estate_properties(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  return (
    <RealEstateClient
      properties={(properties || []) as RealEstateProperty[]}
      holdings={(rawHoldings || []) as (RealEstateInvestment & { property?: RealEstateProperty })[]}
      profile={profile}
    />
  )
}

