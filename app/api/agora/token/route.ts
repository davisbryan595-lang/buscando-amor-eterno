import { RtcTokenBuilder, RtcRole } from 'agora-access-token'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')
  const uidStr = searchParams.get('uid')

  // Validate channel parameter
  if (!channel) {
    console.error('Agora token endpoint: Channel parameter missing')
    return NextResponse.json({ error: 'Channel required' }, { status: 400 })
  }

  // Validate uid parameter
  if (!uidStr) {
    console.error('Agora token endpoint: UID parameter missing')
    return NextResponse.json({ error: 'UID required' }, { status: 400 })
  }

  const uid = parseInt(uidStr, 10)

  // Validate uid is a valid number
  if (isNaN(uid)) {
    console.error('Agora token endpoint: Invalid UID format', { uidStr })
    return NextResponse.json({ error: 'UID must be a valid number' }, { status: 400 })
  }

  // Validate uid is in valid Agora range (1 to 4294967295, 0 is reserved for anonymous)
  if (uid < 1 || uid > 4294967295) {
    console.error('Agora token endpoint: UID out of valid range', { uid, uidStr })
    return NextResponse.json(
      { error: `UID must be between 1 and 4294967295, got ${uid}` },
      { status: 400 }
    )
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
    const expiration = 3600 // 1 hour
    const current = Math.floor(Date.now() / 1000)
    const privilegeExpire = current + expiration

    console.log('Agora token generation:', {
      appId: appId.substring(0, 8) + '...',
      appCertificate: appCertificate.substring(0, 8) + '...',
      channel,
      uid,
      expiration,
      privilegeExpire,
      timestamp: new Date().toISOString(),
    })

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpire
    )

    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error('Agora token generation failed', {
        token,
        type: typeof token,
        isEmpty: token ? token.trim() === '' : 'null/undefined',
      })
      return NextResponse.json(
        { error: 'Token generation returned invalid result' },
        { status: 500 }
      )
    }

    console.log('Agora token generated successfully:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
      tokenSuffix: token.substring(token.length - 10) + '...',
    })

    return NextResponse.json({ token })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('Agora token generation error:', {
      message: errorMsg,
      stack: errorStack,
      appIdLength: appId.length,
      appCertificateLength: appCertificate.length,
      channel,
      uid,
    })
    return NextResponse.json(
      { error: 'Token generation failed: ' + errorMsg },
      { status: 500 }
    )
  }
}
