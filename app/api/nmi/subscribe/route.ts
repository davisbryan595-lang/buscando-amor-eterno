import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Subscriptions are temporarily unavailable because all features are free.' },
    { status: 410 }
  )
}
