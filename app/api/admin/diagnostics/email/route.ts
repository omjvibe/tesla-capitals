import https from 'node:https'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dispatchViaHttps } from '@/lib/emails/transaction-alert'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in as admin.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 })
    }

    const hasResendApiKey = !!process.env.RESEND_API_KEY
    const resendKeyPrefix = process.env.RESEND_API_KEY
      ? `${process.env.RESEND_API_KEY.slice(0, 7)}...${process.env.RESEND_API_KEY.slice(-4)}`
      : 'NOT_SET'
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Tesla Capital <support@teslacapitals.app>'

    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      env: {
        hasResendApiKey,
        resendKeyPrefix,
        hasServiceRoleKey,
        hasSupabaseUrl,
        fromEmail,
        nodeVersion: process.version,
        platform: process.platform,
        vercelEnv: process.env.VERCEL_ENV || 'unknown',
        vercelRegion: process.env.VERCEL_REGION || 'unknown',
      },
      diagnostics: {},
    }

    if (!hasResendApiKey) {
      results.diagnostics.error = 'RESEND_API_KEY environment variable is NOT SET on this server runtime!'
      return NextResponse.json(results)
    }

    const apiKey = process.env.RESEND_API_KEY!
    const testPayload = JSON.stringify({
      from: fromEmail,
      to: ['delivered@resend.dev'],
      subject: 'Tesla Capital Diagnostic Test',
      html: '<p>Production connectivity verification.</p>',
    })

    // Test 1: Native node:https with family: 4
    try {
      const nodeHttpsResult = await new Promise<any>((resolve) => {
        const start = Date.now()
        const req = https.request('https://api.resend.com/emails', {
          method: 'POST',
          family: 4,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(testPayload),
            'User-Agent': 'TeslaCapital-Diagnostic/1.0',
            'Connection': 'close',
          },
          timeout: 8000,
        }, (res) => {
          let data = ''
          res.on('data', chunk => { data += chunk })
          res.on('end', () => {
            resolve({
              success: (res.statusCode || 500) < 400,
              statusCode: res.statusCode,
              durationMs: Date.now() - start,
              data: data.slice(0, 500),
            })
          })
        })

        req.on('timeout', () => {
          req.destroy(new Error('node:https timeout after 8s'))
        })
        req.on('error', (err) => {
          resolve({
            success: false,
            error: err.message,
            durationMs: Date.now() - start,
          })
        })
        req.write(testPayload)
        req.end()
      })
      results.diagnostics.nodeHttps = nodeHttpsResult
    } catch (err: any) {
      results.diagnostics.nodeHttps = { success: false, error: err.message }
    }

    // Test 2: Standard fetch()
    try {
      const start = Date.now()
      const fetchRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: testPayload,
      })
      const fetchBody = await fetchRes.text()
      results.diagnostics.standardFetch = {
        success: fetchRes.ok,
        statusCode: fetchRes.status,
        durationMs: Date.now() - start,
        data: fetchBody.slice(0, 500),
      }
    } catch (fetchErr: any) {
      results.diagnostics.standardFetch = {
        success: false,
        error: fetchErr.message || String(fetchErr),
      }
    }

    // Test 3: Composite dispatchViaHttps (the actual production helper used by alerts)
    try {
      const compositeRes = await dispatchViaHttps(
        apiKey,
        fromEmail,
        'delivered@resend.dev',
        'Tesla Capital Diagnostic Ping via dispatchViaHttps',
        '<p>Diagnostic test using production dispatch function.</p>'
      )
      results.diagnostics.compositeDispatch = compositeRes
    } catch (compErr: any) {
      results.diagnostics.compositeDispatch = { success: false, error: compErr.message }
    }

    return NextResponse.json(results)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
