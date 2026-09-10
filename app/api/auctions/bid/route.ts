import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to participate in live vehicle auctions.' }, { status: 401 })
    }

    const { auctionId, amount } = await req.json()

    if (!auctionId || !amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid bid amount or auction ID.' }, { status: 400 })
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, wallet_balance, is_kyc_mandated, kyc_status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 })
    }

    // KYC Mandate check
    if (profile.is_kyc_mandated && profile.kyc_status !== 'approved') {
      return NextResponse.json({
        error: 'Identity verification (KYC) required by administrator before placing auction bids.',
        requiresKyc: true,
      }, { status: 403 })
    }

    // Liquid balance check: wallet_balance must be >= bid amount
    if ((profile.wallet_balance || 0) < amount) {
      return NextResponse.json({
        error: `Insufficient liquid funds. Your available balance is $${Number(profile.wallet_balance || 0).toLocaleString()}, but this bid requires $${amount.toLocaleString()}. Please deposit funds to qualify.`,
        insufficientBalance: true,
      }, { status: 400 })
    }

    // Fetch auction details
    const adminSupabase = createAdminClient()
    const { data: auction, error: auctionErr } = await adminSupabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionErr || !auction) {
      return NextResponse.json({ error: 'Auction lot not found.' }, { status: 404 })
    }

    if (auction.status !== 'live') {
      return NextResponse.json({ error: `This auction is currently ${auction.status}. Bidding is closed.` }, { status: 400 })
    }

    const now = new Date()
    const endsAt = new Date(auction.ends_at)

    if (now >= endsAt) {
      return NextResponse.json({ error: 'This auction has concluded. No further bids can be accepted.' }, { status: 400 })
    }

    // Check minimum bid threshold
    const minRequiredBid = auction.current_bid > 0
      ? auction.current_bid + (auction.min_bid_increment || 500)
      : auction.starting_price

    if (amount < minRequiredBid) {
      return NextResponse.json({
        error: `Bid too low. The minimum acceptable bid is $${minRequiredBid.toLocaleString()}.`,
        minRequiredBid,
      }, { status: 400 })
    }

    // Insert bid record into auction_bids
    const { error: bidErr } = await adminSupabase
      .from('auction_bids')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        amount,
        status: 'active',
      })

    if (bidErr) {
      return NextResponse.json({ error: 'Failed to record bid.' }, { status: 500 })
    }

    // Mark previous active bids for this auction as outbid
    await adminSupabase
      .from('auction_bids')
      .update({ status: 'outbid' })
      .eq('auction_id', auctionId)
      .neq('amount', amount)
      .eq('status', 'active')

    // Check anti-snipe protection (soft close)
    // If bid is within anti_snipe_seconds (e.g. 120s), extend ends_at
    const secondsRemaining = (endsAt.getTime() - now.getTime()) / 1000
    let updatedEndsAt = auction.ends_at
    const antiSnipeBuffer = auction.anti_snipe_seconds || 120

    if (secondsRemaining <= antiSnipeBuffer) {
      const newEndTime = new Date(now.getTime() + antiSnipeBuffer * 1000)
      updatedEndsAt = newEndTime.toISOString()
    }

    // Update auction current bid, total bids, and optional extended end time
    const { data: updatedAuction, error: updateErr } = await adminSupabase
      .from('auctions')
      .update({
        current_bid: amount,
        total_bids: (auction.total_bids || 0) + 1,
        ends_at: updatedEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update auction state.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Bid of $${amount.toLocaleString()} placed successfully!`,
      currentBid: amount,
      totalBids: (auction.total_bids || 0) + 1,
      extended: secondsRemaining <= antiSnipeBuffer,
      endsAt: updatedEndsAt,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error placing auction bid' }, { status: 500 })
  }
}
