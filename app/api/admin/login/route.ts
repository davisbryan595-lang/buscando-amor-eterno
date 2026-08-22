import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, verifyAdminCredentials } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, accessCode } = await request.json()

    if (typeof email !== 'string' || typeof accessCode !== 'string' || !verifyAdminCredentials(email, accessCode)) {
      return NextResponse.json({ error: 'Invalid email or access code' }, { status: 401 })
    }

    return NextResponse.json({ token: createAdminToken(email), email: email.trim().toLowerCase() })
  } catch {
    return NextResponse.json({ error: 'Invalid login request' }, { status: 400 })
  }
}
