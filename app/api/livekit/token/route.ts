import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const roomName = searchParams.get('room')
    const participantName = searchParams.get('participant')

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Missing required parameters: room and participant' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      )
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    })

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const jwt = await token.toJwt()

    return NextResponse.json({
      token: jwt,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    })
  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
