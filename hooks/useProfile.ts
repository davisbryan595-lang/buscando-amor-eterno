import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface ProfileData {
  id: string
  user_id: string
  full_name: string | null
  birthday: string | null
  gender: string | null
  looking_for: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  photos: string[] | null
  main_photo_index: number | null
  prompt_1: string | null
  prompt_2: string | null
  prompt_3: string | null
  prompt_4: string | null
  prompt_5: string | null
  prompt_6: string | null
  love_language: string | null
  relationship_type: string | null
  age_range_min: number | null
  age_range_max: number | null
  distance_radius: number | null
  height_cm: number | null
  religion: string | null
  wants_kids: string | null
  smoking: string | null
  drinking: string | null
  dealbreakers: string[] | null
  profile_complete: boolean
  created_at: string
  updated_at: string
}

type ProfileSnapshot = { profile: ProfileData | null; loading: boolean; error: string | null }
type ProfileEntry = {
  snapshot: ProfileSnapshot
  listeners: Set<() => void>
  fetchedAt: number
  revision: number
  generation: number
  nextMutation: number
  appliedMutation: number
  inFlight: Promise<void> | null
  fetchTimeout: ReturnType<typeof setTimeout> | null
  evictionTimeout: ReturnType<typeof setTimeout> | null
}

// Successful results (including a missing profile) are reused briefly on remount.
const CACHE_TTL = 60_000
const EMPTY_PROFILE: ProfileSnapshot = { profile: null, loading: true, error: null }
const SIGNED_OUT_PROFILE: ProfileSnapshot = { profile: null, loading: false, error: null }
const entries = new Map<string, ProfileEntry>()
let authListenerInstalled = false

function getEntry(userId: string): ProfileEntry {
  let entry = entries.get(userId)
  if (!entry) {
    entry = { snapshot: EMPTY_PROFILE, listeners: new Set(), fetchedAt: 0, revision: 0, generation: 0,
      nextMutation: 0, appliedMutation: 0, inFlight: null, fetchTimeout: null, evictionTimeout: null }
    entries.set(userId, entry)
    const created = entry
    entry.evictionTimeout = setTimeout(() => {
      if (!created.listeners.size && entries.get(userId) === created) invalidateEntry(userId, created)
    }, CACHE_TTL)
  }
  return entry
}

function publish(entry: ProfileEntry, changes: Partial<ProfileSnapshot>) {
  entry.snapshot = { ...entry.snapshot, ...changes }
  entry.listeners.forEach(listener => listener())
}

function invalidateEntry(userId: string, entry: ProfileEntry) {
  entry.revision++
  entry.generation++
  entry.inFlight = null
  entry.fetchedAt = 0
  if (entry.fetchTimeout) clearTimeout(entry.fetchTimeout)
  if (entry.evictionTimeout) clearTimeout(entry.evictionTimeout)
  entry.fetchTimeout = null
  entry.evictionTimeout = null
  if (entry.listeners.size) {
    publish(entry, EMPTY_PROFILE)
  } else {
    entries.delete(userId)
  }
}

function installAuthListener() {
  if (authListenerInstalled || typeof window === 'undefined') return
  authListenerInstalled = true
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && session?.user)) {
      for (const [id, entry] of entries) {
        if (event === 'SIGNED_OUT' || id !== session?.user?.id) invalidateEntry(id, entry)
      }
      if (event === 'SIGNED_IN' && session?.user) {
        const entry = entries.get(session.user.id)
        if (entry?.listeners.size && !entry.fetchedAt) void fetchSharedProfile(session.user.id)
      }
    }
  })
}

function subscribeToProfile(userId: string, listener: () => void) {
  installAuthListener()
  const entry = getEntry(userId)
  if (entry.evictionTimeout) clearTimeout(entry.evictionTimeout)
  entry.evictionTimeout = null
  entry.listeners.add(listener)
  return () => {
    entry.listeners.delete(listener)
    if (!entry.listeners.size) {
      entry.evictionTimeout = setTimeout(() => {
        if (!entry.listeners.size && entries.get(userId) === entry) {
          invalidateEntry(userId, entry)
        }
      }, CACHE_TTL)
    }
  }
}

function fetchSharedProfile(userId: string): Promise<void> {
  const entry = getEntry(userId)
  if (entry.inFlight) return entry.inFlight

  const revision = ++entry.revision
  publish(entry, { loading: true })
  // The timeout only stops the loading indicator; a late result can still be used.
  entry.fetchTimeout = setTimeout(() => {
    if (entries.get(userId) === entry && entry.revision === revision) {
      console.warn('Profile fetch timeout - proceeding without profile data')
      entry.fetchTimeout = null
      entry.inFlight = null
      publish(entry, { loading: false })
    }
  }, 60_000)

  const request = Promise.resolve().then(async () => {
    try {
      const { data, error: err } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
      if (err) throw err
      if (data && data.user_id !== userId) throw new Error('Fetched profile does not match authenticated user')
      if (entries.get(userId) === entry && entry.revision === revision) {
        entry.fetchedAt = Date.now()
        publish(entry, { profile: data as ProfileData | null, error: null })
      }
    } catch (err: any) {
      if (entries.get(userId) === entry && entry.revision === revision) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch profile')
        publish(entry, { error: errorMessage })
        console.error('Error fetching profile:', errorMessage, err)
      }
    } finally {
      if (entries.get(userId) === entry && entry.inFlight === request) {
        if (entry.fetchTimeout) clearTimeout(entry.fetchTimeout)
        entry.fetchTimeout = null
        entry.inFlight = null
        publish(entry, { loading: false })
      }
    }
  })
  entry.inFlight = request
  return request
}

