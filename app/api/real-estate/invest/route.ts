import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { property_id, shares } = body

    if (!property_id || !shares || shares <= 0) {
      return NextResponse.json({ error: 'Valid property ID and positive shares count are required.' }, { status: 400 })
    }

    const adminDb = createAdminClient()

    // 1. Fetch user profile
    const { data: profile, error: profileErr } = await adminDb
      .from('profiles')
      .select('id, wallet_balance, full_name, email')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 })
    }

    // 2. Fetch property details
    const { data: property, error: propErr } = await adminDb
      .from('real_estate_properties')
      .select('*')
      .eq('id', property_id)
      .single()

    if (propErr || !property) {
      return NextResponse.json({ error: 'Real estate asset not found.' }, { status: 404 })
    }

    if (property.status !== 'active') {
      return NextResponse.json({ error: `Asset is currently ${property.status} and not open for new investment.` }, { status: 400 })
    }

    if (property.available_shares < shares) {
      return NextResponse.json({
        error: `Only ${property.available_shares} fractional shares remaining for this property.`
      }, { status: 400 })
    }

    const pricePerShare = Number(property.price_per_share)
    const totalAmount = shares * pricePerShare

    if (totalAmount < Number(property.min_investment)) {
      return NextResponse.json({
        error: `Minimum fractional investment for this property is $${Number(property.min_investment).toLocaleString()}.`
      }, { status: 400 })
    }

    const currentBalance = Number(profile.wallet_balance || 0)
    if (currentBalance < totalAmount) {
      return NextResponse.json({
        error: `Insufficient wallet balance. Available: $${currentBalance.toFixed(2)}, Required: $${totalAmount.toFixed(2)}. Please fund your digital wallet.`
      }, { status: 400 })
    }

    // 3. Deduct wallet balance
    const newBalance = Math.max(0, currentBalance - totalAmount)
    const { error: balanceErr } = await adminDb
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id)

    if (balanceErr) {
      return NextResponse.json({ error: 'Failed to deduct wallet balance.' }, { status: 500 })
    }

    // 4. Update available shares on property
    const newAvailable = property.available_shares - shares
    const newStatus = newAvailable <= 0 ? 'funded' : property.status
    await adminDb
      .from('real_estate_properties')
      .update({
        available_shares: newAvailable,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', property_id)

    // 5. Check if user already holds fractional shares in this property
    const { data: existingHolding } = await adminDb
      .from('real_estate_investments')
      .select('*')
      .eq('user_id', user.id)
      .eq('property_id', property_id)
      .eq('status', 'active')
      .maybeSingle()

    let holdingResult
    if (existingHolding) {
      const updatedShares = existingHolding.shares + shares
      const updatedInvested = Number(existingHolding.amount_invested) + totalAmount
      const updatedValue = Number(existingHolding.current_value) + totalAmount

      const { data, error: updateHoldingErr } = await adminDb
        .from('real_estate_investments')
        .update({
          shares: updatedShares,
          amount_invested: updatedInvested,
          current_value: updatedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHolding.id)
        .select()
        .single()

      if (updateHoldingErr) {
        console.error('Failed to update holding:', updateHoldingErr)
      }
      holdingResult = data
    } else {
      const { data, error: insertHoldingErr } = await adminDb
        .from('real_estate_investments')
        .insert({
          user_id: user.id,
          property_id: property_id,
          shares: shares,
          amount_invested: totalAmount,
          current_value: totalAmount,
          status: 'active'
        })
        .select()
        .single()

      if (insertHoldingErr) {
        console.error('Failed to create holding:', insertHoldingErr)
      }
      holdingResult = data
    }

    // 6. Record financial ledger transaction
    await adminDb
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'real_estate',
        amount: -totalAmount,
        description: `Acquired ${shares} fractional shares in ${property.title}`,
        reference_id: property_id
      })

    return NextResponse.json({
      success: true,
      message: `Successfully allocated $${totalAmount.toLocaleString()} into ${property.title}`,
      shares,
      totalAmount,
      newWalletBalance: newBalance,
      holding: holdingResult
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

