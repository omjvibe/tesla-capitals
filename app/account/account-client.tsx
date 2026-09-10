'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Circle, Upload, ShieldCheck, UserRound } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Profile, KycDocument } from '@/types'

const docTypes = [
  { key: 'government_id', label: 'Government ID' },
  { key: 'passport', label: 'Passport' },
  { key: 'proof_of_address', label: 'Proof of Address' },
] as const

const kycStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-primary/10 text-primary',
}

export function AccountClient({ profile, kycDocs, userId }: { profile: Profile | null; kycDocs: KycDocument[]; userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
    setMessage(error ? error.message : 'Profile updated successfully.')
    if (!error) {
      toast('Profile Updated', 'Personal information saved successfully.')
      router.refresh()
    } else {
      toast('Update Failed', error.message, 'error')
    }
    setSaving(false)
  }

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType)
    const supabase = createClient()
    const path = `${userId}/${docType}-${Date.now()}.${file.name.split('.').pop()}`

    let fileUrl = ''

    const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(path, file)
    
    if (uploadError) {
      // If bucket doesn't exist yet or storage fails, use base64 fallback for images under 3MB
      if (file.type.startsWith('image/') && file.size < 3 * 1024 * 1024) {
        try {
          fileUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        } catch {
          toast('Upload Failed', uploadError.message, 'error')
          setUploading(null)
          return
        }
      } else {
        toast('Storage Bucket Missing', `${uploadError.message}. Please create the 'kyc-documents' bucket in Supabase Storage.`, 'error')
        setUploading(null)
        return
      }
    } else {
      const { data: { publicUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(path)
      fileUrl = publicUrl
    }

    const { error: docError } = await supabase.from('kyc_documents').insert({
      user_id: userId,
      doc_type: docType,
      file_url: fileUrl,
    })

    if (docError) {
      toast('Failed to record document', docError.message, 'error')
      setUploading(null)
      return
    }

    // Update KYC status on profile
    await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', userId)

    toast('Document Uploaded', 'Your document has been submitted for KYC review.')
    setUploading(null)
    router.refresh()
  }

  const getDocStatus = (docType: string) => {
    const doc = kycDocs.find(d => d.doc_type === docType)
    return doc?.status || null
  }

  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Your profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Account</h1>
      </div>

      <div className="grid gap-8 py-8 lg:grid-cols-2">
        {/* Personal Info */}
        <section className="border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center bg-muted text-primary"><UserRound size={20} /></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Personal information</p>
          </div>

          {message && <div className="mt-4 border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{message}</div>}

          <form onSubmit={handleUpdateProfile} className="mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-bold">
              Full name
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 border border-border bg-background px-4 outline-none focus:border-primary" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Email
              <input value={profile?.email || ''} disabled className="h-12 border border-border bg-muted px-4 text-muted-foreground" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Member since
              <input value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''} disabled className="h-12 border border-border bg-muted px-4 text-muted-foreground" />
            </label>
            <button type="submit" disabled={saving} className="h-12 bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">
              {saving ? 'Saving...' : 'Update profile'}
            </button>
          </form>
        </section>

        {/* KYC Verification */}
        <section className="border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center bg-muted text-primary"><ShieldCheck size={20} /></div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Identity verification</p>
              <span className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${kycStatusColors[profile?.kyc_status || ''] || 'bg-muted text-muted-foreground'}`}>
                {profile?.kyc_status?.replace('_', ' ') || 'Not started'}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-4">
            {docTypes.map((dt, i) => {
              const status = getDocStatus(dt.key)
              return (
                <div key={dt.key} className="flex items-start gap-3">
                  <div className={`mt-0.5 grid size-6 place-items-center text-xs ${status === 'approved' ? 'bg-green-500 text-white' : status === 'pending' ? 'bg-yellow-500 text-white' : 'border border-border'}`}>
                    {status === 'approved' ? <Check size={14} /> : (i + 1)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{dt.label}</p>
                    {status ? (
                      <p className={`mt-1 text-xs capitalize ${status === 'approved' ? 'text-green-600' : status === 'rejected' ? 'text-primary' : 'text-yellow-600'}`}>{status}</p>
                    ) : (
                      <label className="mt-2 flex cursor-pointer items-center gap-2 border border-dashed border-border p-3 text-xs text-muted-foreground hover:border-primary">
                        <Upload size={14} />
                        {uploading === dt.key ? 'Uploading...' : 'Upload document'}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={e => { if (e.target.files?.[0]) handleUpload(dt.key, e.target.files[0]) }}
                          disabled={uploading === dt.key}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </PlatformShell>
  )
}
