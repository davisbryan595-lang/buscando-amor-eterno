import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/',
    '/pricing',
    '/contact',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user is trying to access protected routes
    if (pathname === '/onboarding' || pathname === '/browse' || pathname === '/profile' || pathname === '/messages' || pathname === '/chat-room' || pathname === '/video-date') {
      // Fetch user's profile to check if it's complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('user_id', session.user.id)
        .single()

      // If profile is not complete and they're not on onboarding, redirect to onboarding
      if (!profile?.profile_complete && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // If profile is complete and they're on onboarding, redirect to browse
      if (profile?.profile_complete && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/browse', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
