import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function verifyKurvWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false

  const secret = process.env.KURV_WEBHOOK_SECRET
  if (!secret) {
    console.error('KURV_WEBHOOK_SECRET not configured')
    return false
  }

  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-kurv-signature')

    if (!verifyKurvWebhookSignature(body, signature)) {
      console.warn('Invalid Kurv webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const eventType = data.event_type
    const transactionId = data.transaction_id
    const customerId = data.customer_id
    const amount = data.amount
    const status = data.status

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle successful payment events
    if (
      eventType === 'payment.success' ||
      eventType === 'subscription.created' ||
      status === 'completed'
    ) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: customerId,
            stripe_subscription_id: transactionId,
            plan: 'premium',
            status: 'active',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
    }
    // Handle payment failure or cancellation
    else if (
      eventType === 'payment.failed' ||
      eventType === 'subscription.cancelled' ||
      eventType === 'refund.completed' ||
      status === 'failed' ||
      status === 'cancelled'
    ) {
      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', customerId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Kurv webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
