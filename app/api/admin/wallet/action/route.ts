import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Use authenticated supabase client (which has admin auth context for RLS policies)
    // and fallback to adminSupabase if needed
    const db = supabase

    if (action === 'update_balance') {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
      }

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

      return NextResponse.json({ success: true, profile: data })
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

      // Fetch user current wallet_balance
      const { data: targetUser } = await db
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single()

      const current = Number(targetUser?.wallet_balance || 0)
      const newBal = current + Number(amount)

      await db.from('profiles').update({ wallet_balance: newBal }).eq('id', userId)
      await db.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: Number(amount),
        description: `Approved deposit (${currency || 'USD'})`,
      })

      return NextResponse.json({ success: true, newBalance: newBal })
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
        .select('wallet_balance')
        .eq('id', userId)
        .single()

      const current = Number(targetUser?.wallet_balance || 0)
      const newBal = Math.max(0, current - Number(amount))

      await db.from('profiles').update({ wallet_balance: newBal }).eq('id', userId)
      await db.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: -Number(amount),
        description: `Approved withdrawal to ${destinationAddress ? destinationAddress.slice(0, 10) + '...' : 'external address'}`,
      })

      return NextResponse.json({ success: true, newBalance: newBal })
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
