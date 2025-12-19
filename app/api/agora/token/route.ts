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
      console.error('Missing required environment variables', {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
        agoraAppId: !!agoraAppId,
      })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Additional validation for Agora certificate
    const agoraCertificate = process.env.AGORA_APP_CERTIFICATE
    if (!agoraCertificate) {
      console.error('Missing AGORA_APP_CERTIFICATE environment variable')
      return NextResponse.json(
        { error: 'Server configuration error: missing Agora certificate' },
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

    const { data, error: authError } = await supabase.auth.getUser()
    if (authError || !data.user) {
      console.warn('Auth verification failed:', authError?.message)
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = data.user.id
    console.log('Token request from user:', userId)

    // Get partner ID from request body
    let body: any
    try {
      body = await request.json()
    } catch (err) {
      console.error('Failed to parse request body:', err)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const partnerId = body.partnerId

    if (!partnerId || !isValidUserId(partnerId)) {
      console.warn('Invalid partner ID:', partnerId)
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      )
    }

    if (!isValidUserId(userId)) {
      console.warn('Invalid user ID:', userId)
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Prevent calling yourself
    if (userId === partnerId) {
      console.warn('User attempting to call themselves:', userId)
      return NextResponse.json(
        { error: 'Cannot call yourself' },
        { status: 400 }
      )
    }

    // Verify that the partner is a matched contact
    // Check if users have mutual likes (either 'matched' or both 'liked')
    console.log('Verifying match between:', { userId, partnerId })

    // Query for both users' like records
    const { data: likes1, error: error1 } = await supabase
      .from('likes')
      .select('id, status')
      .eq('user_id', userId)
      .eq('liked_user_id', partnerId)
      .limit(1)

    const { data: likes2, error: error2 } = await supabase
      .from('likes')
      .select('id, status')
      .eq('user_id', partnerId)
      .eq('liked_user_id', userId)
      .limit(1)

    if (error1 || error2) {
      console.error('Match query error:', {
        error1: error1 ? { code: error1.code, message: error1.message } : null,
        error2: error2 ? { code: error2.code, message: error2.message } : null,
      })
      return NextResponse.json(
        { error: 'Failed to verify match' },
        { status: 500 }
      )
    }

    const like1 = likes1?.[0]
    const like2 = likes2?.[0]

    // Allow calls if:
    // 1. Either side has explicitly marked as 'matched'
    // 2. Both sides have 'liked' (mutual like, even if not yet updated to 'matched')
    const isMutualLike = like1 && like2 && like1.status !== 'disliked' && like2.status !== 'disliked'
    const hasExplicitMatch = (like1?.status === 'matched') || (like2?.status === 'matched')
    const isValidMatch = isMutualLike || hasExplicitMatch

    if (!isValidMatch) {
      console.warn('No valid match found between users:', {
        userId,
        partnerId,
        like1: like1 ? { status: like1.status } : null,
        like2: like2 ? { status: like2.status } : null,
      })
      return NextResponse.json(
        { error: 'Not a valid match' },
        { status: 403 }
      )
    }

    // Ensure both records are marked as 'matched' for consistency
    // This handles the case where users might be calling between 'liked' and 'matched' states
    if (isMutualLike && !hasExplicitMatch) {
      // Both users have liked each other but neither is marked as 'matched' yet
      // Update both to 'matched' atomically (in background, don't block the call)
      Promise.all([
        supabase
          .from('likes')
          .update({ status: 'matched' })
          .eq('user_id', userId)
          .eq('liked_user_id', partnerId),
        supabase
          .from('likes')
          .update({ status: 'matched' })
          .eq('user_id', partnerId)
          .eq('liked_user_id', userId),
      ]).catch((err) => {
        console.warn('Failed to update match status to matched:', err)
      })
    }

    // Log successful match found
    console.log('Match verified for video call:', { userId, partnerId })

    // Generate channel name and Agora token
    const channelName = generateChannelName(userId, partnerId)
    const agoraUid = userIdToAgoraUid(userId)

    console.log('Generating token:', { channelName, agoraUid, userId })

    let agoraToken: string
    try {
      agoraToken = generateAgoraToken(agoraAppId, channelName, agoraUid)
    } catch (tokenError: any) {
      console.error('Failed to generate Agora token:', {
        message: tokenError.message || String(tokenError),
        stack: tokenError.stack,
      })
      return NextResponse.json(
        { error: 'Failed to generate video token' },
        { status: 500 }
      )
    }

    if (!agoraToken) {
      console.error('Agora token generation returned empty token', {
        channelName,
        agoraUid,
      })
      return NextResponse.json(
        { error: 'Failed to generate video token' },
        { status: 500 }
      )
    }

    console.log('Token generated successfully')
    return NextResponse.json({
      token: agoraToken,
      uid: agoraUid,
      channelName,
    })
  } catch (err: any) {
    console.error('Token generation error:', {
      message: err.message || String(err),
      stack: err.stack,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
