import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  if (!getAdminEmailFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const incompleteOnly = request.nextUrl.searchParams.get('incomplete') === 'true'
  let query = supabaseAdmin
    .from('profiles')
    .select('user_id, id, full_name, photos, banned, verified, created_at, updated_at, profile_complete')
    .order('created_at', { ascending: false })

  if (incompleteOnly) query = query.eq('profile_complete', false)

  const { data, error } = await query
  if (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
