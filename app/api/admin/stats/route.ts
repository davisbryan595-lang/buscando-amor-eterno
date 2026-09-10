import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  if (!getAdminEmailFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const countRows = async (table: string, column?: string, value?: unknown) => {
    let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true })
    if (column) query = query.eq(column, value)
    const { count, error } = await query
    if (error) throw error
    return count || 0
  }

  try {
    const [totalSignups, totalProfiles, newUsersToday, activeChats, totalCalls, reportedProfiles, bannedUsers] =
      await Promise.all([
        countRows('users'),
        countRows('profiles'),
        (async () => {
          const { count, error } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString())
          if (error) throw error
          return count || 0
        })(),
        (async () => {
          const { count, error } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString())
          if (error) throw error
          return count || 0
        })(),
        countRows('call_logs'),
        countRows('reports', 'status', 'pending'),
        countRows('profiles', 'banned', true),
      ])

    return NextResponse.json({
      totalSignups,
      totalProfiles,
      newUsersToday,
      activeChats,
      totalCalls,
      reportedProfiles,
      bannedUsers,
      incompleteProfiles: Math.max(0, totalSignups - totalProfiles),
      freeAccessUsers: totalSignups,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 })
  }
}
