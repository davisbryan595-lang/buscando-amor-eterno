import { NextRequest, NextResponse } from 'next/server'

function getNmiSecurityKey() {
  const securityKey = process.env.NMI_SECURITY_KEY
  if (!securityKey) {
    throw new Error('NMI_SECURITY_KEY environment variable is not set')
  }
  return securityKey
}

function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_APP_URL not set, using default')
    return 'https://www.buscandoamoreterno.com'
  }
  return url
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      )
    }

    const appUrl = getAppUrl()
    const securityKey = getNmiSecurityKey()

    const params = new URLSearchParams({
      security_key: securityKey,
      type: 'sale',
      amount: '12.00',
      currency: 'USD',
      order_description: 'Premium Membership - $12/month',
      billing_method: 'creditcard',
      email,
      merchant_defined_field_1: userId,
      redirect_url: `${appUrl}/pricing?payment=success`,
      billing_zip: '12345',
      billing_country: 'US',
    })

    const checkoutUrl = `https://secure.networkmerchants.com/checkout?${params.toString()}`

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('NMI hosted checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout creation failed' },
      { status: 500 }
    )
  }
}
