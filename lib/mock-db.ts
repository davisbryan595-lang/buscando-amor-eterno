// Mock Database - simulates Supabase for development/testing

export interface User {
  id: string
  email: string
  password: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  bio: string
  age: number
  location: string
  interests: string[]
  photos: string[]
  preferences: any
  created_at: string
}

export interface Session {
  user: User
  access_token: string
}

// Initialize with test data
const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    email: 'davisbryan595@gmail.com',
    password: '1234566',
    created_at: new Date().toISOString(),
  },
]

const MOCK_PROFILES: Profile[] = [
  {
    id: 'profile-001',
    user_id: 'user-001',
    full_name: 'Davis Bryan',
    bio: 'Looking for meaningful connections',
    age: 28,
    location: 'Los Angeles, USA',
    interests: ['Travel', 'Music', 'Coffee'],
    photos: [],
    preferences: {
      ageRange: [20, 40],
      location: 'Los Angeles, USA',
      gender: 'female',
    },
    created_at: new Date().toISOString(),
  },
]

// Session storage (in-memory and localStorage)
let currentSession: Session | null = null

// Helper to load session from localStorage
function loadSessionFromStorage(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('mock_session')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load session from storage:', error)
  }
  return null
}

// Helper to save session to localStorage
function saveSessionToStorage(session: Session | null) {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem('mock_session', JSON.stringify(session))
    } else {
      localStorage.removeItem('mock_session')
    }
  } catch (error) {
    console.error('Failed to save session to storage:', error)
  }
}

// Initialize session from storage on import
if (typeof window !== 'undefined') {
  currentSession = loadSessionFromStorage()
}

export const mockDB = {
  // Auth Methods
  signUp: async (email: string, password: string): Promise<{ user: User; session: Session } | { error: any }> => {
    // Check if user already exists
    const existing = MOCK_USERS.find((u) => u.email === email)
    if (existing) {
      return { error: new Error('User already exists') }
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      created_at: new Date().toISOString(),
    }

    MOCK_USERS.push(newUser)

    // Create default profile
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      user_id: newUser.id,
      full_name: '',
      bio: '',
      age: 18,
      location: '',
      interests: [],
      photos: [],
      preferences: {
        ageRange: [18, 50],
        location: '',
        gender: 'female',
      },
      created_at: new Date().toISOString(),
    }

    MOCK_PROFILES.push(newProfile)

    // Create session
    const session: Session = {
      user: newUser,
      access_token: `token-${Date.now()}`,
    }

    currentSession = session
    saveSessionToStorage(session)

    return { user: newUser, session }
  },

  signIn: async (email: string, password: string): Promise<{ user: User; session: Session } | { error: any }> => {
    const user = MOCK_USERS.find((u) => u.email === email)

    if (!user || user.password !== password) {
      return { error: new Error('Invalid email or password') }
    }

    // Create session
    const session: Session = {
      user,
      access_token: `token-${Date.now()}`,
    }

    currentSession = session
    saveSessionToStorage(session)

    return { user, session }
  },

  signOut: async (): Promise<void> => {
    currentSession = null
    saveSessionToStorage(null)
  },

  getSession: async (): Promise<{ session: Session | null; user: User | null }> => {
    return {
      session: currentSession,
      user: currentSession?.user ?? null,
    }
  },

  getUser: async (): Promise<User | null> => {
    return currentSession?.user ?? null
  },

  // Profile Methods
  getProfile: async (userId: string): Promise<Profile | null> => {
    return MOCK_PROFILES.find((p) => p.user_id === userId) ?? null
  },

  updateProfile: async (userId: string, updates: Partial<Profile>): Promise<Profile | { error: any }> => {
    const profile = MOCK_PROFILES.find((p) => p.user_id === userId)

    if (!profile) {
      return { error: new Error('Profile not found') }
    }

    const updated = { ...profile, ...updates }
    const index = MOCK_PROFILES.indexOf(profile)
    MOCK_PROFILES[index] = updated

    return updated
  },

  updateUser: async (updates: Partial<User>): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session')
    }

    const user = MOCK_USERS.find((u) => u.id === currentSession!.user.id)
    if (user) {
      Object.assign(user, updates)
      currentSession.user = user
      saveSessionToStorage(currentSession)
    }
  },

  // Helper to add a new user
  addUser: (email: string, password: string): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      created_at: new Date().toISOString(),
    }
    MOCK_USERS.push(newUser)
    return newUser
  },
}
