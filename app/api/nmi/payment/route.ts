import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Checkout is not available yet. Contact support to request Premium access.' },
    { status: 410 }
  )
}
