import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  if (!getAdminEmailFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'active',
      stripe_subscription_id: null,
      expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .neq('plan', 'free')
    .select('id')

  if (error) {
    console.error('Error resetting subscriptions:', error)
    return NextResponse.json({ error: 'Failed to reset subscriptions' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'All memberships now have free access.',
    updatedSubscriptions: data?.length || 0,
  })
}
