import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const params = new URLSearchParams(body)

  const eventType = params.get('event_type')
  const subscriptionId = params.get('subscription_id')
  const userId = params.get('merchant_defined_field_1')
  const status = params.get('subscription_status')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    if (
      eventType === 'recurring_payment_success' ||
      eventType === 'subscription_activate'
    ) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            plan: 'premium',
            status: 'active',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
    } else if (
      eventType === 'subscription_cancel' ||
      status === 'Cancelled' ||
      eventType === 'recurring_payment_failure'
    ) {
      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('NMI webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
