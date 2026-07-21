import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getNmiSecurityKey() {
  const securityKey = process.env.NMI_SECURITY_KEY
  if (!securityKey) {
    throw new Error('NMI_SECURITY_KEY environment variable is not set')
  }
  return securityKey
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const accessToken = authorization?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentToken } = await request.json()
    if (!paymentToken) {
      return NextResponse.json({ error: 'Missing payment token' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch('https://secure.networkmerchants.com/api/transact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        security_key: getNmiSecurityKey(),
        type: 'sale',
        payment_token: paymentToken,
        amount: '12.00',
        currency: 'USD',
        recurring: 'add_subscription',
        plan_payments: '0',
        plan_amount: '12.00',
        plan_name: 'Premium Membership',
        month_frequency: '1',
        day_of_month: String(new Date().getDate()),
        email: userData.user.email || '',
        merchant_defined_field_1: userData.user.id,
      }),
    })

    const result = new URLSearchParams(await response.text())
    if (!response.ok || result.get('response') !== '1') {
      return NextResponse.json(
        { error: result.get('responsetext') || 'Payment was declined' },
        { status: 402 }
      )
    }

    const subscriptionId = result.get('subscription_id') || result.get('transactionid')
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userData.user.id,
          stripe_subscription_id: subscriptionId,
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

    return NextResponse.json({ subscriptionId })
  } catch (error) {
    console.error('NMI subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start membership' },
      { status: 500 }
    )
  }
}
