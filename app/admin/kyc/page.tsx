import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminKycClient } from './kyc-client'
import type { KycDocument, Profile } from '@/types'

export default async function AdminKycPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // 1. Fetch all KYC documents directly from Supabase
  const { data: documentsData, error: docsError } = await supabase
    .from('kyc_documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (docsError) {
    console.error('Error fetching KYC documents from Supabase:', docsError)
  }

  // 2. Fetch all registered user profiles for KYC user management and mapping
  const { data: usersData, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, vip_tier, kyc_status, is_kyc_mandated, wallet_balance, created_at, updated_at')
    .order('email', { ascending: true })

  if (usersError) {
    console.error('Error fetching profiles from Supabase:', usersError)
  }

  const users: Profile[] = (usersData || []) as Profile[]
  const usersMap = new Map<string, Profile>(users.map(u => [u.id, u]))

  // Map user profile to each document
  const documents: KycDocument[] = (documentsData || []).map(doc => ({
    ...doc,
    user: usersMap.get(doc.user_id) || undefined
  }))

  return (
    <AdminKycClient
      documents={documents}
      users={users}
      adminId={user.id}
    />
  )
}
