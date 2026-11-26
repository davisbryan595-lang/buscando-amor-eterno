import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useProfile } from './useProfile'
import type { ProfileData } from './useProfile'
import { useSubscription } from '@/hooks/useSubscription'
import { calculateCompatibilityPercentage, isOrientationCompatible } from '@/utils/matching'

const FREE_DAILY_PROFILE_LIMIT = 10
const PROFILE_FETCH_TIMEOUT_MS = 15000

export type BrowseProfileData = ProfileData & { compatibility: number }

const BROWSE_FIELDS = [
  'id', 'user_id', 'full_name', 'birthday', 'gender', 'looking_for',
  'city', 'country', 'latitude', 'longitude',
  'photos', 'main_photo_index', 'created_at',
  'prompt_1', 'prompt_2', 'prompt_3', 'prompt_4',
  'religion', 'wants_kids', 'age_range_min', 'age_range_max', 'distance_radius',
].join(',')

function fetchBrowseProfiles(userId: string, signal: AbortSignal) {
  return supabase
    .from('profiles')
    .select(BROWSE_FIELDS)
    .neq('user_id', userId)
    .eq('profile_complete', true)
    .or('banned.is.null,banned.eq.false')
    .limit(200)
    .abortSignal(signal)
}

function rankProfiles(candidates: ProfileData[], currentProfile: ProfileData | null): BrowseProfileData[] {
  return candidates
    .filter((p) => !currentProfile || isOrientationCompatible(currentProfile, p))
    .map((p) => ({
      ...p,
      compatibility: currentProfile ? calculateCompatibilityPercentage(currentProfile, p) : 0,
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
}

export function useBrowseProfiles() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const { profile: currentProfile } = useProfile()
  const [profiles, setProfiles] = useState<BrowseProfileData[]>([])
  const [dailyViewedProfileIds, setDailyViewedProfileIds] = useState<string[]>([])
  const dailyViewedProfileIdsRef = useRef<string[]>([])
  const [usageReady, setUsageReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const usageKey = user ? `browse-profile-views:${user.id}:${new Date().toISOString().slice(0, 10)}` : null

  useEffect(() => {
    if (!usageKey) {
      dailyViewedProfileIdsRef.current = []
      setDailyViewedProfileIds([])
      setUsageReady(true)
      return
    }

    setUsageReady(false)
    try {
      const stored = localStorage.getItem(usageKey)
      const parsed = stored ? JSON.parse(stored) : []
      const viewedIds = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
      dailyViewedProfileIdsRef.current = viewedIds
      setDailyViewedProfileIds(viewedIds)
    } catch {
      dailyViewedProfileIdsRef.current = []
      setDailyViewedProfileIds([])
    }
    setUsageReady(true)
  }, [usageKey])

  const recordProfileView = useCallback((profileId: string) => {
    if (!usageKey || isPremium || dailyViewedProfileIdsRef.current.includes(profileId)) return

    const next = [...dailyViewedProfileIdsRef.current, profileId]
    dailyViewedProfileIdsRef.current = next
    localStorage.setItem(usageKey, JSON.stringify(next))
    setDailyViewedProfileIds(next)
  }, [isPremium, usageKey])

  const dailyViewsRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_DAILY_PROFILE_LIMIT - dailyViewedProfileIds.length)

  useEffect(() => {
    if (!user || !usageReady) {
      setLoading(!usageReady)
      return
    }

    let isMounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS)

    const fetchProfilesData = async () => {
      try {
        setLoading(true)

        const { data, error: err } = await fetchBrowseProfiles(user.id, controller.signal)

        if (!isMounted) return

        if (err) throw err
        const ranked = rankProfiles((data as ProfileData[]) || [], currentProfile)
        const unseen = isPremium ? ranked : ranked.filter((item) => !dailyViewedProfileIdsRef.current.includes(item.user_id))
        setProfiles(isPremium ? unseen : unseen.slice(0, dailyViewsRemaining))
        setError(null)
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = controller.signal.aborted
            ? 'Loading profiles timed out. Please try again.'
            : err?.message || (typeof err === 'string' ? err : 'Failed to fetch profiles')
          setError(errorMessage)
          console.error('Error fetching profiles:', errorMessage, err)
          setProfiles([])
        }
      } finally {
        clearTimeout(timeoutId)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfilesData()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [user, currentProfile, usageReady, isPremium, usageKey])

  const fetchProfiles = async () => {
    if (!user || !usageReady) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS)

    try {
      setLoading(true)
      const { data, error: err } = await fetchBrowseProfiles(user.id, controller.signal)

      if (err) throw err
      const ranked = rankProfiles((data as ProfileData[]) || [], currentProfile)
      const unseen = isPremium ? ranked : ranked.filter((item) => !dailyViewedProfileIdsRef.current.includes(item.user_id))
      setProfiles(isPremium ? unseen : unseen.slice(0, dailyViewsRemaining))
      setError(null)
    } catch (err: any) {
      const errorMessage = controller.signal.aborted
        ? 'Loading profiles timed out. Please try again.'
        : err?.message || (typeof err === 'string' ? err : 'Failed to fetch profiles')
      setError(errorMessage)
      console.error('Error fetching profiles:', errorMessage, err)
      setProfiles([])
    } finally {
      clearTimeout(timeoutId)
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
        if (mutualLike && (mutualLike.status === 'liked' || mutualLike.status === 'matched')) {
          // Update both records in parallel for better atomicity
          const [updateRes1, updateRes2] = await Promise.all([
            supabase
              .from('likes')
              .update({ status: 'matched' })
              .eq('user_id', likedUserId)
              .eq('liked_user_id', user.id),
            supabase
              .from('likes')
              .update({ status: 'matched' })
              .eq('user_id', user.id)
              .eq('liked_user_id', likedUserId),
          ])

          const updateErr1 = updateRes1.error
          const updateErr2 = updateRes2.error

          if (updateErr1 || updateErr2) {
            console.warn('Warning: could not fully update mutual match status:', {
              updateErr1: updateErr1?.message,
              updateErr2: updateErr2?.message,
            })
          }

          // Create match notifications for both users
          try {
            await Promise.all([
              supabase.from('notifications').insert({
                recipient_id: likedUserId,
                from_user_id: user.id,
                type: 'match',
              }),
              supabase.from('notifications').insert({
                recipient_id: user.id,
                from_user_id: likedUserId,
                type: 'match',
              }),
            ])
          } catch (err) {
            console.warn('Warning: match notifications not created:', err)
          }
        }

        // Create like notification
        if (likedProfileId) {
          try {
            await supabase.from('notifications').insert({
              recipient_id: likedUserId,
              liker_id: user.id,
              liked_profile_id: likedProfileId,
              type: 'like',
            })
          } catch (notifErr) {
            console.warn('Warning: like notification not created:', notifErr)
          }
        }
      } catch (err: any) {
        console.error('Error liking profile:', err instanceof Error ? err.message : JSON.stringify(err))
        throw err
      }
    },
    [user]
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
        if (mutualLike && (mutualLike.status === 'liked' || mutualLike.status === 'matched')) {
          // Update both records in parallel for better atomicity
          const [updateRes1, updateRes2] = await Promise.all([
            supabase
              .from('likes')
              .update({ status: 'matched' })
              .eq('user_id', likedUserId)
              .eq('liked_user_id', user.id),
            supabase
              .from('likes')
              .update({ status: 'matched' })
              .eq('user_id', user.id)
              .eq('liked_user_id', likedUserId),
          ])

          const updateErr1 = updateRes1.error
          const updateErr2 = updateRes2.error

          if (updateErr1 || updateErr2) {
            console.warn('Warning: could not fully update mutual match status:', {
              updateErr1: updateErr1?.message,
              updateErr2: updateErr2?.message,
            })
          }

          // Create match notifications for both users
          try {
            await Promise.all([
              supabase.from('notifications').insert({
                recipient_id: likedUserId,
                from_user_id: user.id,
                type: 'match',
              }),
              supabase.from('notifications').insert({
                recipient_id: user.id,
                from_user_id: likedUserId,
                type: 'match',
              }),
            ])
          } catch (err) {
            console.warn('Warning: match notifications not created:', err)
          }
        }

        // Create like notification
        if (likedProfileId) {
          try {
            await supabase.from('notifications').insert({
              recipient_id: likedUserId,
              liker_id: user.id,
              liked_profile_id: likedProfileId,
              type: 'like',
            })
          } catch (notifErr) {
            console.warn('Warning: like notification not created:', notifErr)
          }
        }
      } catch (err: any) {
        console.error('Error super liking profile:', err instanceof Error ? err.message : JSON.stringify(err))
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
    recordProfileView,
    dailyViewsRemaining,
    freeDailyProfileLimit: FREE_DAILY_PROFILE_LIMIT,
    isPremium,
  }
}
