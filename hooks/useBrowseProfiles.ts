import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useProfile } from './useProfile'
import type { ProfileData } from './useProfile'
import { useSubscription } from '@/hooks/useSubscription'
import { calculateCompatibilityPercentage, isOrientationCompatible } from '@/utils/matching'

const FREE_DAILY_PROFILE_LIMIT = 10
const PROFILE_FETCH_TIMEOUT_MS = 15000
const CANDIDATE_CACHE_TTL_MS = 5 * 60 * 1000

type BrowseDeck = { key: string; fetchedAt: number; profiles: BrowseProfileData[]; index: number }
type BrowseCache = {
  candidates?: ProfileData[]
  fetchedAt?: number
  pending?: Promise<ProfileData[]>
  deck?: BrowseDeck
  consumed: Set<string>
  pendingActions: Set<string>
  listeners: Set<() => void>
  usage?: { key: string; ids: string[] }
}

// Session-only, keyed by authenticated user. The deck survives route remounts.
const browseCache = new Map<string, BrowseCache>()
function getBrowseCache(userId: string): BrowseCache {
  let cache = browseCache.get(userId)
  if (!cache) {
    cache = { consumed: new Set(), pendingActions: new Set(), listeners: new Set() }
    browseCache.set(userId, cache)
  }
  return cache
}

