import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const userId = user.id

    // Fetch profile photos before deletion so we can remove from storage
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('photos')
      .eq('user_id', userId)
      .single()

    // Delete photos from storage
    if (profile?.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
      const filePaths = profile.photos
        .map((url: string) => {
          const match = url.match(/profile-photos\/(.+)$/)
          return match ? match[1] : null
        })
        .filter(Boolean) as string[]

      if (filePaths.length > 0) {
        await supabaseAdmin.storage.from('profile-photos').remove(filePaths)
      }
    }

    // Delete all user data in order (respecting foreign keys)
    await supabaseAdmin.from('call_invitations').delete().or(`caller_id.eq.${userId},recipient_id.eq.${userId}`)
    await supabaseAdmin.from('call_logs').delete().or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId)
    await supabaseAdmin.from('lounge_messages').delete().eq('user_id', userId)
    await supabaseAdmin.from('lounge_reports').delete().or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`)
    await supabaseAdmin.from('reports').delete().or(`reported_by_user_id.eq.${userId},reported_user_id.eq.${userId}`)
    await supabaseAdmin.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    await supabaseAdmin.from('matches').delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    await supabaseAdmin.from('likes').delete().or(`user_id.eq.${userId},liked_user_id.eq.${userId}`)
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId)
    await supabaseAdmin.from('users').delete().eq('id', userId)

    // Delete the auth user last
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteAuthError) throw deleteAuthError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
