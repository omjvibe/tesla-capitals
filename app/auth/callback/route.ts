import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (errorParam || errorDesc) {
    let message = errorDesc || 'Authentication failed. Please try again.'
    if (errorParam === 'unsupported_provider') {
      message = 'OAuth provider is not enabled in Supabase. Please contact support.'
    } else if (errorParam === 'access_denied') {
      message = 'Access denied by the provider. You may have declined permissions or the app is not approved. Please try again.'
    } else if (errorParam === 'server_error' || errorParam === 'temporarily_unavailable') {
      message = 'The authentication provider is temporarily unavailable. Please try again in a few moments.'
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam || 'auth_error')}&error_description=${encodeURIComponent(message)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session) {
      // Check if this is a recovery flow
      let isRecovery = type === 'recovery'
      try {
        const token = data.session.access_token
        if (token) {
          const payloadBase64 = token.split('.')[1]
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8')
          const payload = JSON.parse(payloadJson)
          if (payload.amr && Array.isArray(payload.amr)) {
            isRecovery = isRecovery || payload.amr.some((m: { method: string }) => m.method === 'recovery')
          }
        }
      } catch {
        // Ignore JWT parse errors
      }

      if (isRecovery) {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Check if admin — redirect to admin dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth code error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
