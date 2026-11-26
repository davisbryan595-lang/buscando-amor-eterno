import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Online subscriptions are not available yet. Contact support to request Premium access.' },
    { status: 410 }
  )
}
