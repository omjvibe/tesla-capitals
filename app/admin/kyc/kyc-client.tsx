'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Search,
  Filter,
  ExternalLink,
  FileText,
  Upload,
  UserRound,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  CheckCheck,
  Download,
  Users,
  FileCheck
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { KycDocument, Profile, KycDocType, KycDocStatus, KycStatus } from '@/types'

const DOC_TYPE_LABELS: Record<KycDocType, string> = {
  government_id: 'Government ID',
  passport: 'Passport',
  proof_of_address: 'Proof of Address',
}

interface AdminKycClientProps {
  documents: KycDocument[]
  users: Profile[]
  adminId: string
}

export function AdminKycClient({ documents: initialDocs, users: initialUsers, adminId }: AdminKycClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Main collections state
  const [docs, setDocs] = useState<KycDocument[]>(initialDocs)
  const [users, setUsers] = useState<Profile[]>(initialUsers)

  // View & Filter states
  const [activeTab, setActiveTab] = useState<'documents' | 'pending' | 'approved' | 'rejected' | 'users'>('documents')
  const [search, setSearch] = useState('')
  const [filterDocType, setFilterDocType] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [userKycFilter, setUserKycFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Loading indicator for asynchronous actions
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  // ────────────────────────────────────────────────────────────
  // MODAL STATES
  // ────────────────────────────────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState<KycDocument | null>(null)
  const [editingDoc, setEditingDoc] = useState<KycDocument | null>(null)
  const [deletingDoc, setDeletingDoc] = useState<KycDocument | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userStatusModal, setUserStatusModal] = useState<Profile | null>(null)

  // Create Form State
  const [createUserId, setCreateUserId] = useState('')
  const [createDocType, setCreateDocType] = useState<KycDocType>('government_id')
  const [createStatus, setCreateStatus] = useState<KycDocStatus>('approved')
  const [createSourceType, setCreateSourceType] = useState<'upload' | 'url'>('upload')
  const [createFileUrl, setCreateFileUrl] = useState('')
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [createFilePreview, setCreateFilePreview] = useState<string | null>(null)
  const [createAdminNotes, setCreateAdminNotes] = useState('')
  const [createSyncProfile, setCreateSyncProfile] = useState(true)
  const [createMandateKyc, setCreateMandateKyc] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Edit Form State
  const [editDocType, setEditDocType] = useState<KycDocType>('government_id')
  const [editStatus, setEditStatus] = useState<KycDocStatus>('approved')
  const [editSourceType, setEditSourceType] = useState<'url' | 'upload'>('url')
  const [editFileUrl, setEditFileUrl] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null)
  const [editAdminNotes, setEditAdminNotes] = useState('')
  const [editSyncProfile, setEditSyncProfile] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Delete Options State
  const [deleteResetProfile, setDeleteResetProfile] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Quick User Status State
  const [targetUserStatus, setTargetUserStatus] = useState<KycStatus>('approved')
  const [targetUserMandated, setTargetUserMandated] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)

  // ────────────────────────────────────────────────────────────
  // KPI CALCULATIONS
  // ────────────────────────────────────────────────────────────
  const pendingCount = useMemo(() => docs.filter(d => d.status === 'pending').length, [docs])
  const approvedCount = useMemo(() => docs.filter(d => d.status === 'approved').length, [docs])
  const rejectedCount = useMemo(() => docs.filter(d => d.status === 'rejected').length, [docs])
  const mandatedUsersCount = useMemo(() => users.filter(u => u.is_kyc_mandated).length, [users])

  // Count of documents per user
  const userDocCountMap = useMemo(() => {
    const map = new Map<string, number>()
    docs.forEach(d => {
      map.set(d.user_id, (map.get(d.user_id) || 0) + 1)
    })
    return map
  }, [docs])

  // Users map for fast lookup
  const usersMap = useMemo(() => {
    return new Map<string, Profile>(users.map(u => [u.id, u]))
  }, [users])

  // ────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────
  const getDocUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url
    }
    const supabase = createClient()
    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(url)
    return data.publicUrl
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast('Copied to Clipboard', text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const uploadFile = async (file: File, userId: string, docType: string): Promise<string> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'png'
    const path = `admin-uploads/${userId}_${docType}_${Date.now()}.${ext}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        // Fallback to Base64 data URL
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const { data: { publicUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(path)
      return publicUrl
    } catch {
      // Fallback to base64
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }
  }

  // ────────────────────────────────────────────────────────────
  // CRUD OPERATIONS
  // ────────────────────────────────────────────────────────────

  // 1. CREATE KYC DOCUMENT
  const handleOpenCreate = (prefillUserId?: string) => {
    const defaultUserId = prefillUserId || (users.length > 0 ? users[0].id : '')
    setCreateUserId(defaultUserId)
    setCreateDocType('government_id')
    setCreateStatus('approved')
    setCreateSourceType('upload')
    setCreateFileUrl('')
    setCreateFile(null)
    setCreateFilePreview(null)
    setCreateAdminNotes('Verified by Administrator')
    setCreateSyncProfile(true)
    const targetUser = usersMap.get(defaultUserId)
    setCreateMandateKyc(targetUser?.is_kyc_mandated || false)
    setShowCreateModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isEdit) {
      setEditFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => setEditFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setEditFilePreview(null)
      }
    } else {
      setCreateFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => setCreateFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setCreateFilePreview(null)
      }
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createUserId) {
      toast('Select a User', 'Please select a user for this KYC record.', 'error')
      return
    }

    setIsCreating(true)
    try {
      let finalFileUrl = createFileUrl.trim()

      if (createSourceType === 'upload') {
        if (!createFile && !finalFileUrl) {
          toast('Missing File', 'Please select a document file to upload or enter a URL.', 'error')
          setIsCreating(false)
          return
        }
        if (createFile) {
          finalFileUrl = await uploadFile(createFile, createUserId, createDocType)
        }
      }

      if (!finalFileUrl) {
        toast('Missing File URL', 'Please provide a file or URL for this document.', 'error')
        setIsCreating(false)
        return
      }

      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          payload: {
            user_id: createUserId,
            doc_type: createDocType,
            file_url: finalFileUrl,
            status: createStatus,
            admin_notes: createAdminNotes,
            sync_profile: createSyncProfile,
            is_kyc_mandated: createMandateKyc,
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create KYC document.')
      }

      const newDoc: KycDocument = data.document
      const attachedUser = usersMap.get(createUserId)
      newDoc.user = newDoc.user || attachedUser

      setDocs(prev => [newDoc, ...prev])

      // Update user in users list
      if (createSyncProfile) {
        setUsers(prev => prev.map(u => u.id === createUserId ? {
          ...u,
          kyc_status: createStatus as KycStatus,
          is_kyc_mandated: createMandateKyc
        } : u))
      } else if (createMandateKyc !== undefined) {
        setUsers(prev => prev.map(u => u.id === createUserId ? {
          ...u,
          is_kyc_mandated: createMandateKyc
        } : u))
      }

      toast('KYC Record Created', `Successfully created ${DOC_TYPE_LABELS[createDocType]} for ${attachedUser?.full_name || attachedUser?.email || createUserId}.`)
      setShowCreateModal(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating document'
      toast('Creation Failed', msg, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  // 2. EDIT KYC DOCUMENT
  const handleOpenEdit = (doc: KycDocument) => {
    setEditingDoc(doc)
    setEditDocType(doc.doc_type)
    setEditStatus(doc.status)
    setEditSourceType('url')
    setEditFileUrl(doc.file_url)
    setEditFile(null)
    setEditFilePreview(null)
    setEditAdminNotes(doc.admin_notes || '')
    setEditSyncProfile(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoc) return

    setIsEditing(true)
    try {
      let finalFileUrl = editFileUrl.trim()

      if (editSourceType === 'upload' && editFile) {
        finalFileUrl = await uploadFile(editFile, editingDoc.user_id, editDocType)
      }

      if (!finalFileUrl) {
        toast('Missing File URL', 'Please provide a file or URL for this document.', 'error')
        setIsEditing(false)
        return
      }

      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          payload: {
            id: editingDoc.id,
            user_id: editingDoc.user_id,
            doc_type: editDocType,
            file_url: finalFileUrl,
            status: editStatus,
            admin_notes: editAdminNotes,
            sync_profile: editSyncProfile,
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update document.')
      }

      const updatedDoc: KycDocument = data.document
      const attachedUser = usersMap.get(editingDoc.user_id)
      updatedDoc.user = updatedDoc.user || attachedUser

      setDocs(prev => prev.map(d => d.id === editingDoc.id ? updatedDoc : d))

      if (previewDoc?.id === editingDoc.id) {
        setPreviewDoc(updatedDoc)
      }

      if (editSyncProfile) {
        setUsers(prev => prev.map(u => u.id === editingDoc.user_id ? {
          ...u,
          kyc_status: editStatus as KycStatus
        } : u))
      }

      toast('KYC Document Updated', `Updated ${DOC_TYPE_LABELS[editDocType]} record.`)
      setEditingDoc(null)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating document'
      toast('Update Failed', msg, 'error')
    } finally {
      setIsEditing(false)
    }
  }

  // 3. QUICK REVIEW (APPROVE / REJECT / RESET)
  const handleQuickReview = async (docId: string, userId: string, status: 'approved' | 'rejected' | 'pending') => {
    setLoadingAction(docId)
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_review',
          payload: {
            id: docId,
            user_id: userId,
            status,
            admin_notes: status === 'approved' ? 'Approved by Admin' : status === 'rejected' ? 'Rejected by Admin' : null
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update review status.')
      }

      const updatedDoc: KycDocument = data.document
      const attachedUser = usersMap.get(userId)
      updatedDoc.user = updatedDoc.user || attachedUser

      setDocs(prev => prev.map(d => d.id === docId ? updatedDoc : d))
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc_status: status as KycStatus } : u))

      if (previewDoc?.id === docId) {
        setPreviewDoc(updatedDoc)
      }

      toast(
        status === 'approved' ? 'KYC Approved' : status === 'rejected' ? 'KYC Rejected' : 'KYC Reset to Pending',
        `Document for ${attachedUser?.full_name || attachedUser?.email || userId} is now ${status}.`
      )
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating review'
      toast('Action Failed', msg, 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  // 4. DELETE KYC DOCUMENT
  const handleOpenDelete = (doc: KycDocument) => {
    setDeletingDoc(doc)
    setDeleteResetProfile(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return
    setIsDeleting(true)

    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          payload: {
            id: deletingDoc.id,
            user_id: deletingDoc.user_id,
            reset_profile_if_no_docs: deleteResetProfile
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete document.')
      }

      setDocs(prev => prev.filter(d => d.id !== deletingDoc.id))

      if (data.updatedProfileStatus) {
        setUsers(prev => prev.map(u => u.id === deletingDoc.user_id ? {
          ...u,
          kyc_status: data.updatedProfileStatus
        } : u))
      }

      if (previewDoc?.id === deletingDoc.id) {
        setPreviewDoc(null)
      }

      toast('KYC Document Deleted', `Document removed. User status: ${data.updatedProfileStatus || 'unchanged'}`)
      setDeletingDoc(null)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting document'
      toast('Delete Failed', msg, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // 5. DIRECT USER KYC STATUS & MANDATE UPDATE
  const handleOpenUserStatus = (user: Profile) => {
    setUserStatusModal(user)
    setTargetUserStatus(user.kyc_status || 'not_started')
    setTargetUserMandated(!!user.is_kyc_mandated)
  }

  const handleUserStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userStatusModal) return

    setIsUpdatingUser(true)
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user_kyc',
          payload: {
            user_id: userStatusModal.id,
            kyc_status: targetUserStatus,
            is_kyc_mandated: targetUserMandated
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user KYC status.')
      }

      const updatedProfile: Profile = data.profile

      setUsers(prev => prev.map(u => u.id === userStatusModal.id ? { ...u, ...updatedProfile } : u))
      setDocs(prev => prev.map(d => d.user_id === userStatusModal.id ? {
        ...d,
        user: { ...d.user, ...updatedProfile } as Profile
      } : d))

      toast('User KYC Updated', `${userStatusModal.full_name || userStatusModal.email} verification set to ${targetUserStatus.toUpperCase()}.`)
      setUserStatusModal(null)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating user'
      toast('Update Failed', msg, 'error')
    } finally {
      setIsUpdatingUser(false)
    }
  }

  // Direct toggle mandate for user
  const handleToggleMandate = async (userId: string, current: boolean) => {
    setLoadingAction(`mandate_${userId}`)
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user_kyc',
          payload: {
            user_id: userId,
            is_kyc_mandated: !current
          }
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to toggle mandate.')

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_kyc_mandated: !current } : u))
      toast('Mandate Updated', `KYC verification is now ${!current ? 'MANDATORY' : 'OPTIONAL'} for this user.`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating mandate'
      toast('Action Failed', msg, 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  // ────────────────────────────────────────────────────────────
  // FILTERING LOGIC
  // ────────────────────────────────────────────────────────────
  const filteredDocs = useMemo(() => {
    return docs
      .filter(d => {
        // Tab filter
        if (activeTab === 'pending' && d.status !== 'pending') return false
        if (activeTab === 'approved' && d.status !== 'approved') return false
        if (activeTab === 'rejected' && d.status !== 'rejected') return false

        // Doc type filter
        if (filterDocType !== 'all' && d.doc_type !== filterDocType) return false

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase()
          const userName = (d.user?.full_name || '').toLowerCase()
          const userEmail = (d.user?.email || '').toLowerCase()
          const userId = d.user_id.toLowerCase()
          const docId = d.id.toLowerCase()
          const notes = (d.admin_notes || '').toLowerCase()
          const typeLabel = DOC_TYPE_LABELS[d.doc_type]?.toLowerCase() || ''

          const matches =
            userName.includes(q) ||
            userEmail.includes(q) ||
            userId.includes(q) ||
            docId.includes(q) ||
            notes.includes(q) ||
            typeLabel.includes(q)

          if (!matches) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        } else {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
      })
  }, [docs, activeTab, filterDocType, search, sortOrder])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (userKycFilter !== 'all' && u.kyc_status !== userKycFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const name = (u.full_name || '').toLowerCase()
        const email = u.email.toLowerCase()
        const id = u.id.toLowerCase()
        if (!name.includes(q) && !email.includes(q) && !id.includes(q)) return false
      }
      return true
    })
  }, [users, userKycFilter, search])

  return (
    <PlatformShell admin>
      {/* ────────────────────────────────────────────────────────────
          PAGE HEADER
      ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Compliance &amp; Identity Verification</p>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">KYC Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete administrative CRUD control over identity documents, review queues, user verification states, and mandate enforcement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Add KYC Record
          </button>
          <button
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 border border-border bg-card px-3 py-2.5 text-xs font-bold hover:border-foreground active:scale-95 transition-all"
            title="Refresh database records"
          >
            <RefreshCw size={14} className={loadingAction ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          METRIC KPI CARDS
      ──────────────────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div
          onClick={() => setActiveTab('documents')}
          className={`cursor-pointer border p-4 transition-all ${
            activeTab === 'documents' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-widest">Total Documents</span>
            <FileText size={16} />
          </div>
          <p className="mt-3 text-2xl font-bold">{docs.length}</p>
          <span className="font-mono text-[10px] text-muted-foreground">All submitted files</span>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={`cursor-pointer border p-4 transition-all ${
            activeTab === 'pending'
              ? 'border-yellow-500 bg-yellow-500/10'
              : pendingCount > 0
              ? 'border-yellow-500/40 bg-yellow-500/5 hover:border-yellow-500'
              : 'border-border bg-card hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between text-yellow-500">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Pending Review</span>
            <Clock size={16} />
          </div>
          <p className="mt-3 text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <span className="font-mono text-[10px] text-muted-foreground">Requires admin action</span>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={`cursor-pointer border p-4 transition-all ${
            activeTab === 'approved' ? 'border-green-600 bg-green-500/10' : 'border-border bg-card hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between text-green-600">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Approved</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="mt-3 text-2xl font-bold text-green-600">{approvedCount}</p>
          <span className="font-mono text-[10px] text-muted-foreground">Verified &amp; Active</span>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={`cursor-pointer border p-4 transition-all ${
            activeTab === 'rejected' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between text-primary">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Rejected</span>
            <XCircle size={16} />
          </div>
          <p className="mt-3 text-2xl font-bold text-primary">{rejectedCount}</p>
          <span className="font-mono text-[10px] text-muted-foreground">Declined submissions</span>
        </div>

        <div
          onClick={() => setActiveTab('users')}
          className={`cursor-pointer border p-4 transition-all col-span-2 sm:col-span-1 ${
            activeTab === 'users' ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-card hover:border-foreground/40'
          }`}
        >
          <div className="flex items-center justify-between text-blue-500">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Mandated Users</span>
            <ShieldAlert size={16} />
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-500">{mandatedUsersCount}</p>
          <span className="font-mono text-[10px] text-muted-foreground">{users.length} total registered</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          TABS & TOOLBAR
      ──────────────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Main Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-2 lg:border-0 lg:pb-0">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'documents'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Documents ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'border-b-2 border-yellow-500 text-yellow-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="rounded-full bg-yellow-500/20 px-1.5 py-0.2 text-[10px] font-mono text-yellow-500">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'approved'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'rejected'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1 px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={14} /> User Directory ({users.length})
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="flex flex-1 min-w-[220px] items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === 'users' ? 'Search user name, email, ID...' : 'Search document, user, notes...'}
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            )}
          </div>

          {activeTab !== 'users' ? (
            <>
              {/* Doc Type Selector */}
              <div className="flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs">
                <Filter size={13} className="text-muted-foreground" />
                <select
                  value={filterDocType}
                  onChange={e => setFilterDocType(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold"
                >
                  <option value="all" className="bg-card text-foreground">All Document Types</option>
                  <option value="government_id" className="bg-card text-foreground">Government ID</option>
                  <option value="passport" className="bg-card text-foreground">Passport</option>
                  <option value="proof_of_address" className="bg-card text-foreground">Proof of Address</option>
                </select>
              </div>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="border border-border bg-card px-3 py-1.5 text-xs font-bold outline-none"
              >
                <option value="newest" className="bg-card text-foreground">Newest First</option>
                <option value="oldest" className="bg-card text-foreground">Oldest First</option>
              </select>
            </>
          ) : (
            /* User Verification Status Filter */
            <div className="flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs">
              <Filter size={13} className="text-muted-foreground" />
              <select
                value={userKycFilter}
                onChange={e => setUserKycFilter(e.target.value)}
                className="bg-transparent outline-none text-xs font-bold"
              >
                <option value="all" className="bg-card text-foreground">All Verification Statuses</option>
                <option value="not_started" className="bg-card text-foreground">Not Started</option>
                <option value="pending" className="bg-card text-foreground">Pending</option>
                <option value="approved" className="bg-card text-foreground">Approved</option>
                <option value="rejected" className="bg-card text-foreground">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          TAB 1-4: DOCUMENTS QUEUE & RECORDS
      ──────────────────────────────────────────────────────────── */}
      {activeTab !== 'users' && (
        <div className="mt-6 space-y-3">
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => {
              const u = doc.user || usersMap.get(doc.user_id)
              const userInitials = (u?.full_name || u?.email || 'U').slice(0, 2).toUpperCase()
              const isPending = doc.status === 'pending'
              const isApproved = doc.status === 'approved'
              const isRejected = doc.status === 'rejected'

              return (
                <div
                  key={doc.id}
                  className={`flex flex-col gap-4 border bg-card p-5 transition-all hover:border-foreground/30 md:flex-row md:items-center md:justify-between ${
                    isPending ? 'border-yellow-500/40 bg-yellow-500/[0.02]' : 'border-border'
                  }`}
                >
                  {/* Left: User Identity & Document Specs */}
                  <div className="flex flex-1 items-start gap-4 min-w-0">
                    {/* User Initials Avatar */}
                    <div className="grid size-11 shrink-0 place-items-center bg-foreground font-mono text-xs font-bold text-background">
                      {userInitials}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold truncate">
                          {u?.full_name || 'Unnamed Member'}
                        </p>
                        <span className="text-xs text-muted-foreground">({u?.email || 'No email'})</span>

                        {/* Document Type Badge */}
                        <span className="border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                        </span>

                        {/* User Profile KYC Status badge */}
                        {u?.kyc_status && (
                          <span
                            className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                              u.kyc_status === 'approved'
                                ? 'bg-green-500/10 text-green-600'
                                : u.kyc_status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            User: {u.kyc_status}
                          </span>
                        )}

                        {/* Mandated Badge */}
                        {u?.is_kyc_mandated && (
                          <span className="border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-primary">
                            MANDATED
                          </span>
                        )}
                      </div>

                      {/* User & Doc ID copyable metadata */}
                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          User ID: <span className="text-foreground">{doc.user_id.slice(0, 8)}...</span>
                          <button
                            onClick={() => copyToClipboard(doc.user_id, `u_${doc.id}`)}
                            className="hover:text-foreground"
                            title="Copy full User ID"
                          >
                            {copiedId === `u_${doc.id}` ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        </span>

                        <span>·</span>

                        <span>Submitted: {new Date(doc.created_at).toLocaleDateString()} {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {doc.reviewed_at && (
                          <>
                            <span>·</span>
                            <span className="text-muted-foreground">
                              Reviewed: {new Date(doc.reviewed_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Admin Notes Callout */}
                      {doc.admin_notes && (
                        <div className="mt-2 flex items-start gap-1.5 border-l-2 border-primary/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                          <span className="font-mono text-[10px] uppercase font-bold text-primary">Note:</span>
                          <span className="italic">{doc.admin_notes}</span>
                        </div>
                      )}

                      {/* Preview / Direct Link Shortcuts */}
                      <div className="mt-2 flex items-center gap-3 pt-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <Eye size={13} /> View Document
                        </button>
                        <a
                          href={getDocUrl(doc.file_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Direct file link <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 md:border-0 md:pt-0">
                    {/* Status Indicator */}
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase ${
                        isApproved
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                          : isPending
                          ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 animate-pulse'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {isApproved && <Check size={12} />}
                      {isPending && <Clock size={12} />}
                      {isRejected && <X size={12} />}
                      {doc.status}
                    </span>

                    {/* Quick Approve / Reject Buttons */}
                    <div className="flex items-center gap-1">
                      {!isApproved && (
                        <button
                          disabled={loadingAction === doc.id}
                          onClick={() => handleQuickReview(doc.id, doc.user_id, 'approved')}
                          className="flex items-center gap-1 bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
                          title="Approve document and update user KYC to Approved"
                        >
                          <Check size={13} /> Approve
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          disabled={loadingAction === doc.id}
                          onClick={() => handleQuickReview(doc.id, doc.user_id, 'rejected')}
                          className="flex items-center gap-1 bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                          title="Reject document and update user KYC to Rejected"
                        >
                          <X size={13} /> Reject
                        </button>
                      )}

                      {/* Reset to Pending (if approved or rejected) */}
                      {!isPending && (
                        <button
                          disabled={loadingAction === doc.id}
                          onClick={() => handleQuickReview(doc.id, doc.user_id, 'pending')}
                          className="flex items-center gap-1 border border-border bg-card px-2.5 py-1.5 text-xs font-bold hover:border-foreground active:scale-95 transition-all disabled:opacity-50"
                          title="Reset status back to Pending"
                        >
                          <RefreshCw size={12} /> Reset
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="flex items-center gap-1 border border-border bg-card p-1.5 text-muted-foreground hover:border-foreground hover:text-foreground active:scale-95 transition-all"
                        title="Edit document properties & notes"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleOpenDelete(doc)}
                        className="flex items-center gap-1 border border-border bg-card p-1.5 text-muted-foreground hover:border-primary hover:text-primary active:scale-95 transition-all"
                        title="Delete KYC document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="border border-border bg-card py-16 text-center">
              <ShieldCheck size={40} className="mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-base font-bold">No KYC Documents Found</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {search || filterDocType !== 'all' || activeTab !== 'documents'
                  ? 'No documents matched your current search filters.'
                  : 'There are currently no KYC documents submitted.'}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                {(search || filterDocType !== 'all' || activeTab !== 'documents') && (
                  <button
                    onClick={() => {
                      setSearch('')
                      setFilterDocType('all')
                      setActiveTab('documents')
                    }}
                    className="border border-border bg-card px-4 py-2 text-xs font-bold hover:border-foreground"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => handleOpenCreate()}
                  className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                >
                  + Add First Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          TAB 5: USER VERIFICATION DIRECTORY
      ──────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="mt-6 border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>User Identity</span>
            <span>KYC Status</span>
            <span>KYC Mandate</span>
            <span>Submitted Docs</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-border">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => {
                const docCount = userDocCountMap.get(u.id) || 0
                const isMandated = !!u.is_kyc_mandated
                const kycStatus = u.kyc_status || 'not_started'

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                  >
                    {/* User Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-9 shrink-0 place-items-center bg-foreground font-mono text-xs font-bold text-background">
                        {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{u.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">ID: {u.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    {/* KYC Status Badge */}
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase ${
                          kycStatus === 'approved'
                            ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                            : kycStatus === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30'
                            : kycStatus === 'rejected'
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {kycStatus.replace('_', ' ')}
                      </span>
                    </div>

                    {/* KYC Mandate Toggle Button */}
                    <div>
                      <button
                        disabled={loadingAction === `mandate_${u.id}`}
                        onClick={() => handleToggleMandate(u.id, isMandated)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase border transition-all active:scale-95 ${
                          isMandated
                            ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        }`}
                        title={isMandated ? 'Disable Mandatory KYC' : 'Enforce Mandatory KYC'}
                      >
                        {loadingAction === `mandate_${u.id}` ? '...' : isMandated ? 'ENFORCED' : 'OPTIONAL'}
                      </button>
                    </div>

                    {/* Documents Count */}
                    <div className="font-mono text-xs text-center">
                      <span className="font-bold">{docCount}</span> doc{docCount !== 1 ? 's' : ''}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenCreate(u.id)}
                        className="flex items-center gap-1 border border-border bg-background px-2.5 py-1 text-xs font-bold hover:border-primary hover:text-primary active:scale-95 transition-all"
                        title="Upload/Create KYC Document for this user"
                      >
                        <Plus size={12} /> Add Doc
                      </button>
                      <button
                        onClick={() => handleOpenUserStatus(u)}
                        className="flex items-center gap-1 bg-foreground px-2.5 py-1 text-xs font-bold text-background hover:bg-foreground/80 active:scale-95 transition-all"
                        title="Directly edit KYC status"
                      >
                        <Shield size={12} /> Set Status
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No users found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 1: CREATE KYC DOCUMENT
      ──────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Compliance Administration</p>
                <h3 className="text-xl font-bold">Create KYC Verification Record</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Select User / Member <span className="text-primary">*</span>
                </label>
                <select
                  value={createUserId}
                  onChange={e => {
                    setCreateUserId(e.target.value)
                    const selUser = usersMap.get(e.target.value)
                    if (selUser) setCreateMandateKyc(!!selUser.is_kyc_mandated)
                  }}
                  required
                  className="w-full h-11 border border-border bg-background px-3 text-xs outline-none focus:border-primary font-medium"
                >
                  <option value="" disabled>Choose a user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || 'Unnamed'} ({u.email}) — Current KYC: {u.kyc_status}
                    </option>
                  ))}
                </select>
                {createUserId && (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Selected User ID: {createUserId}
                  </p>
                )}
              </div>

              {/* Document Type & Initial Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Document Type <span className="text-primary">*</span>
                  </label>
                  <select
                    value={createDocType}
                    onChange={e => setCreateDocType(e.target.value as KycDocType)}
                    className="w-full h-11 border border-border bg-background px-3 text-xs outline-none focus:border-primary font-bold"
                  >
                    <option value="government_id">Government ID (Driver License / National ID)</option>
                    <option value="passport">Passport</option>
                    <option value="proof_of_address">Proof of Address (Utility Bill / Bank Statement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    Verification Status <span className="text-primary">*</span>
                  </label>
                  <select
                    value={createStatus}
                    onChange={e => setCreateStatus(e.target.value as KycDocStatus)}
                    className="w-full h-11 border border-border bg-background px-3 text-xs outline-none focus:border-primary font-bold"
                  >
                    <option value="approved">Approved (Verified by Admin)</option>
                    <option value="pending">Pending (Review Queue)</option>
                    <option value="rejected">Rejected (Does not meet criteria)</option>
                  </select>
                </div>
              </div>

              {/* Document Source: Upload vs Direct URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold">Document Source</label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setCreateSourceType('upload')}
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 border ${
                        createSourceType === 'upload' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateSourceType('url')}
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 border ${
                        createSourceType === 'url' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                      }`}
                    >
                      Direct URL
                    </button>
                  </div>
                </div>

                {createSourceType === 'upload' ? (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border p-6 text-center hover:border-primary cursor-pointer transition-colors bg-background">
                      <Upload size={24} className="text-muted-foreground mb-2" />
                      <span className="text-xs font-bold">
                        {createFile ? createFile.name : 'Click to select image or document (JPG, PNG, PDF)'}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground mt-1">
                        {createFile ? `${(createFile.size / 1024 / 1024).toFixed(2)} MB` : 'Max 10MB · Stored in kyc-documents bucket'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        onChange={e => handleFileChange(e, false)}
                        className="hidden"
                      />
                    </label>

                    {createFilePreview && (
                      <div className="p-2 border border-border bg-background flex items-center justify-center max-h-40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={createFilePreview} alt="Preview" className="max-h-36 object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={createFileUrl}
                    onChange={e => setCreateFileUrl(e.target.value)}
                    placeholder="https://... or data:image/png;base64,..."
                    className="w-full h-11 border border-border bg-background px-3 text-xs font-mono outline-none focus:border-primary"
                  />
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Admin Notes / Audit Remarks
                </label>
                <textarea
                  rows={2}
                  value={createAdminNotes}
                  onChange={e => setCreateAdminNotes(e.target.value)}
                  placeholder="e.g. Passport expiration verified, matches user identity details."
                  className="w-full border border-border bg-background p-3 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Profile Synchronization Checkboxes */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSyncProfile}
                    onChange={e => setCreateSyncProfile(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>Automatically sync member&apos;s account KYC status to &quot;{createStatus}&quot;</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createMandateKyc}
                    onChange={e => setCreateMandateKyc(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>Enforce mandatory KYC verification for this member</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-border px-4 py-2.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreating ? <RefreshCw size={14} className="animate-spin" /> : <FileCheck size={14} />}
                  {isCreating ? 'Creating...' : 'Create KYC Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 2: EDIT KYC DOCUMENT
      ──────────────────────────────────────────────────────────── */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Edit Document Details</p>
                <h3 className="text-xl font-bold">Update KYC Document</h3>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              {/* User Read-only Card */}
              <div className="border border-border bg-background p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">{editingDoc.user?.full_name || 'Member'}</p>
                  <p className="text-[11px] text-muted-foreground">{editingDoc.user?.email || editingDoc.user_id}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">ID: {editingDoc.id.slice(0, 8)}...</span>
              </div>

              {/* Doc Type & Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Document Type</label>
                  <select
                    value={editDocType}
                    onChange={e => setEditDocType(e.target.value as KycDocType)}
                    className="w-full h-11 border border-border bg-background px-3 text-xs outline-none focus:border-primary font-bold"
                  >
                    <option value="government_id">Government ID</option>
                    <option value="passport">Passport</option>
                    <option value="proof_of_address">Proof of Address</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Review Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as KycDocStatus)}
                    className="w-full h-11 border border-border bg-background px-3 text-xs outline-none focus:border-primary font-bold"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* File URL or Replacement */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold">Document File</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditSourceType('url')}
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 border ${
                        editSourceType === 'url' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSourceType('upload')}
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 border ${
                        editSourceType === 'upload' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                      }`}
                    >
                      Replace File
                    </button>
                  </div>
                </div>

                {editSourceType === 'url' ? (
                  <input
                    type="text"
                    value={editFileUrl}
                    onChange={e => setEditFileUrl(e.target.value)}
                    className="w-full h-11 border border-border bg-background px-3 text-xs font-mono outline-none focus:border-primary"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border p-5 text-center cursor-pointer hover:border-primary bg-background">
                    <Upload size={20} className="text-muted-foreground mb-1" />
                    <span className="text-xs font-bold">
                      {editFile ? editFile.name : 'Select replacement document file'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => handleFileChange(e, true)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editAdminNotes}
                  onChange={e => setEditAdminNotes(e.target.value)}
                  className="w-full border border-border bg-background p-3 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Sync Profile */}
              <div className="border-t border-border pt-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSyncProfile}
                    onChange={e => setEditSyncProfile(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>Sync user&apos;s account KYC status to match &quot;{editStatus}&quot;</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="border border-border px-4 py-2.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isEditing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 3: DELETE KYC DOCUMENT
      ──────────────────────────────────────────────────────────── */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md border border-primary/50 bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete KYC Document?</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete this{' '}
                  <span className="font-bold text-foreground">
                    {DOC_TYPE_LABELS[deletingDoc.doc_type] || deletingDoc.doc_type}
                  </span>{' '}
                  document for{' '}
                  <span className="font-bold text-foreground">
                    {deletingDoc.user?.full_name || deletingDoc.user?.email || deletingDoc.user_id}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <label className="flex items-start gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteResetProfile}
                  onChange={e => setDeleteResetProfile(e.target.checked)}
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="text-muted-foreground">
                  Recalculate user&apos;s KYC status (reverts to Not Started if no other approved documents exist)
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="border border-border px-4 py-2 text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 4: FULL DOCUMENT PREVIEW & DETAIL VIEWER
      ──────────────────────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 my-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                    {DOC_TYPE_LABELS[previewDoc.doc_type] || previewDoc.doc_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      previewDoc.status === 'approved'
                        ? 'bg-green-500/10 text-green-600'
                        : previewDoc.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {previewDoc.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1">
                  {previewDoc.user?.full_name || 'Member'} ({previewDoc.user?.email || 'No email'})
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  User ID: {previewDoc.user_id} · Doc ID: {previewDoc.id}
                </p>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 hover:text-primary transition-colors text-muted-foreground"
              >
                <X size={22} />
              </button>
            </div>

            {/* Document Content Box */}
            <div className="relative min-h-[340px] max-h-[65vh] overflow-auto border border-border bg-background p-4 flex items-center justify-center">
              {previewDoc.file_url?.startsWith('data:image') || previewDoc.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={getDocUrl(previewDoc.file_url)}
                  alt="KYC Document Preview"
                  className="max-h-[58vh] max-w-full object-contain shadow-lg"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <FileText size={56} className="mx-auto text-primary" />
                  <div>
                    <p className="text-base font-bold capitalize">{previewDoc.doc_type.replace('_', ' ')} Document</p>
                    <p className="font-mono text-xs text-muted-foreground break-all max-w-md mx-auto mt-1">
                      {previewDoc.file_url}
                    </p>
                  </div>
                  <a
                    href={getDocUrl(previewDoc.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Open Full Document <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Document Audit Metadata */}
            <div className="grid grid-cols-2 gap-3 border border-border bg-background/50 p-3 text-xs sm:grid-cols-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">Submitted At</span>
                <span className="font-bold">{new Date(previewDoc.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">Reviewed At</span>
                <span className="font-bold">{previewDoc.reviewed_at ? new Date(previewDoc.reviewed_at).toLocaleString() : 'Not reviewed'}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">Reviewer</span>
                <span className="font-bold font-mono text-[11px] truncate block">
                  {previewDoc.reviewed_by ? previewDoc.reviewed_by.slice(0, 8) + '...' : 'None'}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">User Profile Status</span>
                <span className="font-bold capitalize">{previewDoc.user?.kyc_status || 'not_started'}</span>
              </div>
            </div>

            {/* Admin Notes if any */}
            {previewDoc.admin_notes && (
              <div className="border border-border bg-muted/30 p-3 text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-primary block">Admin Notes:</span>
                <p className="mt-1 italic">{previewDoc.admin_notes}</p>
              </div>
            )}

            {/* Footer Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(previewDoc)
                  }}
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-bold hover:border-foreground"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => {
                    handleOpenDelete(previewDoc)
                  }}
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>

              <div className="flex items-center gap-2">
                {previewDoc.status !== 'approved' && (
                  <button
                    onClick={() => handleQuickReview(previewDoc.id, previewDoc.user_id, 'approved')}
                    className="flex items-center gap-1.5 bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                  >
                    <Check size={14} /> Approve Document
                  </button>
                )}

                {previewDoc.status !== 'rejected' && (
                  <button
                    onClick={() => handleQuickReview(previewDoc.id, previewDoc.user_id, 'rejected')}
                    className="flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
                  >
                    <X size={14} /> Reject Document
                  </button>
                )}

                {previewDoc.status !== 'pending' && (
                  <button
                    onClick={() => handleQuickReview(previewDoc.id, previewDoc.user_id, 'pending')}
                    className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-bold hover:border-foreground"
                  >
                    <RefreshCw size={12} /> Reset to Pending
                  </button>
                )}

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="border border-border px-4 py-2 text-xs font-bold hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL 5: DIRECT USER KYC STATUS UPDATE
      ──────────────────────────────────────────────────────────── */}
      {userStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md border border-border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Member Verification</p>
                <h3 className="text-lg font-bold">Set User KYC Status</h3>
              </div>
              <button onClick={() => setUserStatusModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUserStatusSubmit} className="mt-4 space-y-4">
              <div className="border border-border bg-background p-3">
                <p className="text-sm font-bold">{userStatusModal.full_name || 'Unnamed'}</p>
                <p className="text-xs text-muted-foreground">{userStatusModal.email}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">ID: {userStatusModal.id}</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">KYC Status</label>
                <select
                  value={targetUserStatus}
                  onChange={e => setTargetUserStatus(e.target.value as KycStatus)}
                  className="w-full h-11 border border-border bg-background px-3 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetUserMandated}
                    onChange={e => setTargetUserMandated(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>Enforce mandatory KYC verification for this member</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setUserStatusModal(null)}
                  className="border border-border px-4 py-2 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdatingUser ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  {isUpdatingUser ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PlatformShell>
  )
}
