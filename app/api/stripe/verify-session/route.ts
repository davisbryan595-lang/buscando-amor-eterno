import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2020-08-27',
  })
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    const stripe = getStripeClient()
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Return session details
    return NextResponse.json({
      id: session.id,
      status: session.payment_status,
      customer_id: session.customer,
      subscription_id: session.subscription,
      customer_email: session.customer_email,
      // payment_status can be: 'paid', 'unpaid', or 'no_payment_required'
    })
  } catch (error: any) {
    console.error('Session verification error:', error)
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Session verification failed' },
      { status: 500 }
    )
  }
}
