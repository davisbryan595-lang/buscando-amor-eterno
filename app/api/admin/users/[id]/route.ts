import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminEmailFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching admin user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'User profile not found' }, { status: 404 })

  return NextResponse.json({ user: data })
}
