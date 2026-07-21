import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getNmiSecurityKey() {
  const key = process.env.NMI_SECURITY_KEY
  if (!key) {
    throw new Error('NMI_SECURITY_KEY not configured')
  }
  return key
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const accessToken = authorization?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardNumber, expiration, cvv } = await request.json()

    if (!cardNumber || !expiration || !cvv) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    // Validate card number (basic check)
    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid card number' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [month, year] = expiration.split('/')
    const expirationYear = year ? '20' + year : new Date().getFullYear().toString().slice(2)

    const params = new URLSearchParams({
      security_key: getNmiSecurityKey(),
      type: 'sale',
      ccnumber: cardNumber,
      ccexp: `${month}${expirationYear}`,
      cvv: cvv,
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
    })

    const response = await fetch('https://secure.networkmerchants.com/api/transact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const responseText = await response.text()
    const result = new URLSearchParams(responseText)
    const responseCode = result.get('response')

    if (responseCode !== '1') {
      const errorMsg = result.get('responsetext') || 'Payment was declined'
      console.error('NMI error:', errorMsg, responseText)
      return NextResponse.json({ error: errorMsg }, { status: 402 })
    }

    const subscriptionId = result.get('subscription_id') || result.get('transactionid') || ''
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subscriptionError } = await supabase.from('subscriptions').upsert(
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
      console.error('Subscription update error:', subscriptionError)
      return NextResponse.json(
        { error: 'Payment successful but could not activate membership' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Payment processed successfully',
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    )
  }
}
