import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, userId, adminId, reason, duration } = await request.json()

    if (!action || !userId || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result = { success: true }

    switch (action) {
      case 'ban_user': {
        const { error: err } = await supabaseAdmin
          .from('profiles')
          .update({
            banned: true,
            ban_reason: reason || null,
            ban_duration: duration || 'permanent',
            ban_date: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (err) throw err

        // Log admin activity
        await supabaseAdmin.from('admin_activity_logs').insert({
          admin_id: adminId,
          action_type: 'ban_user',
          target_user_id: userId,
          details: {
            reason: reason || null,
            duration: duration || 'permanent',
          },
        })

        break
      }

      case 'unban_user': {
        const { error: err } = await supabaseAdmin
          .from('profiles')
          .update({
            banned: false,
            ban_reason: null,
            ban_duration: null,
            ban_date: null,
          })
          .eq('user_id', userId)

        if (err) throw err

        // Log admin activity
        await supabaseAdmin.from('admin_activity_logs').insert({
          admin_id: adminId,
          action_type: 'unban_user',
          target_user_id: userId,
        })

        break
      }

      case 'verify_user': {
        const { error: err } = await supabaseAdmin
          .from('profiles')
          .update({
            verified: true,
          })
          .eq('user_id', userId)

        if (err) throw err

        // Log admin activity
        await supabaseAdmin.from('admin_activity_logs').insert({
          admin_id: adminId,
          action_type: 'verify_user',
          target_user_id: userId,
        })

        break
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error performing admin action:', error)
    return NextResponse.json(
      { error: 'Failed to perform admin action' },
      { status: 500 }
    )
  }
}
