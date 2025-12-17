import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useSubscription } from './useSubscription'
import { useProfile } from './useProfile'
import type { ProfileData } from './useProfile'

export function useBrowseProfiles() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const { profile: currentProfile } = useProfile()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    const fetchProfilesData = async () => {
      try {
        setLoading(true)

        const { data, error: err } = await supabase
          .from('profiles')
          .select('id,user_id,full_name,birthday,city,country,photos,main_photo_index,created_at,prompt_1')
          .neq('user_id', user.id)
          .eq('profile_complete', true)
          .order('created_at', { ascending: false })
          .limit(100)

        if (!isMounted) return

        if (err) throw err
        setProfiles((data as ProfileData[]) || [])
        setError(null)
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch profiles')
          setError(errorMessage)
          console.error('Error fetching profiles:', errorMessage, err)
          setProfiles([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfilesData()

    return () => {
      isMounted = false
    }
  }, [user])

  const fetchProfiles = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id,user_id,full_name,birthday,city,country,photos,main_photo_index,created_at,prompt_1')
        .neq('user_id', user.id)
        .eq('profile_complete', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setProfiles((data as ProfileData[]) || [])
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch profiles')
      setError(errorMessage)
      console.error('Error fetching profiles:', errorMessage, err)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const likeProfile = useCallback(
    async (likedUserId: string, likedProfileId?: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        // Create or update the like record
        const { error: err } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            liked_user_id: likedUserId,
            status: 'liked',
          }, {
            onConflict: 'user_id,liked_user_id'
          })

        if (err) throw err

        // Check if the other user has already liked this user (mutual like)
        const { data: mutualLike, error: checkErr } = await supabase
          .from('likes')
          .select('id, status')
          .eq('user_id', likedUserId)
          .eq('liked_user_id', user.id)
          .maybeSingle()

        if (checkErr) {
          console.warn('Warning: could not check for mutual like:', checkErr.message)
        }

        // If mutual like found, update both records to 'matched'
        if (mutualLike && mutualLike.status === 'liked') {
          const { error: updateErr } = await supabase
            .from('likes')
            .update({ status: 'matched' })
            .or(`and(user_id.eq.${user.id},liked_user_id.eq.${likedUserId}),and(user_id.eq.${likedUserId},liked_user_id.eq.${user.id})`)

          if (updateErr) {
            console.warn('Warning: could not update mutual match status:', updateErr.message)
          }
        }

        // Only create notification if we have the liked profile ID
        if (likedProfileId) {
          const { error: notifErr } = await supabase.from('notifications').insert({
            recipient_id: likedUserId,
            liker_id: user.id,
            liked_profile_id: likedProfileId,
          })

          if (notifErr) {
            console.warn('Warning: notification not created:', notifErr.message)
          }
        }
      } catch (err: any) {
        console.error('Error liking profile:', err instanceof Error ? err.message : JSON.stringify(err))
        throw err
      }
    },
    [user, isPremium]
  )

  const dislikeProfile = useCallback(
    async (likedUserId: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { error: err } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            liked_user_id: likedUserId,
            status: 'disliked',
          }, {
            onConflict: 'user_id,liked_user_id'
          })

        if (err) throw err
      } catch (err: any) {
        console.error('Error disliking profile:', err instanceof Error ? err.message : JSON.stringify(err))
        throw err
      }
    },
    [user]
  )

  const superLikeProfile = useCallback(
    async (likedUserId: string, likedProfileId?: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        // Create or update the like record
        const { error: err } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            liked_user_id: likedUserId,
            status: 'liked',
          }, {
            onConflict: 'user_id,liked_user_id'
          })

        if (err) throw err

        // Check if the other user has already liked this user (mutual like)
        const { data: mutualLike, error: checkErr } = await supabase
          .from('likes')
          .select('id, status')
          .eq('user_id', likedUserId)
          .eq('liked_user_id', user.id)
          .maybeSingle()

        if (checkErr) {
          console.warn('Warning: could not check for mutual like:', checkErr.message)
        }

        // If mutual like found, update both records to 'matched'
        if (mutualLike && mutualLike.status === 'liked') {
          const { error: updateErr } = await supabase
            .from('likes')
            .update({ status: 'matched' })
            .or(`and(user_id.eq.${user.id},liked_user_id.eq.${likedUserId}),and(user_id.eq.${likedUserId},liked_user_id.eq.${user.id})`)

          if (updateErr) {
            console.warn('Warning: could not update mutual match status:', updateErr.message)
          }
        }

        // Only create notification if we have the liked profile ID
        if (likedProfileId) {
          const { error: notifErr } = await supabase.from('notifications').insert({
            recipient_id: likedUserId,
            liker_id: user.id,
            liked_profile_id: likedProfileId,
          })

          if (notifErr) {
            console.warn('Warning: notification not created:', notifErr.message)
          }
        }
      } catch (err: any) {
        console.error('Error super liking profile:', err instanceof Error ? err.message : JSON.stringify(err))
        throw err
      }
    },
    [user, isPremium]
  )

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    likeProfile,
    dislikeProfile,
    superLikeProfile,
  }
}
