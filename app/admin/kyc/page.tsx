import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const adminSupabase = createAdminClient()

  // 1. Fetch all users for selection, user directory, and fallback mapping
  const { data: usersData } = await adminSupabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, vip_tier, kyc_status, is_kyc_mandated, wallet_balance, created_at, updated_at')
    .order('email', { ascending: true })

  const users: Profile[] = (usersData || []) as Profile[]
  const usersMap = new Map<string, Profile>(users.map(u => [u.id, u]))

  // 2. Fetch KYC documents with user join fallback
  let rawDocuments: (KycDocument & { user?: Profile })[] | null = null
  const { data: docsWithJoin, error: joinErr } = await adminSupabase
    .from('kyc_documents')
    .select('*, user:profiles!user_id(id, email, full_name, kyc_status, is_kyc_mandated, avatar_url, role, vip_tier)')
    .order('created_at', { ascending: false })

  if (joinErr || !docsWithJoin) {
    const { data: plainDocs } = await adminSupabase
      .from('kyc_documents')
      .select('*')
      .order('created_at', { ascending: false })
    rawDocuments = plainDocs || []
  } else {
    rawDocuments = docsWithJoin
  }

  const documents: KycDocument[] = (rawDocuments || []).map(doc => ({
    ...doc,
    user: doc.user || usersMap.get(doc.user_id) || undefined
  }))

  return (
    <AdminKycClient
      documents={documents}
      users={users}
      adminId={user.id}
    />
  )
}
