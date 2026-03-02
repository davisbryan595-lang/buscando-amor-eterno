import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2020-08-27',
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stripe = getStripeClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const subscriptionId = subscription.id
        const priceId = (subscription.items.data[0]?.price?.id) || ''

        // Get user from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (!userId) {
          console.error('No userId in customer metadata')
          return NextResponse.json(
            { error: 'No userId found' },
            { status: 400 }
          )
        }

        // Check subscription status
        const status = subscription.status === 'active' ? 'active' : 'cancelled'
        const expiresAt =
          subscription.current_period_end * 1000
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null

        // Create or update subscription record
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscriptionId,
              plan: 'premium',
              status,
              expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (upsertError) {
          console.error('Error upserting subscription:', upsertError)
          throw upsertError
        }

        console.log(
          `Subscription ${subscriptionId} updated for user ${userId}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const subscriptionId = subscription.id

        // Get user from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (userId) {
          // Mark subscription as cancelled
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              plan: 'free',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }

          console.log(`Subscription ${subscriptionId} cancelled for user ${userId}`)
        }
        break
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge
        console.error(`Payment failed for customer ${charge.customer}:`, charge.failure_message)
        break
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`Payment succeeded for customer ${charge.customer}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
