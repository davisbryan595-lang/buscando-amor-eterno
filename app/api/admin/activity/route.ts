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

  const { data, error } = await supabaseAdmin
    .from('admin_activity_logs')
    .select(`*, admin:admin_id(full_name), target_user:target_user_id(full_name)`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching admin activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }

  return NextResponse.json({ logs: data || [] })
}
