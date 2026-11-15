import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { user, isAdmin: profile?.role === 'admin' }
}

export async function GET() {
  try {
    const { isAdmin } = await assertAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 })
    }

    const db = createAdminClient()

    const { data: properties, error: propErr } = await db
      .from('real_estate_properties')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: rawInvestments, error: invErr } = await db
      .from('real_estate_investments')
      .select('*')
      .order('invested_at', { ascending: false })

    const { data: users } = await db
      .from('profiles')
      .select('id, email, full_name, avatar_url, vip_tier')

    if (propErr || invErr) {
      return NextResponse.json({ error: propErr?.message || invErr?.message }, { status: 500 })
    }

    const usersMap = new Map((users || []).map(u => [u.id, u]))
    const propertiesMap = new Map((properties || []).map(p => [p.id, p]))

    const investments = (rawInvestments || []).map(inv => ({
      ...inv,
      user: usersMap.get(inv.user_id) || null,
      property: propertiesMap.get(inv.property_id) || null
    }))

    return NextResponse.json({ properties: properties || [], investments })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { isAdmin } = await assertAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 })
    }

    const body = await req.json()
    const { action, payload } = body
    const db = createAdminClient()

    if (action === 'create') {
      const {
        title,
        description,
        property_type,
        location,
        city,
        country = 'USA',
        total_value,
        min_investment,
        total_shares,
        projected_annual_return,
        rental_yield,
        occupancy_rate = 100,
        size_sqft,
        bedrooms,
        bathrooms,
        image_url,
        amenities = [],
        risk_level = 'moderate',
        holding_period_months = 24,
        status = 'active'
      } = payload

      const tVal = parseFloat(total_value)
      const tShares = parseInt(total_shares, 10) || 1000
      const pricePerShare = tVal > 0 && tShares > 0 ? parseFloat((tVal / tShares).toFixed(2)) : 500

      const { data, error } = await db
        .from('real_estate_properties')
        .insert({
          title,
          description,
          property_type,
          location,
          city,
          country,
          total_value: tVal,
          min_investment: parseFloat(min_investment) || pricePerShare,
          total_shares: tShares,
          available_shares: tShares,
          price_per_share: pricePerShare,
          projected_annual_return: parseFloat(projected_annual_return) || 12,
          rental_yield: parseFloat(rental_yield) || 8,
          occupancy_rate: parseFloat(occupancy_rate) || 100,
          size_sqft: size_sqft ? parseInt(size_sqft, 10) : null,
          bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
          bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
          image_url: image_url || null,
          amenities: Array.isArray(amenities) ? amenities : [],
          risk_level,
          holding_period_months: holding_period_months ? parseInt(holding_period_months, 10) : 24,
          status
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ property: data, message: 'Property created successfully' })
    }

    if (action === 'update') {
      const { id, ...updates } = payload
      if (!id) return NextResponse.json({ error: 'Property ID required' }, { status: 400 })

      // Recompute price_per_share if total_value and total_shares changed
      if (updates.total_value && updates.total_shares) {
        updates.price_per_share = parseFloat((parseFloat(updates.total_value) / parseInt(updates.total_shares, 10)).toFixed(2))
      }

      updates.updated_at = new Date().toISOString()

      const { data, error } = await db
        .from('real_estate_properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ property: data, message: 'Property updated successfully' })
    }

    if (action === 'delete') {
      const { id } = payload
      if (!id) return NextResponse.json({ error: 'Property ID required' }, { status: 400 })

      const { error } = await db
        .from('real_estate_properties')
        .delete()
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Property deleted successfully' })
    }

    if (action === 'toggle_status') {
      const { id, status } = payload
      if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

      const { data, error } = await db
        .from('real_estate_properties')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ property: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

