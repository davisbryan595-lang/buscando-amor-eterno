import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const email = getAdminEmailFromRequest(request)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ email })
}
