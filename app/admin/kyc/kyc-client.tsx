'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Check, X, ExternalLink, Eye, FileText } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { KycDocument } from '@/types'

export function AdminKycClient({ documents: initial, adminId }: { documents: KycDocument[]; adminId: string }) {
  const router = useRouter()
  const [docs, setDocs] = useState(initial)
  const [previewDoc, setPreviewDoc] = useState<KycDocument | null>(null)

  const handleReview = async (docId: string, userId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    await supabase.from('kyc_documents').update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }).eq('id', docId)

    if (status === 'approved') {
      await supabase.from('profiles').update({ kyc_status: 'approved' }).eq('id', userId)
    } else {
      await supabase.from('profiles').update({ kyc_status: 'rejected' }).eq('id', userId)
    }

    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status } : d))
    router.refresh()
  }

  const getDocUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url
    }
    // Storage relative path
    const supabase = createClient()
    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(url)
    return data.publicUrl
  }

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Identity verification</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">KYC Review Queue ({docs.length})</h1>
      </div>

      <div className="mt-8 space-y-3">
        {docs.length > 0 ? (
          docs.map(d => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
              <div>
                <p className="text-sm font-bold capitalize">{d.doc_type.replace('_', ' ')}</p>
                <p className="font-mono text-[10px] text-muted-foreground">User ID: {d.user_id} · Submitted: {new Date(d.created_at).toLocaleDateString()}</p>
                
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => setPreviewDoc(d)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <Eye size={14} /> Preview document
                  </button>
                  <a
                    href={getDocUrl(d.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Direct link <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {d.status === 'pending' ? (
                <div className="flex gap-2">
                  <button onClick={() => handleReview(d.id, d.user_id, 'approved')} className="flex items-center gap-1 bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleReview(d.id, d.user_id, 'rejected')} className="flex items-center gap-1 bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90">
                    <X size={14} /> Reject
                  </button>
                </div>
              ) : (
                <span className={`px-3 py-1 text-xs font-bold uppercase ${d.status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  {d.status}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-muted-foreground border border-border bg-card">
            <ShieldCheck size={36} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-bold">No KYC verification documents pending review.</p>
          </div>
        )}
      </div>

      {/* Document Modal Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold capitalize">{previewDoc.doc_type.replace('_', ' ')} Document</h3>
                <p className="font-mono text-xs text-muted-foreground">User: {previewDoc.user_id}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 hover:text-primary"><X size={20} /></button>
            </div>

            <div className="relative min-h-[300px] max-h-[70vh] overflow-auto border border-border bg-background p-4 flex items-center justify-center">
              {previewDoc.file_url?.startsWith('data:image') || previewDoc.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={getDocUrl(previewDoc.file_url)} alt="KYC Document" className="max-h-[60vh] object-contain" />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText size={48} className="mx-auto text-primary" />
                  <p className="text-sm font-bold">Document File: {previewDoc.doc_type}</p>
                  <p className="font-mono text-xs text-muted-foreground break-all">{previewDoc.file_url}</p>
                  <a
                    href={getDocUrl(previewDoc.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                  >
                    Open Document in New Tab &rarr;
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {previewDoc.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReview(previewDoc.id, previewDoc.user_id, 'approved')
                      setPreviewDoc(null)
                    }}
                    className="bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                  >
                    Approve Document
                  </button>
                  <button
                    onClick={() => {
                      handleReview(previewDoc.id, previewDoc.user_id, 'rejected')
                      setPreviewDoc(null)
                    }}
                    className="bg-primary px-4 py-2 text-xs font-bold text-white"
                  >
                    Reject Document
                  </button>
                </>
              )}
              <button onClick={() => setPreviewDoc(null)} className="border border-border px-4 py-2 text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  )
}
