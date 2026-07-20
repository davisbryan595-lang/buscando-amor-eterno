import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getKurvSecretKey() {
  const secretKey = process.env.KURV_SECRET_KEY
  if (!secretKey) {
    throw new Error('KURV_SECRET_KEY environment variable is not set')
  }
  return secretKey
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const accessToken = authorization?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactionId } = await request.json()
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify transaction with Kurv API
    const kurvSecretKey = getKurvSecretKey()
    const verifyResponse = await fetch('https://api.kurv.app/transactions/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${kurvSecretKey}`,
      },
      body: JSON.stringify({
        transactionId,
        amount: 1200,
        currency: 'USD',
      }),
    })

    const verifyData = await verifyResponse.json()

    if (!verifyResponse.ok || !verifyData.success) {
      return NextResponse.json(
        { error: verifyData.message || 'Payment verification failed' },
        { status: 402 }
      )
    }

    // Create or update subscription
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userData.user.id,
          stripe_subscription_id: transactionId,
          plan: 'premium',
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (subscriptionError) {
      throw subscriptionError
    }

    return NextResponse.json({ transactionId, success: true })
  } catch (error) {
    console.error('Kurv subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start membership' },
      { status: 500 }
    )
  }
}
