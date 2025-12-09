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
          .select('id,user_id,full_name,photos,main_photo_index,created_at,age,location,bio')
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
          setError(err.message)
          console.error('Error fetching profiles:', err)
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
        .select('*')
        .neq('user_id', user.id)
        .eq('profile_complete', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err
      setProfiles((data as ProfileData[]) || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching profiles:', err)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const likeProfile = useCallback(
    async (likedUserId: string, likedProfileId?: string) => {
      if (!user) throw new Error('No user logged in')

      try {
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
          .insert({
            user_id: user.id,
            liked_user_id: likedUserId,
            status: 'disliked',
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
