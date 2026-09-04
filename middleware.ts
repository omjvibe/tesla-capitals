import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/', '/learn', '/about', '/terms', '/privacy', '/risk-disclosure']
const authRoutes = ['/login', '/signup', '/forgot-password']
const callbackRoutes = ['/auth/callback', '/auth/confirm']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Allow callback routes unconditionally
  if (callbackRoutes.some(r => pathname.startsWith(r))) {
    return supabaseResponse
  }

  // Public routes — always accessible
  if (publicRoutes.includes(pathname)) {
    return supabaseResponse
  }

  // Auth routes — redirect to dashboard if already logged in
  if (authRoutes.includes(pathname)) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Admin login is separate
  if (pathname === '/admin/login') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }
    return supabaseResponse
  }

  // All other routes require authentication
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.startsWith('/admin') ? '/admin/login' : '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Fetch user profile for role & KYC checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_kyc_mandated, kyc_status')
    .eq('id', user.id)
    .single()

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // KYC Mandate Enforcement for financial/trading actions
  if (
    profile?.is_kyc_mandated &&
    profile?.kyc_status !== 'approved' &&
    (pathname.startsWith('/investments') || pathname.startsWith('/stocks') || pathname.startsWith('/wallet'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    url.searchParams.set('kyc_required', 'true')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|mp3|wav|m4a|aac|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
