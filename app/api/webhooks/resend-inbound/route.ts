import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Extract fields flexibly from Resend inbound payload or manual simulation
    let fromEmail = ''
    let fromName = ''

    if (typeof body.from === 'string') {
      fromEmail = body.from
      // Check for format: "Name <email@example.com>"
      const match = body.from.match(/^(.*)<(.*)>$/)
      if (match) {
        fromName = match[1].trim().replace(/^["']|["']$/g, '')
        fromEmail = match[2].trim()
      }
    } else if (body.from && typeof body.from === 'object') {
      fromEmail = body.from.email || body.from.address || ''
      fromName = body.from.name || ''
    }

    let toEmail = 'support@teslacapitals.app'
    if (typeof body.to === 'string') {
      toEmail = body.to
    } else if (Array.isArray(body.to) && body.to.length > 0) {
      toEmail = typeof body.to[0] === 'string' ? body.to[0] : (body.to[0].email || 'support@teslacapitals.app')
    }

    const subject = body.subject || '(No Subject)'
    const bodyText = body.text || body.body_text || ''
    const bodyHtml = body.html || body.body_html || (bodyText ? `<p>${bodyText.replace(/\n/g, '<br/>')}</p>` : '')
    const resendId = body.email_id || body.id || null
    const attachments = body.attachments || []
    const inReplyTo = body.headers?.['in-reply-to'] || body.in_reply_to || null

    if (!fromEmail) {
      return NextResponse.json({ error: 'Missing sender email (from)' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if sender matches a registered platform profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, vip_tier, kyc_status, wallet_balance')
      .ilike('email', fromEmail.toLowerCase().trim())
      .maybeSingle()

    const metadata: Record<string, unknown> = {
      raw_from: body.from,
      sender_name: fromName || profile?.full_name || null,
      is_registered_member: !!profile,
      member_profile_id: profile?.id || null,
      member_vip_tier: profile?.vip_tier || null,
      member_kyc_status: profile?.kyc_status || null,
      member_wallet_balance: profile?.wallet_balance || null,
      simulated: !!body.simulated,
    }

    // Insert into resend_emails
    const { data: inserted, error: insertError } = await supabase
      .from('resend_emails')
      .insert({
        direction: 'inbound',
        from_email: fromEmail,
        to_email: toEmail,
        subject,
        body_text: bodyText,
        body_html: bodyHtml,
        status: 'received',
        resend_id: resendId,
        in_reply_to: inReplyTo,
        is_read: false,
        attachments,
        metadata,
      })
      .select()
      .single()

    if (insertError) {
      // Fallback attempt into email_logs if resend_emails failed
      await supabase.from('email_logs').insert({
        direction: 'inbound',
        from_email: fromEmail,
        to_email: toEmail,
        recipient: toEmail,
        subject,
        body_text: bodyText,
        body_html: bodyHtml,
        status: 'received',
        resend_id: resendId,
        in_reply_to: inReplyTo,
        is_read: false,
        attachments,
        metadata,
      })
    }

    // Also notify admins of new inbound customer message
    if (profile?.id) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Support Inquiry Received',
        message: `We have received your message regarding "${subject}". Our team will respond shortly.`,
        type: 'support',
        link: '/support',
      })
    }

    return NextResponse.json({
      success: true,
      id: inserted?.id || null,
      message: 'Inbound email received and recorded in Resend Email Center.',
      memberMatched: !!profile,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process inbound webhook' }, { status: 500 })
  }
}
