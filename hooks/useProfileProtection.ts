import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useProfile } from '@/hooks/useProfile'

/**
 * Hook to protect routes that require a complete profile
 * Redirects users to /onboarding if their profile is not complete
 * Redirects users from /onboarding to /browse if their profile is complete
 */
export function useProfileProtection(
  requireProfile: boolean = true,
  redirectTo: string = '/onboarding'
) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, error: profileError } = useProfile()

  useEffect(() => {
    // Still loading auth or profile data
    if (authLoading || profileLoading) {
      return
    }

    // If not authenticated, user will be redirected elsewhere
    if (!user) {
      return
    }

    // Wait for profile data to be available before checking completion status
    // If profile is null and not loading, it means no profile exists yet
    if (profile === undefined) {
      return
    }

    // If profile protection is required and profile is not complete, redirect
    if (requireProfile && profile && !profile.profile_complete) {
      router.push(redirectTo)
    }

    // If profile protection is NOT required and profile IS complete, redirect to browse
    if (!requireProfile && profile && profile.profile_complete) {
      router.push('/browse')
    }
  }, [user, profile, authLoading, profileLoading, router, requireProfile, redirectTo])

  return {
    isLoading: authLoading || profileLoading,
    user,
    profile,
  }
}
