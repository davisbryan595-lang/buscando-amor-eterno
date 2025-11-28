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
  const { profile, loading: profileLoading } = useProfile()

  useEffect(() => {
    if (authLoading || profileLoading) {
      return
    }

    // If not authenticated, user will be redirected elsewhere
    if (!user) {
      return
    }

    // If profile protection is required and profile is not complete
    if (requireProfile && !profile?.profile_complete) {
      router.push(redirectTo)
    }

    // If user has complete profile but is on onboarding, redirect to browse
    if (!requireProfile && profile?.profile_complete) {
      router.push('/browse')
    }
  }, [user, profile, authLoading, profileLoading, router, requireProfile, redirectTo])

  return {
    isLoading: authLoading || profileLoading,
    user,
    profile,
  }
}
