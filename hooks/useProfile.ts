import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { mockDB } from '@/lib/mock-db'
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
      const mockProfile = await mockDB.getProfile(user.id)

      if (mockProfile) {
        // Convert mock profile to ProfileData format
        const profileData: ProfileData = {
          id: mockProfile.id,
          user_id: mockProfile.user_id,
          full_name: mockProfile.full_name || null,
          birthday: null,
          gender: null,
          looking_for: null,
          city: null,
          country: null,
          latitude: null,
          longitude: null,
          photos: mockProfile.photos || null,
          main_photo_index: null,
          prompt_1: null,
          prompt_2: null,
          prompt_3: null,
          prompt_4: null,
          prompt_5: null,
          prompt_6: null,
          love_language: null,
          relationship_type: null,
          age_range_min: mockProfile.preferences?.ageRange?.[0] || null,
          age_range_max: mockProfile.preferences?.ageRange?.[1] || null,
          distance_radius: null,
          height_cm: null,
          religion: null,
          wants_kids: null,
          smoking: null,
          drinking: null,
          dealbreakers: null,
          profile_complete: !!mockProfile.full_name,
          created_at: mockProfile.created_at,
          updated_at: mockProfile.created_at,
        }
        setProfile(profileData)
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
        const mockProfile = await mockDB.updateProfile(user.id, {
          full_name: data.full_name || '',
          bio: '',
          age: 18,
          location: '',
          interests: [],
          photos: data.photos || [],
          preferences: data.age_range_min ? {
            ageRange: [data.age_range_min, data.age_range_max || 50],
          } : {},
        })

        if ('error' in mockProfile) {
          throw mockProfile.error
        }

        const profileData: ProfileData = {
          id: mockProfile.id,
          user_id: mockProfile.user_id,
          full_name: mockProfile.full_name || null,
          birthday: null,
          gender: null,
          looking_for: null,
          city: null,
          country: null,
          latitude: null,
          longitude: null,
          photos: mockProfile.photos || null,
          main_photo_index: null,
          prompt_1: null,
          prompt_2: null,
          prompt_3: null,
          prompt_4: null,
          prompt_5: null,
          prompt_6: null,
          love_language: null,
          relationship_type: null,
          age_range_min: mockProfile.preferences?.ageRange?.[0] || null,
          age_range_max: mockProfile.preferences?.ageRange?.[1] || null,
          distance_radius: null,
          height_cm: null,
          religion: null,
          wants_kids: null,
          smoking: null,
          drinking: null,
          dealbreakers: null,
          profile_complete: !!mockProfile.full_name,
          created_at: mockProfile.created_at,
          updated_at: mockProfile.created_at,
        }
        setProfile(profileData)
        return profileData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user]
  )

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!user || !profile) throw new Error('No user or profile')

      try {
        const mockProfile = await mockDB.updateProfile(user.id, {
          full_name: data.full_name || profile.full_name || '',
          bio: '',
          age: 18,
          location: '',
          interests: [],
          photos: data.photos || profile.photos || [],
          preferences: data.age_range_min ? {
            ageRange: [data.age_range_min, data.age_range_max || 50],
          } : {},
        })

        if ('error' in mockProfile) {
          throw mockProfile.error
        }

        const profileData: ProfileData = {
          id: mockProfile.id,
          user_id: mockProfile.user_id,
          full_name: mockProfile.full_name || null,
          birthday: null,
          gender: null,
          looking_for: null,
          city: null,
          country: null,
          latitude: null,
          longitude: null,
          photos: mockProfile.photos || null,
          main_photo_index: null,
          prompt_1: null,
          prompt_2: null,
          prompt_3: null,
          prompt_4: null,
          prompt_5: null,
          prompt_6: null,
          love_language: null,
          relationship_type: null,
          age_range_min: mockProfile.preferences?.ageRange?.[0] || null,
          age_range_max: mockProfile.preferences?.ageRange?.[1] || null,
          distance_radius: null,
          height_cm: null,
          religion: null,
          wants_kids: null,
          smoking: null,
          drinking: null,
          dealbreakers: null,
          profile_complete: !!mockProfile.full_name,
          created_at: mockProfile.created_at,
          updated_at: mockProfile.created_at,
        }
        setProfile(profileData)
        return profileData
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [user, profile]
  )

  const uploadPhoto = useCallback(
    async (file: File, index: number) => {
      if (!user) throw new Error('No user logged in')

      try {
        const reader = new FileReader()
        const photoUrl = await new Promise<string>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })

        const currentPhotos = profile?.photos || []
        const newPhotos = [...currentPhotos]
        newPhotos[index] = photoUrl

        await updateProfile({ photos: newPhotos } as any)
        return photoUrl
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