function loadCandidates(userId: string, force = false): Promise<ProfileData[]> {
  const cache = getBrowseCache(userId)
  if (cache.pending) return cache.pending
  if (!force && cache.candidates && Date.now() - (cache.fetchedAt || 0) < CANDIDATE_CACHE_TTL_MS) {
    return Promise.resolve(cache.candidates)
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS)
  const pending = (async () => {
    try {
      const { data, error } = await fetchBrowseProfiles(userId, controller.signal)
      if (error) throw error
      cache.candidates = (data as unknown as ProfileData[]) || []
      cache.fetchedAt = Date.now()
      return cache.candidates
    } catch (error) {
      if (controller.signal.aborted) throw new Error('Loading profiles timed out. Please try again.')
      throw error
    } finally {
      clearTimeout(timeout)
      cache.pending = undefined
    }
  })()
  cache.pending = pending
  return pending
}

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
  const userId: string | null = user?.id ?? null
  const activeUserId = useRef(userId)
  activeUserId.current = userId
  const { profile: loadedProfile, loading: profileLoading } = useProfile()
  const currentProfile = loadedProfile?.user_id === userId ? loadedProfile : null
  const [deckState, setDeckState] = useState<{ userId: string; deck: BrowseDeck } | null>(null)
  const [usage, setUsage] = useState<{ key: string | null; ids: string[] }>({ key: null, ids: [] })
  const usageRef = useRef(usage)
  const [loadState, setLoadState] = useState<{ userId: string | null; loading: boolean; error: string | null }>({ userId: null, loading: true, error: null })
  const [refreshVersion, setRefreshVersion] = useState(0)
  const usageKey = userId ? `browse-profile-views:${userId}:${new Date().toISOString().slice(0, 10)}` : null
  const usageReady = usage.key === usageKey

  useEffect(() => {
    let ids: string[] = []
    if (usageKey) {
      try {
        const parsed = JSON.parse(localStorage.getItem(usageKey) || '[]')
        ids = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
      } catch {
        const cachedUsage = userId ? getBrowseCache(userId).usage : undefined
        ids = cachedUsage?.key === usageKey ? cachedUsage.ids : []
      }
      if (userId) {
        const cache = getBrowseCache(userId)
        if (cache.usage?.key === usageKey) ids = [...new Set([...ids, ...cache.usage.ids])]
        cache.usage = { key: usageKey, ids }
      }
    }
    const next = { key: usageKey, ids }
    usageRef.current = next
    setUsage(next)
  }, [usageKey, userId])

  const recordProfileView = useCallback((profileId: string) => {
    if (!usageKey || usageRef.current.key !== usageKey || isPremium || usageRef.current.ids.includes(profileId)) return
    const next = { key: usageKey, ids: [...usageRef.current.ids, profileId] }
    usageRef.current = next
    if (userId) getBrowseCache(userId).usage = { key: usageKey, ids: next.ids }
    try { localStorage.setItem(usageKey, JSON.stringify(next.ids)) } catch { /* Keep the in-memory count. */ }
    setUsage(next)
  }, [isPremium, usageKey, userId])

  const dailyViewsRemaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_PROFILE_LIMIT - (usageReady ? usage.ids.length : 0))
  // The profile snapshot controls ranking, not candidate fetching.
  const deckKey = JSON.stringify([usageKey, isPremium, currentProfile])

  useEffect(() => {
    if (!userId || !usageReady || profileLoading) return
    let active = true
    const cache = getBrowseCache(userId)
    setLoadState({ userId, loading: true, error: null })
    loadCandidates(userId).then((candidates) => {
      if (!active) return
      // Read the deck after the request resolves: a swipe may have completed meanwhile.
      let deck = cache.deck
      if (!deck || deck.key !== deckKey || deck.fetchedAt !== cache.fetchedAt) {
        const previous = deck?.profiles[deck.index]
        const ranked = rankProfiles(candidates, currentProfile).filter((item) => !cache.consumed.has(item.user_id))
        const activeCard = previous && ranked.find((item) => item.user_id === previous.user_id)
        const remaining = Math.max(0, FREE_DAILY_PROFILE_LIMIT - usageRef.current.ids.length)
        const keepActive = activeCard && (isPremium || remaining > 0 || usageRef.current.ids.includes(activeCard.user_id))
        const others = ranked.filter((item) => item.user_id !== (keepActive ? activeCard.user_id : null) && (isPremium || !usageRef.current.ids.includes(item.user_id)))
        const activeCostsView = keepActive && !usageRef.current.ids.includes(activeCard.user_id) ? 1 : 0
        const profiles = [
          ...(keepActive ? [activeCard] : []),
          ...(isPremium ? others : others.slice(0, Math.max(0, remaining - activeCostsView))),
        ]
        deck = { key: deckKey, fetchedAt: cache.fetchedAt || 0, profiles, index: 0 }
        cache.deck = deck
      }
      setDeckState({ userId, deck })
      setLoadState({ userId, loading: false, error: null })
    }).catch((err: any) => {
      if (!active) return
      const message = err?.message || 'Failed to fetch profiles'
      console.error('Error fetching profiles:', message, err)
      setLoadState({ userId, loading: false, error: message })
    })
    return () => { active = false }
  }, [userId, usageReady, profileLoading, loadedProfile, deckKey, isPremium, refreshVersion])

  const fetchProfiles = useCallback(async () => {
    if (!userId) return
    const cache = getBrowseCache(userId)
    // Invalidate the deck only after the fetch succeeds, so actions cannot rewind it.
    try {
      await loadCandidates(userId, true)
      if (cache.deck) cache.deck = { ...cache.deck, key: '' }
      if (activeUserId.current === userId) setRefreshVersion((version) => version + 1)
    } catch (err: any) {
      if (activeUserId.current === userId) setLoadState({ userId, loading: false, error: err?.message || 'Failed to fetch profiles' })
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const cache = getBrowseCache(userId)
    const update = () => {
      if (activeUserId.current === userId && cache.deck) setDeckState({ userId, deck: cache.deck })
    }
    cache.listeners.add(update)
    return () => { cache.listeners.delete(update) }
  }, [userId])

  const beginProfileAction = useCallback((profileId: string) => {
    if (!userId) return false
    const pending = getBrowseCache(userId).pendingActions
    if (pending.has(profileId)) return false
    pending.add(profileId)
    getBrowseCache(userId).listeners.forEach((listener) => listener())
    return true
  }, [userId])
  const endProfileAction = useCallback((profileId: string) => {
    if (userId) {
      const cache = getBrowseCache(userId)
      cache.pendingActions.delete(profileId)
      cache.listeners.forEach((listener) => listener())
    }
  }, [userId])

  const advanceProfile = useCallback((profileId: string) => {
    if (!userId) return
    const cache = getBrowseCache(userId)
    const deck = cache.deck
    cache.consumed.add(profileId)
    if (!deck || deck.profiles[deck.index]?.user_id !== profileId) return
    cache.deck = { ...deck, index: deck.index + 1 }
    cache.listeners.forEach((listener) => listener())
  }, [userId])
  const visibleDeck = deckState?.userId === userId ? deckState.deck : null
  const profiles = visibleDeck?.profiles ?? []
  const currentIndex = visibleDeck?.index ?? 0
  const actionPending = !!userId && !!profiles[currentIndex] && getBrowseCache(userId).pendingActions.has(profiles[currentIndex].user_id)
  const loading = !!userId && (!usageReady || profileLoading || loadState.userId !== userId || loadState.loading)
  const error = loadState.userId === userId ? loadState.error : null

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
    currentIndex,
    advanceProfile,
    beginProfileAction,
    endProfileAction,
    actionPending,
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
