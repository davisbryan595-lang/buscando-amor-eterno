import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useSubscription } from './useSubscription'
import type { ProfileData } from './useProfile'

export function useBrowseProfiles() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchProfiles()
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
    async (profileId: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { error: err } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            liked_user_id: profileId,
            status: 'liked',
          })

        if (err) throw err
      } catch (err: any) {
        console.error('Error liking profile:', err)
        throw err
      }
    },
    [user]
  )

  const dislikeProfile = useCallback(
    async (profileId: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { error: err } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            liked_user_id: profileId,
            status: 'disliked',
          })

        if (err) throw err
      } catch (err: any) {
        console.error('Error disliking profile:', err)
        throw err
      }
    },
    [user]
  )

  const superLikeProfile = useCallback(
    async (profileId: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { error: err } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            liked_user_id: profileId,
            status: 'liked',
          })

        if (err) throw err
      } catch (err: any) {
        console.error('Error super liking profile:', err)
        throw err
      }
    },
    [user]
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
