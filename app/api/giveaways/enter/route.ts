import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { giveaway_id } = await req.json()
    if (!giveaway_id) {
      return NextResponse.json({ error: 'Missing giveaway_id' }, { status: 400 })
    }

    // Fetch the giveaway
    const { data: giveaway, error: gErr } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveaway_id)
      .single()

    if (gErr || !giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 })
    }

    // Check giveaway is active
    if (giveaway.status !== 'active') {
      return NextResponse.json({ error: 'This giveaway is no longer active' }, { status: 400 })
    }

    // Check if the giveaway has ended
    if (new Date(giveaway.ends_at) < new Date()) {
      return NextResponse.json({ error: 'This giveaway has ended' }, { status: 400 })
    }

    // Check VIP tier eligibility
    if (giveaway.eligible_tiers && giveaway.eligible_tiers.length > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('vip_tier')
        .eq('id', user.id)
        .single()

      if (!profile || !giveaway.eligible_tiers.includes(profile.vip_tier)) {
        return NextResponse.json({
          error: `This giveaway is restricted to ${giveaway.eligible_tiers.join(', ').toUpperCase()} members`,
        }, { status: 403 })
      }
    }

    // Check duplicate entry
    const { data: existingEntry } = await supabase
      .from('giveaway_entries')
      .select('id')
      .eq('giveaway_id', giveaway_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingEntry) {
      return NextResponse.json({ error: 'You have already entered this giveaway' }, { status: 409 })
    }

    // Check max entries limit
    if (giveaway.max_entries) {
      const { count } = await supabase
        .from('giveaway_entries')
        .select('*', { count: 'exact', head: true })
        .eq('giveaway_id', giveaway_id)

      if ((count || 0) >= giveaway.max_entries) {
        return NextResponse.json({ error: 'This giveaway has reached its maximum number of entries' }, { status: 400 })
      }
    }

    // Handle entry fee
    const fee = Number(giveaway.entry_fee || 0)
    if (fee > 0) {
      // Check user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

      if (!profile || Number(profile.wallet_balance) < fee) {
        return NextResponse.json({
          error: `Insufficient balance. Entry fee is $${fee.toFixed(2)}. Your balance: $${Number(profile?.wallet_balance || 0).toFixed(2)}`,
        }, { status: 400 })
      }

      // Deduct fee from wallet
      const newBalance = Number(profile.wallet_balance) - fee
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id)

      if (updateErr) {
        return NextResponse.json({ error: 'Failed to deduct entry fee' }, { status: 500 })
      }

      // Record the transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -fee,
        description: `Giveaway entry fee: ${giveaway.title}`,
        reference_id: giveaway_id,
      })
    }

    // Create the entry
    const { data: entry, error: insertErr } = await supabase
      .from('giveaway_entries')
      .insert({
        giveaway_id,
        user_id: user.id,
        is_admin_selected: false,
        paid_amount: fee,
      })
      .select()
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry_id: entry.id,
      fee_charged: fee,
      message: fee > 0
        ? `Entry confirmed. $${fee.toFixed(2)} has been deducted from your wallet.`
        : 'Entry confirmed. Good luck!',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to enter giveaway' }, { status: 500 })
  }
}
