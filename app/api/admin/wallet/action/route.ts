import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionAlertEmail } from '@/lib/emails/transaction-alert'

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
    const { action, userId, wallet_balance, realized_pnl, unrealized_pnl, requestId, amount, currency, destinationAddress } = body

    let db = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        db = createAdminClient()
      } catch (e) {
        console.warn('[Admin Wallet] Failed to init admin client, falling back to authenticated client', e)
        db = supabase
      }
    }

    if (action === 'update_balance') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
      }

      // Fetch user profile before update to check balance diff and email
      const { data: existingUser } = await db
        .from('profiles')
        .select('id, email, full_name, wallet_balance')
        .eq('id', userId)
        .single()

      const updates: Record<string, number> = {}
      if (wallet_balance !== undefined) updates.wallet_balance = parseFloat(wallet_balance)
      if (realized_pnl !== undefined) updates.realized_pnl = parseFloat(realized_pnl)
      if (unrealized_pnl !== undefined) updates.unrealized_pnl = parseFloat(unrealized_pnl)

      const { data, error } = await db
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      let emailResult = null

      // If wallet_balance was modified, record transaction and send alert email
      if (wallet_balance !== undefined && existingUser) {
        const oldBal = Number(existingUser.wallet_balance || 0)
        const newBal = Number(updates.wallet_balance)
        const diff = newBal - oldBal

        if (Math.abs(diff) >= 0.01) {
          const type = diff > 0 ? 'deposit' : 'withdrawal'
          const refId = `TSL-${type === 'deposit' ? 'DEP' : 'WTH'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

          try {
            await db.from('transactions').insert({
              user_id: userId,
              type,
              amount: diff,
              description: type === 'deposit' ? 'Deposit settlement' : 'Withdrawal transaction',
              reference_id: refId,
            })
          } catch (txErr) {
            console.warn('[Admin Wallet] Failed to log transaction:', txErr)
          }

          let recipientEmail = existingUser.email
          if (!recipientEmail && (db as any).auth?.admin) {
            try {
              const authRes = await (db as any).auth.admin.getUserById(userId)
              recipientEmail = authRes?.data?.user?.email || null
            } catch {}
          }

          emailResult = await sendTransactionAlertEmail({
            userId,
            to: recipientEmail || '',
            userName: existingUser.full_name,
            type,
            amount: Math.abs(diff),
            newBalance: newBal,
            currency: 'USD',
            referenceId: refId,
          })
        }
      }

      return NextResponse.json({ success: true, profile: data, email: emailResult })
    }

    if (action === 'approve_deposit') {
      if (!requestId || !userId) {
        return NextResponse.json({ error: 'Missing requestId or userId' }, { status: 400 })
      }

      // Mark request approved
      const { error: depErr } = await db
        .from('deposit_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)

      if (depErr) return NextResponse.json({ error: depErr.message }, { status: 500 })

      // Fetch user current wallet_balance and contact info
      const { data: targetUser } = await db
        .from('profiles')
        .select('email, full_name, wallet_balance')
        .eq('id', userId)
        .single()

      const current = Number(targetUser?.wallet_balance || 0)
      const newBal = current + Number(amount)
      const refId = `TSL-DEP-${requestId.slice(0, 8).toUpperCase()}`

      await db.from('profiles').update({ wallet_balance: newBal }).eq('id', userId)
      await db.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: Number(amount),
        description: `Approved deposit (${currency || 'USD'})`,
        reference_id: refId,
      })

      let emailResult = null
      let recipientEmail = targetUser?.email
      if (!recipientEmail && (db as any).auth?.admin) {
        try {
          const authRes = await (db as any).auth.admin.getUserById(userId)
          recipientEmail = authRes?.data?.user?.email || null
        } catch {}
      }

      if (recipientEmail) {
        emailResult = await sendTransactionAlertEmail({
          userId,
          to: recipientEmail,
          userName: targetUser?.full_name,
          type: 'deposit',
          amount: Number(amount),
          newBalance: newBal,
          currency: currency || 'USD',
          referenceId: refId,
        })
      }

      return NextResponse.json({ success: true, newBalance: newBal, email: emailResult })
    }

    if (action === 'reject_deposit') {
      if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
      const { error } = await db
        .from('deposit_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'approve_withdrawal') {
      if (!requestId || !userId) {
        return NextResponse.json({ error: 'Missing requestId or userId' }, { status: 400 })
      }

      const { error: withErr } = await db
        .from('withdrawal_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)

      if (withErr) return NextResponse.json({ error: withErr.message }, { status: 500 })

      const { data: targetUser } = await db
        .from('profiles')
        .select('email, full_name, wallet_balance')
        .eq('id', userId)
        .single()

      const current = Number(targetUser?.wallet_balance || 0)
      const newBal = Math.max(0, current - Number(amount))
      const refId = `TSL-WTH-${requestId.slice(0, 8).toUpperCase()}`

      await db.from('profiles').update({ wallet_balance: newBal }).eq('id', userId)
      await db.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: -Number(amount),
        description: `Approved withdrawal to ${destinationAddress ? destinationAddress.slice(0, 10) + '...' : 'external address'}`,
        reference_id: refId,
      })

      let emailResult = null
      let recipientEmail = targetUser?.email
      if (!recipientEmail && (db as any).auth?.admin) {
        try {
          const authRes = await (db as any).auth.admin.getUserById(userId)
          recipientEmail = authRes?.data?.user?.email || null
        } catch {}
      }

      if (recipientEmail) {
        emailResult = await sendTransactionAlertEmail({
          userId,
          to: recipientEmail,
          userName: targetUser?.full_name,
          type: 'withdrawal',
          amount: Number(amount),
          newBalance: newBal,
          currency: currency || 'USD',
          referenceId: refId,
        })
      }

      return NextResponse.json({ success: true, newBalance: newBal, email: emailResult })
    }

    if (action === 'reject_withdrawal') {
      if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
      const { error } = await db
        .from('withdrawal_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Wallet API Error]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
