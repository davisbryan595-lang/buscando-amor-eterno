import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  generateAgoraToken,
  generateChannelName,
  userIdToAgoraUid,
  isValidUserId,
} from '@/lib/agora'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID || ''

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey || !agoraAppId) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    // Verify the Supabase token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = data.user.id

    // Get partner ID from request body
    const body = await request.json()
    const partnerId = body.partnerId

    if (!partnerId || !isValidUserId(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      )
    }

    if (!isValidUserId(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verify that the partner is a matched contact
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(
        `and(user_id.eq.${userId},matched_user_id.eq.${partnerId}),and(user_id.eq.${partnerId},matched_user_id.eq.${userId})`
      )
      .eq('status', 'matched')
      .single()

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Not a valid match' },
        { status: 403 }
      )
    }

    // Generate channel name and Agora token
    const channelName = generateChannelName(userId, partnerId)
    const agoraUid = userIdToAgoraUid(userId)
    const agoraToken = generateAgoraToken(agoraAppId, channelName, agoraUid)

    return NextResponse.json({
      token: agoraToken,
      uid: agoraUid,
      channelName,
    })
  } catch (err: any) {
    console.error('Token generation error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
