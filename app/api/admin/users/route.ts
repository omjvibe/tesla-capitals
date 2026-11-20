import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

      // Whitelist allowed fields
      const allowed = [
        'full_name', 'wallet_balance', 'btc_balance', 'eth_balance', 'usdt_balance',
        'realized_pnl', 'unrealized_pnl', 'vip_tier', 'vip_expires_at',
        'kyc_status', 'role', 'is_kyc_mandated',
      ]

      const updates: Record<string, unknown> = {}
      for (const key of allowed) {
        if (payload[key] !== undefined) {
          // Parse numeric fields
          if (['wallet_balance', 'btc_balance', 'eth_balance', 'usdt_balance', 'realized_pnl', 'unrealized_pnl'].includes(key)) {
            updates[key] = parseFloat(payload[key])
          } else if (key === 'is_kyc_mandated') {
            updates[key] = Boolean(payload[key])
          } else if (key === 'vip_expires_at') {
            updates[key] = payload[key] || null
          } else {
            updates[key] = payload[key]
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
      }

      // Use admin client to bypass RLS reliably
      const admin = createAdminClient()
      const { data, error } = await admin
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[Admin Users API Error]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
