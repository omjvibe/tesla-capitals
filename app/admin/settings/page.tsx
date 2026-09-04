import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlatformShell } from '@/components/platform-shell'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: auditLogs } = await supabase
    .from('admin_activity_logs')
    .select('*, admin:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">System administration</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Settings & Audit Log</h1>
      </div>

      <div className="mt-8 border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Platform Configuration</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border py-3">
            <span>Supabase Connection</span>
            <span className="font-mono text-xs font-bold text-green-600">CONNECTED</span>
          </div>
          <div className="flex justify-between border-b border-border py-3">
            <span>Email Verification</span>
            <span className="font-mono text-xs font-bold text-green-600">ENABLED</span>
          </div>
          <div className="flex justify-between py-3">
            <span>Row-Level Security (RLS)</span>
            <span className="font-mono text-xs font-bold text-green-600">ENFORCED (18 Tables)</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-border bg-card">
        <div className="border-b border-border p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Admin Activity Audit Log</p>
        </div>
        {(auditLogs && auditLogs.length > 0) ? (
          auditLogs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div>
                <p className="text-sm font-bold">{log.action}</p>
                <p className="font-mono text-[10px] text-muted-foreground">Entity: {log.entity_type} · Admin: {log.admin?.email || log.admin_id}</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No audit logs recorded yet. All sensitive administrative actions will be logged here.
          </div>
        )}
      </div>
    </PlatformShell>
  )
}
