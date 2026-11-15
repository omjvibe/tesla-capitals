import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RealEstateDetailClient } from './detail-client'
import type { RealEstateProperty, RealEstateInvestment, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function RealEstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: property } = await supabase
    .from('real_estate_properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!property) {
    notFound()
  }

  // Fetch user holding in this property if any
  const { data: holding } = await supabase
    .from('real_estate_investments')
    .select('*')
    .eq('user_id', user.id)
    .eq('property_id', id)
    .eq('status', 'active')
    .maybeSingle()

  return (
    <RealEstateDetailClient
      property={property as RealEstateProperty}
      holding={holding as RealEstateInvestment | null}
      profile={profile as Profile}
      userId={user.id}
    />
  )
}