export function useProfile() {
  const { user } = useAuth()
  const userId: string | null = user?.id ?? null
  const currentUserId = useRef(userId)
  currentUserId.current = userId

  const subscribe = useCallback((listener: () => void) => userId ? subscribeToProfile(userId, listener) : () => {}, [userId])
  const getSnapshot = useCallback(() => userId ? entries.get(userId)?.snapshot ?? EMPTY_PROFILE : SIGNED_OUT_PROFILE, [userId])
  const getServerSnapshot = useCallback(() => userId ? EMPTY_PROFILE : SIGNED_OUT_PROFILE, [userId])
  const { profile, loading, error } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (!userId) return
    const entry = getEntry(userId)
    if (!entry.fetchedAt || Date.now() - entry.fetchedAt >= CACHE_TTL) {
      void fetchSharedProfile(userId)
    }
  }, [userId])

  const fetchProfile = useCallback(async () => {
    if (!userId || currentUserId.current !== userId) return
    await fetchSharedProfile(userId)
  }, [userId])

  const beginMutation = useCallback(() => {
    if (!userId || currentUserId.current !== userId) throw new Error('No user logged in')
    const entry = getEntry(userId)
    return { entry, generation: entry.generation, mutation: ++entry.nextMutation }
  }, [userId])

  const isCurrent = useCallback((operation: ReturnType<typeof beginMutation>) =>
    !!userId && currentUserId.current === userId && entries.get(userId) === operation.entry &&
    operation.entry.generation === operation.generation, [userId])

  const setError = useCallback((operation: ReturnType<typeof beginMutation>, message: string) => {
    if (isCurrent(operation)) publish(operation.entry, { error: message })
  }, [isCurrent])

  const applyMutation = useCallback((operation: ReturnType<typeof beginMutation>, result: ProfileData) => {
    const { entry, mutation } = operation
    if (isCurrent(operation) && mutation > entry.appliedMutation && result?.user_id === userId) {
      entry.appliedMutation = mutation
      // A fetch begun before this write must not overwrite the write's result.
      entry.revision++
      if (entry.fetchTimeout) clearTimeout(entry.fetchTimeout)
      entry.fetchTimeout = null
      entry.inFlight = null
      entry.fetchedAt = Date.now()
      publish(entry, { profile: result, loading: false })
    }
  }, [userId, isCurrent])

  const createProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      const operation = beginMutation()

      try {
        // Try insert first (faster for new profiles)
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert({
            ...data,
            user_id: userId,
          })
          .select()
          .single()

        // If insert fails with duplicate key, update instead
        if (insertErr?.code === '23505') {
          if (!isCurrent(operation)) throw new Error('Authentication changed')
          const { data: updatedProfile, error: updateErr } = await supabase
            .from('profiles')
            .update(data)
            .eq('user_id', userId)
            .select()
            .single()

          if (updateErr) throw updateErr
          applyMutation(operation, updatedProfile as ProfileData)
          return updatedProfile as ProfileData
        }

        if (insertErr) throw insertErr
        applyMutation(operation, newProfile as ProfileData)
        return newProfile as ProfileData
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to create profile')
        setError(operation, errorMessage)
        throw err
      }
    },
    [userId, beginMutation, applyMutation, setError, isCurrent]
  )

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      const operation = beginMutation()

      try {
        const { data: updatedProfile, error: err } = await supabase
          .from('profiles')
          .update(data)
          .eq('user_id', userId)
          .select()
          .single()

        if (err) throw err
        applyMutation(operation, updatedProfile as ProfileData)
        return updatedProfile as ProfileData
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to update profile')
        setError(operation, errorMessage)
        throw err
      }
    },
    [userId, beginMutation, applyMutation, setError]
  )

  const uploadPhoto = useCallback(
    async (file: File, index: number) => {
      const operation = beginMutation()

      try {
        const fileName = `${userId}/${Date.now()}-${file.name}`
        const { error: uploadErr } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, { upsert: true })

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName)

        // If profile exists, update it with the new photo
        if (profile) {
          if (!isCurrent(operation)) throw new Error('Authentication changed')
          const currentPhotos = profile.photos || []
          const newPhotos = [...currentPhotos]
          newPhotos[index] = publicUrl
          await updateProfile({ photos: newPhotos } as any)
        }

        return publicUrl
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to upload photo')
        setError(operation, errorMessage)
        throw err
      }
    },
    [userId, profile, updateProfile, beginMutation, isCurrent, setError]
  )

  const uploadPhotoOnly = useCallback(
    async (file: File) => {
      const operation = beginMutation()

      try {
        const fileName = `${userId}/${Date.now()}-${file.name}`
        const { error: uploadErr } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, { upsert: true })

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName)

        return publicUrl
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to upload photo')
        setError(operation, errorMessage)
        throw err
      }
    },
    [userId, beginMutation, setError]
  )

  const deletePhoto = useCallback(
    async (index: number) => {
      if (!profile?.photos || !profile.photos[index]) return
      const operation = beginMutation()

      try {
        const newPhotos = profile.photos.filter((_, i) => i !== index)
        await updateProfile({
          photos: newPhotos,
          main_photo_index:
            profile.main_photo_index === index ? 0 : profile.main_photo_index,
        } as any)
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to delete photo')
        setError(operation, errorMessage)
        throw err
      }
    },
    [profile, updateProfile, beginMutation, setError]
  )

  const reorderPhotos = useCallback(
    async (newPhotos: string[]) => {
      await updateProfile({ photos: newPhotos } as any)
    },
    [updateProfile]
  )

  const setMainPhoto = useCallback(
    async (index: number) => {
      await updateProfile({ main_photo_index: index } as any)
    },
    [updateProfile]
  )

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    uploadPhoto,
    uploadPhotoOnly,
    deletePhoto,
    reorderPhotos,
    setMainPhoto,
  }
}
