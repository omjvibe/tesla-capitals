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
    const { action, userId, payload } = body

    if (action === 'update_profile') {
      if (!userId || !payload) {
        return NextResponse.json({ error: 'Missing userId or payload' }, { status: 400 })
      }

      // Prevent accidental self-demotion
      if (user.id === userId && payload.role && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Cannot revoke your own admin privileges.' }, { status: 400 })
      }

      // Whitelist allowed fields
      const allowed = [
        'full_name', 'wallet_balance', 'btc_balance', 'eth_balance', 'usdt_balance',
        'realized_pnl', 'unrealized_pnl', 'vip_tier', 'vip_expires_at',
        'kyc_status', 'role', 'is_kyc_mandated',
      ]

      const updates: Record<string, unknown> = {}
      for (const key of allowed) {
        if (payload[key] !== undefined) {
          if (['wallet_balance', 'btc_balance', 'eth_balance', 'usdt_balance', 'realized_pnl', 'unrealized_pnl'].includes(key)) {
            const val = parseFloat(payload[key])
            updates[key] = isNaN(val) ? 0 : val
          } else if (key === 'is_kyc_mandated') {
            updates[key] = Boolean(payload[key])
          } else if (key === 'vip_expires_at') {
            if (!payload[key]) {
              updates[key] = null
            } else {
              const d = new Date(payload[key])
              updates[key] = isNaN(d.getTime()) ? null : d.toISOString()
            }
          } else {
            updates[key] = payload[key]
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
      }

      // Primary client: admin client (service-role) if key is set, fallback to authenticated client
      let db = supabase
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          db = createAdminClient()
        } catch (e) {
          console.warn('[Admin Users] Failed to initialize admin client, falling back to authenticated client', e)
          db = supabase
        }
      }

      // Fetch target user's current profile to detect balance changes
      const { data: existingProfile } = await db
        .from('profiles')
        .select('id, email, full_name, wallet_balance')
        .eq('id', userId)
        .single()

      let { data, error } = await db
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      // If service role failed or errored, try fallback with authenticated supabase client
      if (error && db !== supabase) {
        const fallback = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single()

        if (!fallback.error) {
          data = fallback.data
          error = null
        }
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // If wallet_balance was updated, send branded transaction alert & insert transaction record
      if (updates.wallet_balance !== undefined && existingProfile) {
        const oldBal = Number(existingProfile.wallet_balance || 0)
        const newBal = Number(updates.wallet_balance)
        const diff = newBal - oldBal

        if (Math.abs(diff) >= 0.01) {
          const type = diff > 0 ? 'deposit' : 'withdrawal'
          const refId = `TSL-${type === 'deposit' ? 'DEP' : 'WTH'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

          // Insert transaction record into transactions table
          try {
            await db.from('transactions').insert({
              user_id: userId,
              type,
              amount: diff,
              description: type === 'deposit' ? 'Deposit settlement' : 'Withdrawal transaction',
              reference_id: refId,
            })
          } catch (txErr) {
            console.warn('[Admin Users] Could not record transaction:', txErr)
          }

          // Dispatch branded email alert
          await sendTransactionAlertEmail({
            userId,
            to: existingProfile.email,
            userName: (updates.full_name as string) || existingProfile.full_name,
            type,
            amount: Math.abs(diff),
            newBalance: newBal,
            currency: 'USD',
            referenceId: refId,
          })
        }
      }

      return NextResponse.json({ success: true, profile: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[Admin Users API Error]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
