import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 })
    }

    const db = createAdminClient()

    const { data: rawDocuments, error: docsError } = await db
      .from('kyc_documents')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: users, error: usersError } = await db
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, vip_tier, kyc_status, is_kyc_mandated, created_at, updated_at')
      .order('email', { ascending: true })

    if (docsError || usersError) {
      return NextResponse.json({
        error: docsError?.message || usersError?.message
      }, { status: 500 })
    }

    const usersMap = new Map((users || []).map(u => [u.id, u]))
    const documents = (rawDocuments || []).map(doc => ({
      ...doc,
      user: usersMap.get(doc.user_id) || null
    }))

    return NextResponse.json({ documents, users: users || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 })
    }

    const body = await req.json()
    const { action, payload } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter.' }, { status: 400 })
    }

    const db = createAdminClient()

    // ────────────────────────────────────────────────────────────
    // ACTION: CREATE KYC DOCUMENT
    // ────────────────────────────────────────────────────────────
    if (action === 'create') {
      const {
        user_id,
        doc_type,
        file_url,
        status = 'approved',
        admin_notes = '',
        sync_profile = true,
        is_kyc_mandated,
      } = payload || {}

      if (!user_id || !doc_type || !file_url) {
        return NextResponse.json({
          error: 'Missing required fields: user_id, doc_type, and file_url are required.'
        }, { status: 400 })
      }

      const validDocTypes = ['government_id', 'passport', 'proof_of_address']
      if (!validDocTypes.includes(doc_type)) {
        return NextResponse.json({
          error: `Invalid doc_type. Must be one of: ${validDocTypes.join(', ')}`
        }, { status: 400 })
      }

      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        }, { status: 400 })
      }

      const now = new Date().toISOString()
      const insertRecord = {
        user_id,
        doc_type,
        file_url,
        status,
        admin_notes: admin_notes ? String(admin_notes).trim() : null,
        reviewed_by: status !== 'pending' ? user.id : null,
        reviewed_at: status !== 'pending' ? now : null,
      }

      const { data: createdDoc, error: insertError } = await db
        .from('kyc_documents')
        .insert(insertRecord)
        .select('*')
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      // Sync user profile KYC status if requested
      if (sync_profile && ['approved', 'rejected', 'pending'].includes(status)) {
        await db
          .from('profiles')
          .update({ kyc_status: status })
          .eq('id', user_id)
      }

      // Mandate toggle if provided
      if (typeof is_kyc_mandated === 'boolean') {
        await db
          .from('profiles')
          .update({ is_kyc_mandated })
          .eq('id', user_id)
      }

      const { data: userProfile } = await db
        .from('profiles')
        .select('id, email, full_name, kyc_status, is_kyc_mandated, avatar_url, role, vip_tier')
        .eq('id', user_id)
        .single()

      return NextResponse.json({
        success: true,
        document: { ...createdDoc, user: userProfile || null }
      })
    }

    // ────────────────────────────────────────────────────────────
    // ACTION: UPDATE KYC DOCUMENT
    // ────────────────────────────────────────────────────────────
    if (action === 'update') {
      const {
        id,
        user_id,
        doc_type,
        file_url,
        status,
        admin_notes,
        sync_profile = true
      } = payload || {}

      if (!id) {
        return NextResponse.json({ error: 'Missing document id.' }, { status: 400 })
      }

      const updates: Record<string, unknown> = {}
      if (doc_type) updates.doc_type = doc_type
      if (file_url) updates.file_url = file_url
      if (admin_notes !== undefined) {
        updates.admin_notes = admin_notes ? String(admin_notes).trim() : null
      }

      if (status) {
        updates.status = status
        if (status !== 'pending') {
          updates.reviewed_by = user.id
          updates.reviewed_at = new Date().toISOString()
        } else {
          updates.reviewed_by = null
          updates.reviewed_at = null
        }
      }

      const { data: updatedDoc, error: updateError } = await db
        .from('kyc_documents')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      const targetUserId = user_id || updatedDoc?.user_id
      if (sync_profile && targetUserId && status) {
        await db
          .from('profiles')
          .update({ kyc_status: status })
          .eq('id', targetUserId)
      }

      let userProfile = null
      if (targetUserId) {
        const { data: u } = await db
          .from('profiles')
          .select('id, email, full_name, kyc_status, is_kyc_mandated, avatar_url, role, vip_tier')
          .eq('id', targetUserId)
          .single()
        userProfile = u
      }

      return NextResponse.json({
        success: true,
        document: { ...updatedDoc, user: userProfile }
      })
    }

    // ────────────────────────────────────────────────────────────
    // ACTION: QUICK REVIEW (APPROVE / REJECT / PENDING)
    // ────────────────────────────────────────────────────────────
    if (action === 'quick_review') {
      const { id, user_id, status, admin_notes } = payload || {}

      if (!id || !status) {
        return NextResponse.json({ error: 'Missing id or status.' }, { status: 400 })
      }

      const isPending = status === 'pending'
      const updates: Record<string, unknown> = {
        status,
        reviewed_by: isPending ? null : user.id,
        reviewed_at: isPending ? null : new Date().toISOString(),
      }

      if (admin_notes !== undefined) {
        updates.admin_notes = admin_notes ? String(admin_notes).trim() : null
      }

      const { data: doc, error: docError } = await db
        .from('kyc_documents')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()

      if (docError) {
        return NextResponse.json({ error: docError.message }, { status: 500 })
      }

      const targetUserId = user_id || doc?.user_id
      if (targetUserId) {
        await db
          .from('profiles')
          .update({ kyc_status: status })
          .eq('id', targetUserId)
      }

      let userProfile = null
      if (targetUserId) {
        const { data: u } = await db
          .from('profiles')
          .select('id, email, full_name, kyc_status, is_kyc_mandated, avatar_url, role, vip_tier')
          .eq('id', targetUserId)
          .single()
        userProfile = u
      }

      return NextResponse.json({
        success: true,
        document: { ...doc, user: userProfile }
      })
    }

    // ────────────────────────────────────────────────────────────
    // ACTION: DELETE KYC DOCUMENT
    // ────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { id, user_id, reset_profile_if_no_docs = true } = payload || {}

      if (!id) {
        return NextResponse.json({ error: 'Missing document id.' }, { status: 400 })
      }

      let targetUserId = user_id
      if (!targetUserId) {
        const { data: existing } = await db
          .from('kyc_documents')
          .select('user_id')
          .eq('id', id)
          .single()
        targetUserId = existing?.user_id
      }

      const { error: deleteError } = await db
        .from('kyc_documents')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      let updatedProfileStatus = null
      if (reset_profile_if_no_docs && targetUserId) {
        const { data: remaining } = await db
          .from('kyc_documents')
          .select('id, status')
          .eq('user_id', targetUserId)

        const hasApproved = remaining?.some(d => d.status === 'approved')
        const hasPending = remaining?.some(d => d.status === 'pending')
        const hasRejected = remaining?.some(d => d.status === 'rejected')

        const newStatus = hasApproved ? 'approved' : hasPending ? 'pending' : hasRejected ? 'rejected' : 'not_started'
        
        await db
          .from('profiles')
          .update({ kyc_status: newStatus })
          .eq('id', targetUserId)

        updatedProfileStatus = newStatus
      }

      return NextResponse.json({
        success: true,
        id,
        userId: targetUserId,
        updatedProfileStatus
      })
    }

    // ────────────────────────────────────────────────────────────
    // ACTION: DIRECT USER KYC STATUS UPDATE
    // ────────────────────────────────────────────────────────────
    if (action === 'update_user_kyc') {
      const { user_id, kyc_status, is_kyc_mandated } = payload || {}

      if (!user_id) {
        return NextResponse.json({ error: 'Missing user_id.' }, { status: 400 })
      }

      const updates: Record<string, unknown> = {}
      if (kyc_status) {
        const validKyc = ['not_started', 'pending', 'approved', 'rejected']
        if (!validKyc.includes(kyc_status)) {
          return NextResponse.json({
            error: `Invalid kyc_status. Must be one of: ${validKyc.join(', ')}`
          }, { status: 400 })
        }
        updates.kyc_status = kyc_status
      }

      if (typeof is_kyc_mandated === 'boolean') {
        updates.is_kyc_mandated = is_kyc_mandated
      }

      const { data: updatedProfile, error: profileError } = await db
        .from('profiles')
        .update(updates)
        .eq('id', user_id)
        .select('id, email, full_name, avatar_url, role, vip_tier, kyc_status, is_kyc_mandated')
        .single()

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        profile: updatedProfile
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
