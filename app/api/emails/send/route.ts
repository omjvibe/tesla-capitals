import dns from 'node:dns'
import https from 'node:https'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

function dispatchViaHttps(
  apiKey: string,
  fromAddr: string,
  toAddr: string,
  subj: string,
  bodyHtml: string,
  inReplyTo?: string | null
): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      from: fromAddr,
      to: [toAddr],
      subject: subj,
      html: bodyHtml,
      headers: inReplyTo ? { 'In-Reply-To': inReplyTo } : undefined,
    })

    const req = https.request('https://api.resend.com/emails', {
      method: 'POST',
      family: 4,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'TeslaCapital-Dispatcher/1.0',
        'Connection': 'close',
      },
      timeout: 10000,
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            status: res.statusCode || 500,
            data: parsed,
          })
        } catch {
          resolve({
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            status: res.statusCode || 500,
            data: { raw: data },
          })
        }
      })
    })

    req.on('timeout', () => {
      req.destroy(new Error('Connection timed out after 10s'))
    })

    req.on('error', (err) => {
      resolve({
        ok: false,
        status: 500,
        data: null,
        error: err.message,
      })
    })

    req.write(payload)
    req.end()
  })
}

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
      const firstTry = await dispatchViaHttps(resendApiKey, primaryFrom, to, subject, html, inReplyTo)
      if (firstTry.ok && firstTry.data?.id) {
        resendId = firstTry.data.id
      } else {
        const errMsg = firstTry.data?.message || firstTry.error || ''
        if (
          primaryFrom !== fallbackFrom &&
          (firstTry.status === 403 || errMsg.toLowerCase().includes('not verified') || errMsg.toLowerCase().includes('domain'))
        ) {
          usedFrom = fallbackFrom
          const secondTry = await dispatchViaHttps(resendApiKey, fallbackFrom, to, subject, html, inReplyTo)
          if (secondTry.ok && secondTry.data?.id) {
            resendId = secondTry.data.id
          } else {
            return NextResponse.json({ error: secondTry.data?.message || secondTry.error || 'Failed to dispatch email via Resend' }, { status: secondTry.status })
          }
        } else {
          return NextResponse.json({ error: firstTry.data?.message || firstTry.error || 'Failed to dispatch email via Resend' }, { status: firstTry.status })
        }
      }
    }

    // Log to resend_emails with outbound direction
    await supabase.from('resend_emails').insert({
      direction: 'outbound',
      from_email: usedFrom,
      to_email: to,
      subject,
      body_html: html,
      status: resendApiKey ? (resendId ? 'sent' : 'failed') : 'simulated',
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
      status: resendApiKey ? (resendId ? 'sent' : 'failed') : 'simulated',
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
