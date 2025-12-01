// Mock Supabase client for development/testing
import { mockDB, type User } from './mock-db'

// Mock Supabase Auth API
const mockAuth = {
  signUp: async (options: { email: string; password: string }) => {
    const result = await mockDB.signUp(options.email, options.password)
    if ('error' in result) {
      return { data: null, error: result.error }
    }
    return { data: { user: result.user, session: result.session }, error: null }
  },

  signInWithPassword: async (options: { email: string; password: string }) => {
    const result = await mockDB.signIn(options.email, options.password)
    if ('error' in result) {
      return { data: null, error: result.error }
    }
    return { data: { user: result.user, session: result.session }, error: null }
  },

  signOut: async () => {
    await mockDB.signOut()
    return { error: null }
  },

  getSession: async () => {
    const { session } = await mockDB.getSession()
    return { data: { session }, error: null }
  },

  getUser: async () => {
    const user = await mockDB.getUser()
    return { data: { user }, error: null }
  },

  updateUser: async (updates: any) => {
    try {
      await mockDB.updateUser(updates.data || {})
      const user = await mockDB.getUser()
      return { data: { user }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Simulate auth state change listener
    // In a real app, this would be event-driven
    const interval = setInterval(async () => {
      const { session } = await mockDB.getSession()
      callback('INITIAL_SESSION', session)
    }, 100)

    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    }
  },

  signInWithOAuth: async (options: { provider: string; options: any }) => {
    // Mock OAuth - not implemented for this version
    return { data: null, error: new Error('OAuth not implemented in mock mode') }
  },
}

// Mock Supabase client
export const supabase = {
  auth: mockAuth,

  // Add other Supabase methods as needed
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        data: [],
      }),
      data: [],
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
}
