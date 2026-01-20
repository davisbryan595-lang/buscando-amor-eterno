import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated (check Authorization header)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Initialize default values
    let totalSignupsCount = 0
    let totalProfilesCount = 0
    let newUsersTodayCount = 0
    let incompleteCount = 0
    let activeChatsCount = 0
    let totalCallsCount = 0
    let reportedCount = 0
    let bannedCount = 0

    // Get total signups (from users table)
    try {
      const { count, error: err } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
      if (err) throw err
      totalSignupsCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch total signups:', err?.message)
    }

    // Get total profiles (completed onboarding)
    try {
      const { count, error: err } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      if (err) throw err
      totalProfilesCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch total profiles:', err?.message)
    }

    // Get new users today
    try {
      const { count, error: err } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      if (err) throw err
      newUsersTodayCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch new users today:', err?.message)
    }

    // Get incomplete profiles
    try {
      incompleteCount = Math.max(0, totalSignupsCount - totalProfilesCount)
    } catch (err: any) {
      console.warn('Failed to calculate incomplete profiles:', err?.message)
      try {
        const { count, error: err } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_complete', false)
        if (err) throw err
        incompleteCount = count || 0
      } catch (fallbackErr: any) {
        console.warn('Fallback incomplete profiles query also failed:', fallbackErr?.message)
      }
    }

    // Get active chats (messages sent/received today)
    try {
      const { count, error: err } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      if (err) throw err
      activeChatsCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch active chats:', err?.message)
    }

    // Get total calls
    try {
      const { count, error: err } = await supabaseAdmin
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
      if (err) throw err
      totalCallsCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch total calls:', err?.message)
    }

    // Get reported profiles count
    try {
      const { count, error: err } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (err) throw err
      reportedCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch reported profiles:', err?.message)
    }

    // Get banned users count
    try {
      const { count, error: err } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('banned', true)
      if (err) throw err
      bannedCount = count || 0
    } catch (err: any) {
      console.warn('Failed to fetch banned users:', err?.message)
    }

    return NextResponse.json({
      totalSignups: totalSignupsCount,
      totalProfiles: totalProfilesCount,
      newUsersToday: newUsersTodayCount,
      activeChats: activeChatsCount,
      totalCalls: totalCallsCount,
      reportedProfiles: reportedCount,
      bannedUsers: bannedCount,
      incompleteProfiles: incompleteCount,
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
