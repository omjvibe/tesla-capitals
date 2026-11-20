import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { to, subject, html, template, inReplyTo } = await req.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields (to, subject, html)' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    let resendId = null
    const primaryFrom = process.env.RESEND_FROM_EMAIL || 'Tesla Capital Support <support@teslacapitals.app>'
    const fallbackFrom = 'Tesla Capital Support <onboarding@resend.dev>'
    let usedFrom = primaryFrom

    if (resendApiKey) {
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: primaryFrom,
          to,
          subject,
          html,
          headers: inReplyTo ? { 'In-Reply-To': inReplyTo } : undefined,
        }),
      })

      let data = await res.json().catch(() => ({}))

      // Fallback if unverified domain
      if (
        !res.ok &&
        primaryFrom !== fallbackFrom &&
        (res.status === 403 || data?.message?.toLowerCase().includes('not verified') || data?.message?.toLowerCase().includes('domain'))
      ) {
        usedFrom = fallbackFrom
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fallbackFrom,
            to,
            subject,
            html,
            headers: inReplyTo ? { 'In-Reply-To': inReplyTo } : undefined,
          }),
        })
        data = await res.json().catch(() => ({}))
      }

      if (!res.ok) {
        return NextResponse.json({ error: data.message || 'Failed to dispatch email via Resend' }, { status: res.status })
      }
      resendId = data.id
    }

    // Log to resend_emails with outbound direction
    await supabase.from('resend_emails').insert({
      direction: 'outbound',
      from_email: usedFrom,
      to_email: to,
      subject,
      body_html: html,
      status: resendApiKey ? 'sent' : 'simulated',
      resend_id: resendId,
      in_reply_to: inReplyTo || null,
      metadata: { template: template || 'custom_support' },
    })

    // Fallback sync to email_logs
    await supabase.from('email_logs').insert({
      direction: 'outbound',
      from_email: usedFrom,
      to_email: to,
      recipient: to,
      subject,
      template: template || 'custom_support',
      status: resendApiKey ? 'sent' : 'simulated',
      resend_id: resendId,
      in_reply_to: inReplyTo || null,
    })

    return NextResponse.json({
      success: true,
      message: resendApiKey ? 'Email dispatched via Resend.' : 'Email logged (Simulated - set RESEND_API_KEY in .env.local to enable live delivery).',
      resendId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
