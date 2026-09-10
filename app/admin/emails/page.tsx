import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminEmailsClient } from './emails-client'

export default async function AdminEmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Try fetching from resend_emails first, fallback to email_logs
  let emails = []
  const { data: resendData, error: resendErr } = await supabase
    .from('resend_emails')
    .select('*')
    .order('created_at', { ascending: false })

  if (!resendErr && resendData && resendData.length > 0) {
    emails = resendData
  } else {
    const { data: logData } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
    emails = logData || []
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, vip_tier, kyc_status, wallet_balance')
    .order('created_at', { ascending: false })

  return <AdminEmailsClient initialEmails={emails} users={profiles || []} />
}
