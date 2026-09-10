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

    const { auctionId, action, payload } = await req.json()

    if (!auctionId || !action) {
      return NextResponse.json({ error: 'Missing auctionId or action.' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Fetch auction
    const { data: auction, error: auctionErr } = await adminSupabase
      .from('auctions')
      .select('*, product:products(*)')
      .eq('id', auctionId)
      .single()

    if (auctionErr || !auction) {
      return NextResponse.json({ error: 'Auction not found.' }, { status: 404 })
    }

    // ACTION: EXTEND TIME
    if (action === 'extend_time') {
      const minutesToAdd = payload?.minutes || 15
      const currentEnd = new Date(auction.ends_at)
      const baseTime = currentEnd > new Date() ? currentEnd : new Date()
      const newEndTime = new Date(baseTime.getTime() + minutesToAdd * 60 * 1000)

      await adminSupabase
        .from('auctions')
        .update({
          ends_at: newEndTime.toISOString(),
          status: 'live',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)

      return NextResponse.json({
        success: true,
        message: `Auction extended by ${minutesToAdd} minutes.`,
        newEndTime: newEndTime.toISOString(),
      })
    }

    // ACTION: HAMMER CLOSE (END & SETTLE)
    if (action === 'hammer_close') {
      // Find highest bid and winner
      const { data: topBid } = await adminSupabase
        .from('auction_bids')
        .select('*, user:profiles(*)')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle()

      const winningBid = topBid ? topBid.amount : auction.current_bid
      const winnerId = topBid ? topBid.user_id : null

      // If there's a winner, process settlement
      if (winnerId && topBid?.user) {
        const winnerProfile = topBid.user
        const newBalance = Math.max(0, (winnerProfile.wallet_balance || 0) - winningBid)

        // Debit winner balance
        await adminSupabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', winnerId)

        // Log double-entry transaction
        await adminSupabase
          .from('transactions')
          .insert({
            user_id: winnerId,
            type: 'order',
            amount: -winningBid,
            description: `Won Auction Lot: ${auction.title}`,
            reference_id: auctionId,
          })

        // Generate verified Order record
        const orderNumber = `TSL-AUC-${Math.floor(100000 + Math.random() * 900000)}`
        await adminSupabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            user_id: winnerId,
            product_id: auction.product_id || null,
            total: winningBid,
            status: 'confirmed',
            tracking_info: `Auction Won - Logistics Assigned (${auction.title})`,
          })

        // Mark winning bid status
        await adminSupabase
          .from('auction_bids')
          .update({ status: 'won' })
          .eq('id', topBid.id)

        // Send Member notification
        await adminSupabase
          .from('notifications')
          .insert({
            user_id: winnerId,
            title: 'Congratulations! You Won the Auction',
            message: `You are the winning bidder for ${auction.title} at $${winningBid.toLocaleString()}. Order #${orderNumber} created.`,
            type: 'auction_won',
            link: '/orders',
          })
      }

      // Mark auction as ended
      await adminSupabase
        .from('auctions')
        .update({
          status: 'ended',
          winner_id: winnerId,
          winning_bid: winnerId ? winningBid : null,
          ends_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)

      return NextResponse.json({
        success: true,
        message: winnerId
          ? `Auction closed! Winner declared with winning bid of $${winningBid.toLocaleString()}. Order generated and wallet debited.`
          : 'Auction closed with no bids placed.',
        winnerId,
        winningBid,
      })
    }

    // ACTION: CANCEL AUCTION
    if (action === 'cancel_auction') {
      await adminSupabase
        .from('auctions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)

      await adminSupabase
        .from('auction_bids')
        .update({ status: 'retracted' })
        .eq('auction_id', auctionId)

      return NextResponse.json({
        success: true,
        message: 'Auction cancelled and all bids marked as retracted.',
      })
    }

    // ACTION: HOUSE / FLOOR BID
    if (action === 'house_bid') {
      const amount = payload?.amount
      if (!amount || amount <= auction.current_bid) {
        return NextResponse.json({ error: 'House bid amount must exceed current bid.' }, { status: 400 })
      }

      await adminSupabase
        .from('auction_bids')
        .insert({
          auction_id: auctionId,
          user_id: user.id, // Placed by admin
          amount,
          status: 'active',
        })

      await adminSupabase
        .from('auctions')
        .update({
          current_bid: amount,
          total_bids: (auction.total_bids || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auctionId)

      return NextResponse.json({
        success: true,
        message: `House bid of $${amount.toLocaleString()} placed successfully.`,
        currentBid: amount,
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error processing auction action' }, { status: 500 })
  }
}
