'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Check, X, ExternalLink } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { KycDocument } from '@/types'

export function AdminKycClient({ documents: initial, adminId }: { documents: KycDocument[]; adminId: string }) {
  const router = useRouter()
  const [docs, setDocs] = useState(initial)

  const handleReview = async (docId: string, userId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    await supabase.from('kyc_documents').update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', docId)

    // Check if user has all approved docs
    if (status === 'approved') {
      await supabase.from('profiles').update({ kyc_status: 'approved' }).eq('id', userId)
    } else {
      await supabase.from('profiles').update({ kyc_status: 'rejected' }).eq('id', userId)
    }

    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status } : d))
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Identity verification</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">KYC Review Queue ({docs.length})</h1>
      </div>

      <div className="mt-8 space-y-3">
        {docs.map(d => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <div>
              <p className="text-sm font-bold capitalize">{d.doc_type.replace('_', ' ')}</p>
              <p className="font-mono text-[10px] text-muted-foreground">User: {d.user_id} · Submitted: {new Date(d.created_at).toLocaleDateString()}</p>
              <a href={d.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-bold">
                View document <ExternalLink size={12} />
              </a>
            </div>
            {d.status === 'pending' ? (
              <div className="flex gap-2">
                <button onClick={() => handleReview(d.id, d.user_id, 'approved')} className="flex items-center gap-1 bg-green-600 px-3 py-2 text-xs font-bold text-white">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => handleReview(d.id, d.user_id, 'rejected')} className="flex items-center gap-1 bg-primary px-3 py-2 text-xs font-bold text-white">
                  <X size={14} /> Reject
                </button>
              </div>
            ) : (
              <span className={`px-3 py-1 text-xs font-bold uppercase ${d.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                {d.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
