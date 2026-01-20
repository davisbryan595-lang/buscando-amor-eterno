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

    const { data, error: err } = await supabaseAdmin
      .from('reports')
      .select(
        `
        *,
        reported_user:reported_user_id(user_id, full_name, photos),
        reported_by:reported_by_user_id(user_id, full_name)
        `
      )
      .order('created_at', { ascending: false })

    if (err) throw err

    return NextResponse.json({ reports: data || [] })
  } catch (error: any) {
    console.error('Error fetching admin reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin reports' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reportId, status, actionTaken, reviewedByAdminId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing reportId' },
        { status: 400 }
      )
    }

    const { error: err } = await supabaseAdmin
      .from('reports')
      .update({
        status,
        action_taken: actionTaken || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by_admin_id: reviewedByAdminId,
      })
      .eq('id', reportId)

    if (err) throw err

    // Log admin activity
    if (reviewedByAdminId) {
      await supabaseAdmin.from('admin_activity_logs').insert({
        admin_id: reviewedByAdminId,
        action_type: status === 'dismissed' ? 'dismiss_report' : 'view_profile',
        details: { report_id: reportId, status },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating admin report:', error)
    return NextResponse.json(
      { error: 'Failed to update admin report' },
      { status: 500 }
    )
  }
}
