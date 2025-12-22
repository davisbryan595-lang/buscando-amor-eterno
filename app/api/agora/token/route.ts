import { RtcTokenBuilder, RtcRole } from 'agora-access-token'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const uidStr = searchParams.get('uid') || '0'
  const uid = parseInt(uidStr, 10)

  if (!channel) {
    return NextResponse.json({ error: 'Channel required' }, { status: 400 })
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!

  if (!appCertificate) {
    console.error('Missing AGORA_APP_CERTIFICATE')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const expiration = 3600
  const current = Math.floor(Date.now() / 1000)
  const privilegeExpire = current + expiration

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpire
  )

  return NextResponse.json({ token })
}
