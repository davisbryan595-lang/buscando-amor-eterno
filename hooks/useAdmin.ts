import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

interface AdminUser {
  id: string
  is_admin: boolean
  full_name: string
}

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdminStatus = useCallback(async () => {
    if (!user) {
      setLoading(false)
      setIsAdmin(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, is_admin, email, display_name')
        .eq('user_id', user.id)
        .single()

      if (err) {
        if (err.code === 'PGRST116') {
          // No profile found
          setIsAdmin(false)
          setAdminUser(null)
        } else {
          throw err
        }
      } else if (data) {
        setAdminUser(data as AdminUser)
        setIsAdmin(data.is_admin || false)
      }
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch admin status'
      setError(errorMessage)
      setIsAdmin(false)
      setAdminUser(null)
      console.error('Error fetching admin status:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return

    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const fetchData = async () => {
      try {
        setLoading(true)

        if (!user) {
          if (isMounted) {
            setIsAdmin(false)
            setAdminUser(null)
            setLoading(false)
          }
          return
        }

        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, is_admin, email, display_name')
          .eq('user_id', user.id)
          .single()

        if (!isMounted) return

        if (err) {
          if (err.code !== 'PGRST116') {
            throw err
          }
          setIsAdmin(false)
          setAdminUser(null)
        } else if (data) {
          setAdminUser(data as AdminUser)
          setIsAdmin(data.is_admin || false)
        }
        setError(null)
      } catch (err: any) {
        if (isMounted) {
          const errorMessage = err?.message || 'Failed to fetch admin status'
          setError(errorMessage)
          setIsAdmin(false)
          setAdminUser(null)
          console.error('Error fetching admin status:', errorMessage)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Set a 5-second timeout to prevent indefinite loading
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Admin status fetch timeout')
        setLoading(false)
        setIsAdmin(false)
      }
    }, 5000)

    fetchData().then(() => {
      if (isMounted) {
        clearTimeout(timeoutId)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [user, authLoading])

  return {
    adminUser,
    isAdmin,
    loading,
    error,
    refetchAdminStatus: fetchAdminStatus,
  }
}
