import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering and export
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json' // json or csv
    const plan = searchParams.get('plan') // free or premium
    const status = searchParams.get('status') // active, cancelled, expired

    // Fetch subscriptions with user information
    let query = supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan,
        status,
        stripe_subscription_id,
        started_at,
        expires_at,
        created_at,
        updated_at
      `)

    // Apply filters
    if (plan && ['free', 'premium'].includes(plan)) {
      query = query.eq('plan', plan)
    }

    if (status && ['active', 'cancelled', 'expired'].includes(status)) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data: subscriptions, error } = await query

    if (error) throw error

    // If CSV format requested
    if (format === 'csv') {
      const csvHeaders = ['User ID', 'Plan', 'Status', 'Started At', 'Expires At', 'Subscription ID', 'Created At']
      const csvRows = (subscriptions || []).map((sub: any) => [
        sub.user_id,
        sub.plan,
        sub.status,
        sub.started_at,
        sub.expires_at || 'N/A',
        sub.stripe_subscription_id || 'N/A',
        sub.created_at,
      ])

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscriptions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Default JSON response
    return NextResponse.json({
      data: subscriptions || [],
      total: subscriptions?.length || 0,
      filters: {
        plan: plan || 'all',
        status: status || 'all',
      },
    })
  } catch (error: any) {
    console.error('Error fetching user subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user subscriptions' },
      { status: 500 }
    )
  }
}
