import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountClient } from './account-client'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: kycDocs } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <AccountClient profile={profile} kycDocs={kycDocs || []} userId={user.id} />
}
