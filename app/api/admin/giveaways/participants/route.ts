import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: fetch participants for a giveaway
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const giveawayId = searchParams.get('giveaway_id')
    if (!giveawayId) return NextResponse.json({ error: 'Missing giveaway_id' }, { status: 400 })

    const { data: entries, error } = await supabase
      .from('giveaway_entries')
      .select(`
        id,
        giveaway_id,
        user_id,
        entered_at,
        is_admin_selected,
        paid_amount,
        profiles (
          id,
          full_name,
          email,
          vip_tier
        )
      `)
      .eq('giveaway_id', giveawayId)
      .order('entered_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ entries: entries || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch participants' }, { status: 500 })
  }
}

// POST: Admin manually adds a user to a giveaway
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { giveaway_id, user_id } = await req.json()
    if (!giveaway_id || !user_id) {
      return NextResponse.json({ error: 'Missing giveaway_id or user_id' }, { status: 400 })
    }

    // Check if user already entered
    const { data: existing } = await supabase
      .from('giveaway_entries')
      .select('id')
      .eq('giveaway_id', giveaway_id)
      .eq('user_id', user_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'User is already entered in this giveaway' }, { status: 409 })
    }

    const { data: entry, error } = await supabase
      .from('giveaway_entries')
      .insert({
        giveaway_id,
        user_id,
        is_admin_selected: true,
        paid_amount: 0,
      })
      .select(`
        id,
        giveaway_id,
        user_id,
        entered_at,
        is_admin_selected,
        paid_amount,
        profiles (
          id,
          full_name,
          email,
          vip_tier
        )
      `)
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, entry })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add participant' }, { status: 500 })
  }
}

// DELETE: Admin removes a participant from a giveaway
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get('entry_id')
    if (!entryId) return NextResponse.json({ error: 'Missing entry_id' }, { status: 400 })

    const { error } = await supabase.from('giveaway_entries').delete().eq('id', entryId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to remove participant' }, { status: 500 })
  }
}
