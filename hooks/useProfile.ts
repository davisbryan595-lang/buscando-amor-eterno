import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (err && err.code !== 'PGRST116') {
        throw err
      }

      if (data) {
        setProfile(data as ProfileData)
      } else {
        setProfile(null)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data: newProfile, error: err } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...data,
          })
          .select()
          .single()

        if (err) throw err
        setProfile(newProfile as ProfileData)
        return newProfile as ProfileData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data: updatedProfile, error: err } = await supabase
          .from('profiles')
          .update(data)
          .eq('user_id', user.id)
          .select()
          .single()

        if (err) throw err
        setProfile(updatedProfile as ProfileData)
        return updatedProfile as ProfileData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const uploadPhoto = useCallback(
    async (file: File, index: number) => {
      if (!user) throw new Error('No user logged in')

      try {
        const fileName = `${user.id}/${Date.now()}-${file.name}`
        const { data, error: uploadErr } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file, { upsert: true })

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName)

        // If profile exists, update it with the new photo
        if (profile) {
          const currentPhotos = profile.photos || []
          const newPhotos = [...currentPhotos]
          newPhotos[index] = publicUrl
          await updateProfile({ photos: newPhotos } as any)
        }

        return publicUrl
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user, profile, updateProfile]
  )

  const deletePhoto = useCallback(
    async (index: number) => {
      if (!profile?.photos || !profile.photos[index]) return

      try {
        const newPhotos = profile.photos.filter((_, i) => i !== index)
        await updateProfile({
          photos: newPhotos,
          main_photo_index:
            profile.main_photo_index === index ? 0 : profile.main_photo_index,
        } as any)
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user, profile, updateProfile]
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
    deletePhoto,
    reorderPhotos,
    setMainPhoto,
  }
}
