import { useCallback, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useProfile } from './useProfile'
import type { ProfileData } from './useProfile'

export interface MutualPreference {
  key: string
  label: string
  currentUserValue: any
  viewedUserValue: any
  match: boolean
}

export interface PreferenceMatch {
  type: 'mutual' | 'complementary'
  label: string
  icon?: string
}

export function useUserProfile(userId: string | null) {
  const { profile: currentProfile } = useProfile()
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mutualPreferences, setMutualPreferences] = useState<MutualPreference[]>([])

  // Calculate if two preferences match
  const isPreferenceMatch = (preference: string, userValue: any, viewedUserValue: any): boolean => {
    if (!userValue || !viewedUserValue) return false

    switch (preference) {
      case 'gender':
        return userValue === viewedUserValue
      case 'looking_for':
        return userValue === viewedUserValue
      case 'age_range':
        // Check if current user's age falls within viewed user's age range
        if (currentProfile?.birthday && viewedUserValue?.min && viewedUserValue?.max) {
          const currentAge = new Date().getFullYear() - new Date(currentProfile.birthday).getFullYear()
          return currentAge >= viewedUserValue.min && currentAge <= viewedUserValue.max
        }
        return false
      case 'religion':
        return userValue === viewedUserValue
      case 'wants_kids':
        return userValue === viewedUserValue
      case 'smoking':
        return userValue === viewedUserValue
      case 'drinking':
        return userValue === viewedUserValue
      case 'relationship_type':
        return userValue === viewedUserValue
      case 'love_language':
        return userValue === viewedUserValue
      default:
        return false
    }
  }

  // Calculate mutual preferences between current user and viewed user
  const calculateMutualPreferences = useCallback(
    (current: ProfileData, viewed: ProfileData): MutualPreference[] => {
      if (!current || !viewed) return []

      const preferences: MutualPreference[] = []

      // Check gender compatibility
      if (current.gender && viewed.looking_for) {
        const matches = viewed.looking_for.toLowerCase().includes(current.gender.toLowerCase()) ||
                       viewed.looking_for === 'everyone'
        if (matches) {
          preferences.push({
            key: 'gender',
            label: current.gender,
            currentUserValue: current.gender,
            viewedUserValue: viewed.looking_for,
            match: true,
          })
        }
      }

      // Check relationship type
      if (current.relationship_type && viewed.relationship_type) {
        if (isPreferenceMatch('relationship_type', current.relationship_type, viewed.relationship_type)) {
          preferences.push({
            key: 'relationship_type',
            label: `Looking for: ${current.relationship_type}`,
            currentUserValue: current.relationship_type,
            viewedUserValue: viewed.relationship_type,
            match: true,
          })
        }
      }

      // Check smoking preference
      if (current.smoking && viewed.smoking) {
        if (isPreferenceMatch('smoking', current.smoking, viewed.smoking)) {
          preferences.push({
            key: 'smoking',
            label: `Smoking: ${current.smoking}`,
            currentUserValue: current.smoking,
            viewedUserValue: viewed.smoking,
            match: true,
          })
        }
      }

      // Check drinking preference
      if (current.drinking && viewed.drinking) {
        if (isPreferenceMatch('drinking', current.drinking, viewed.drinking)) {
          preferences.push({
            key: 'drinking',
            label: `Drinking: ${current.drinking}`,
            currentUserValue: current.drinking,
            viewedUserValue: viewed.drinking,
            match: true,
          })
        }
      }

      // Check religion
      if (current.religion && viewed.religion) {
        if (isPreferenceMatch('religion', current.religion, viewed.religion)) {
          preferences.push({
            key: 'religion',
            label: `Religion: ${current.religion}`,
            currentUserValue: current.religion,
            viewedUserValue: viewed.religion,
            match: true,
          })
        }
      }

      // Check kids preference
      if (current.wants_kids && viewed.wants_kids) {
        if (isPreferenceMatch('wants_kids', current.wants_kids, viewed.wants_kids)) {
          preferences.push({
            key: 'wants_kids',
            label: `Kids: ${current.wants_kids}`,
            currentUserValue: current.wants_kids,
            viewedUserValue: viewed.wants_kids,
            match: true,
          })
        }
      }

      // Check love language
      if (current.love_language && viewed.love_language) {
        if (isPreferenceMatch('love_language', current.love_language, viewed.love_language)) {
          preferences.push({
            key: 'love_language',
            label: `Love language: ${current.love_language}`,
            currentUserValue: current.love_language,
            viewedUserValue: viewed.love_language,
            match: true,
          })
        }
      }

      // Check if viewed user's age preference includes current user's age
      if (viewed.age_range_min && viewed.age_range_max && currentProfile?.birthday) {
        const currentAge = new Date().getFullYear() - new Date(currentProfile.birthday).getFullYear()
        if (currentAge >= viewed.age_range_min && currentAge <= viewed.age_range_max) {
          preferences.push({
            key: 'age_preference',
            label: `Age preference match (${currentAge})`,
            currentUserValue: currentAge,
            viewedUserValue: { min: viewed.age_range_min, max: viewed.age_range_max },
            match: true,
          })
        }
      }

      return preferences
    },
    [currentProfile]
  )

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (err) {
        throw err
      }

      if (data) {
        const profile = data as ProfileData
        setUserProfile(profile)

        // Calculate mutual preferences
        if (currentProfile) {
          const mutual = calculateMutualPreferences(currentProfile, profile)
          setMutualPreferences(mutual)
        }
      } else {
        setUserProfile(null)
        setMutualPreferences([])
      }
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch profile'
      setError(errorMessage)
      console.error('Error fetching user profile:', errorMessage, err)
    } finally {
      setLoading(false)
    }
  }, [userId, currentProfile, calculateMutualPreferences])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  return {
    userProfile,
    loading,
    error,
    mutualPreferences,
    fetchUserProfile,
  }
}
