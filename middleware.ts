import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is a simple middleware that just passes through
  // Route protection is handled client-side using useAuth and useProfileProtection hooks
  // This prevents issues with Supabase session handling in middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
