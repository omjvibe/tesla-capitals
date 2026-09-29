import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminEmailsClient } from './emails-client'

export default async function AdminEmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch from both resend_emails and email_logs, deduplicate by resend_id or id
  const { data: resendData } = await supabase
    .from('resend_emails')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: logData } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })

  const seenKeys = new Set<string>()
  const emails: any[] = []

  // Combine both sources
  for (const item of [...(resendData || []), ...(logData || [])]) {
    const key = item.resend_id || item.id || `${item.from_email}-${item.created_at}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      emails.push(item)
    }
  }

  // Sort descending by created_at
  emails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, vip_tier, kyc_status, wallet_balance')
    .order('created_at', { ascending: false })

  return <AdminEmailsClient initialEmails={emails} users={profiles || []} />
}
