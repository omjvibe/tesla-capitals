import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VipClient } from './vip-client'

export default async function VipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('vip_tier, vip_expires_at')
    .eq('id', user.id)
    .single()

  const { data: tiers } = await supabase
    .from('vip_tiers')
    .select('*')
    .eq('is_active', true)
    .order('price')

  return <VipClient tiers={tiers || []} currentTier={profile?.vip_tier || 'standard'} expiresAt={profile?.vip_expires_at} />
}
