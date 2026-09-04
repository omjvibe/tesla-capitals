import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminEmailsClient } from './emails-client'

export default async function AdminEmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: emailLogs } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false })
  const { data: profiles } = await supabase.from('profiles').select('email, full_name').order('created_at', { ascending: false })

  return <AdminEmailsClient initialLogs={emailLogs || []} users={profiles || []} />
}
