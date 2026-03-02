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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const plan = searchParams.get('plan')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    // Build query
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

    // Apply sorting
    const isAscending = sortBy.startsWith('-') ? true : false
    const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy

    if (['created_at', 'updated_at', 'started_at', 'expires_at'].includes(sortField)) {
      query = query.order(sortField, { ascending: isAscending })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply limit
    query = query.limit(limit)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      limit,
    })
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
