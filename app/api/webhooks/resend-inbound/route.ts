import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

function verifyResendSignature(
  rawBody: string,
  headersList: {
    id: string | null
    timestamp: string | null
    signature: string | null
  },
  secret: string
): boolean {
  if (!headersList.id || !headersList.timestamp || !headersList.signature) {
    return false
  }

  // Remove whsec_ prefix if present
  const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret
  let key: Buffer
  try {
    key = Buffer.from(secretKey, 'base64')
  } catch {
    key = Buffer.from(secretKey, 'utf8')
  }

  const toSign = `${headersList.id}.${headersList.timestamp}.${rawBody}`
  const computedHmac = crypto
    .createHmac('sha256', key)
    .update(toSign)
    .digest('base64')

  const passedSignatures = headersList.signature.split(' ')
  for (const part of passedSignatures) {
    const [version, sig] = part.split(',')
    if (version === 'v1' && sig) {
      try {
        const expected = Buffer.from(computedHmac)
        const actual = Buffer.from(sig)
        if (expected.length === actual.length && crypto.timingSafeEqual(expected, actual)) {
          return true
        }
      } catch {
        // Continue checking
      }
    }
  }

  return false
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhooks/resend-inbound',
    description: 'Tesla Capital Resend Inbound Email Webhook Receiver',
    webhook_secret_configured: !!process.env.RESEND_WEBHOOK_SECRET,
    setup_instructions: {
      env_variable: 'RESEND_WEBHOOK_SECRET=whsec_...',
      resend_dashboard: 'Go to Resend Dashboard -> Webhooks -> Add Webhook',
      endpoint_url: 'https://<your-domain>/api/webhooks/resend-inbound',
      events: ['email.received'],
      mx_record: 'Ensure your domain (e.g. teslacapitals.app) MX records point to Resend inbound mail servers',
    },
  })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()

    // Verify webhook signature if RESEND_WEBHOOK_SECRET is configured
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (webhookSecret) {
      const svixId = req.headers.get('svix-id')
      const svixTimestamp = req.headers.get('svix-timestamp')
      const svixSignature = req.headers.get('svix-signature')

      const isValid = verifyResendSignature(
        rawBody,
        { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
        webhookSecret
      )

      if (!isValid) {
        console.warn('[Resend Inbound Webhook] Signature verification failed')
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
      }
    } else {
      console.log('[Resend Inbound Webhook] RESEND_WEBHOOK_SECRET not set, skipping signature verification')
    }

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    console.log('[Resend Inbound Webhook] Received payload:', JSON.stringify(payload, null, 2))

    // Handle both Resend event wrapping ({ type: "email.received", data: { ... } }) and flat payloads
    const eventType = payload.type || 'email.received'
    const data = payload.data || payload

    // 1. Extract from address
    let fromEmail = ''
    let fromName = ''

    const rawFrom = data.from || payload.from
    if (typeof rawFrom === 'string') {
      const match = rawFrom.match(/^(.*)<(.*)>$/)
      if (match) {
        fromName = match[1].trim().replace(/^["']|["']$/g, '')
        fromEmail = match[2].trim()
      } else {
        fromEmail = rawFrom.trim()
      }
    } else if (rawFrom && typeof rawFrom === 'object') {
      fromEmail = rawFrom.email || rawFrom.address || ''
      fromName = rawFrom.name || ''
    }

    // 2. Extract to address
    let toEmail = 'support@teslacapitals.app'
    const rawTo = data.to || payload.to
    if (typeof rawTo === 'string') {
      toEmail = rawTo
    } else if (Array.isArray(rawTo) && rawTo.length > 0) {
      const first = rawTo[0]
      toEmail = typeof first === 'string' ? first : (first.email || first.address || 'support@teslacapitals.app')
    }

    // 3. Extract subject, body text, HTML, and Resend email ID
    let subject = data.subject || payload.subject || '(No Subject)'
    let bodyText = data.text || data.body_text || payload.text || payload.body_text || ''
    let bodyHtml = data.html || data.body_html || payload.html || payload.body_html || ''
    const emailId = data.email_id || data.id || payload.email_id || payload.id || null
    const inReplyTo = data.headers?.['in-reply-to'] || data.in_reply_to || payload.in_reply_to || null
    const attachments = data.attachments || payload.attachments || []

    // 4. If body is missing but we have an email_id and RESEND_API_KEY, query Resend API
    const resendApiKey = process.env.RESEND_API_KEY
    if (emailId && resendApiKey && (!bodyText && !bodyHtml)) {
      try {
        console.log(`[Resend Inbound] Fetching full email content from Resend API for ID: ${emailId}`)
        const emailRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        })

        if (emailRes.ok) {
          const resendEmailData = await emailRes.json()
          bodyText = resendEmailData.text || bodyText
          bodyHtml = resendEmailData.html || bodyHtml
          if (!subject || subject === '(No Subject)') {
            subject = resendEmailData.subject || subject
          }
          if (!fromEmail && resendEmailData.from) {
            fromEmail = resendEmailData.from
          }
        } else {
          console.warn(`[Resend Inbound] Resend API responded with status ${emailRes.status}`)
        }
      } catch (apiErr) {
        console.error('[Resend Inbound] Error querying Resend API for email content:', apiErr)
      }
    }

    // Fallback if HTML is missing but text exists
    if (!bodyHtml && bodyText) {
      bodyHtml = `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`
    }

    if (!fromEmail) {
      console.error('[Resend Inbound] Could not extract fromEmail from payload:', payload)
      return NextResponse.json({
        error: 'Missing sender email (from). Ensure payload contains "from" or "data.from".',
        receivedPayload: payload,
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Match sender against registered profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, vip_tier, kyc_status, wallet_balance')
      .ilike('email', fromEmail.toLowerCase().trim())
      .maybeSingle()

    const metadata: Record<string, unknown> = {
      raw_event: eventType,
      raw_from: rawFrom,
      sender_name: fromName || profile?.full_name || null,
      is_registered_member: !!profile,
      member_profile_id: profile?.id || null,
      member_vip_tier: profile?.vip_tier || null,
      member_kyc_status: profile?.kyc_status || null,
      member_wallet_balance: profile?.wallet_balance || null,
      simulated: !!data.simulated || !!payload.simulated,
    }

    // Insert into resend_emails
    const { data: inserted, error: insertError } = await supabase
      .from('resend_emails')
      .insert({
        direction: 'inbound',
        from_email: fromEmail,
        to_email: toEmail,
        subject,
        body_text: bodyText || null,
        body_html: bodyHtml || null,
        status: 'received',
        resend_id: emailId,
        in_reply_to: inReplyTo,
        is_read: false,
        attachments,
        metadata,
      })
      .select()
      .single()

    if (insertError) {
      console.warn('[Resend Inbound] Error inserting to resend_emails, falling back to email_logs:', insertError)
      await supabase.from('email_logs').insert({
        direction: 'inbound',
        from_email: fromEmail,
        to_email: toEmail,
        recipient: toEmail,
        subject,
        body_text: bodyText || null,
        body_html: bodyHtml || null,
        status: 'received',
        resend_id: emailId,
        in_reply_to: inReplyTo,
        is_read: false,
        attachments,
        metadata,
      })
    }

    // Notify user if sender matched an existing registered account
    if (profile?.id) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Support Inquiry Logged',
        message: `Your message regarding "${subject}" has been received by our executive team.`,
        type: 'support',
        link: '/support',
      })
    }

    console.log('[Resend Inbound] Successfully recorded inbound email from', fromEmail, 'Subject:', subject)

    return NextResponse.json({
      success: true,
      id: inserted?.id || null,
      message: 'Inbound email received and recorded in Resend Email Center.',
      from: fromEmail,
      to: toEmail,
      subject,
      memberMatched: !!profile,
    })
  } catch (err: any) {
    console.error('[Resend Inbound Webhook Error]', err)
    return NextResponse.json({ error: err.message || 'Failed to process inbound webhook' }, { status: 500 })
  }
}
