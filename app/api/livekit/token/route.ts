import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

async function generateToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit credentials not configured')
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

  return {
    token: jwt,
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  }
}

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

    const result = await generateToken(roomName, participantName)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate token' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomName, userName, callType } = body

    if (!roomName || !userName) {
      return NextResponse.json(
        { error: 'Missing required parameters: roomName and userName' },
        { status: 400 }
      )
    }

    const result = await generateToken(roomName, userName)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate token' },
      { status: 500 }
    )
  }
}
