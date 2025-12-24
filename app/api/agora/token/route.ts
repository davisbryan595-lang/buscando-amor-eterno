import { RtcTokenBuilder, RtcRole } from 'agora-access-token'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const uidStr = searchParams.get('uid') || '0'
  const uid = parseInt(uidStr, 10)

  if (!channel) {
    console.error('Agora token endpoint: Channel parameter missing')
    return NextResponse.json({ error: 'Channel required' }, { status: 400 })
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE

  if (!appId) {
    console.error('Agora token endpoint: NEXT_PUBLIC_AGORA_APP_ID missing')
    return NextResponse.json({ error: 'Server config error: App ID missing' }, { status: 500 })
  }

  if (!appCertificate) {
    console.error('Agora token endpoint: AGORA_APP_CERTIFICATE missing')
    return NextResponse.json({ error: 'Server config error: Certificate missing' }, { status: 500 })
  }

  try {
    const expiration = 3600
    const current = Math.floor(Date.now() / 1000)
    const privilegeExpire = current + expiration

    console.log('Agora token generation:', {
      appId: appId.substring(0, 8) + '...',
      channel,
      uid,
      expiration,
      privilegeExpire,
    })

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpire
    )

    if (!token) {
      console.error('Agora token generation returned empty token')
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    console.log('Agora token generated successfully:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Agora token generation error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Token generation failed' }, { status: 500 })
  }
}
