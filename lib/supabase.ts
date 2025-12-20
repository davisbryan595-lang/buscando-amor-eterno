import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (typeof window !== 'undefined') {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('[Supabase] Client initialized with key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
      heartbeatIntervalMs: 30000,
    },
    heartbeatInterval: 30000,
    reconnectDelay: 1000,
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Configure realtime with extended timeouts and heartbeat
if (typeof window !== 'undefined') {
  // Auto-reconnect on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[Supabase] Page hidden - subscriptions may pause')
    } else {
      console.log('[Supabase] Page visible - resuming subscriptions')
      // Reconnect if needed
      const channels = supabase.getChannels()
      channels.forEach(channel => {
        if (channel.state === 'CLOSED') {
          console.log('[Supabase] Reconnecting channel:', channel.topic)
          channel.subscribe()
        }
      })
    }
  })

  // Setup periodic health check for subscriptions
  setInterval(() => {
    const channels = supabase.getChannels()
    const closedChannels = channels.filter(ch => ch.state === 'CLOSED')
    if (closedChannels.length > 0) {
      console.log(`[Supabase] Found ${closedChannels.length} closed channels, attempting to reconnect`)
      closedChannels.forEach(channel => {
        channel.subscribe()
      })
    }
  }, 15000)
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          username: string
          display_name: string
          bio: string
          age: number
          location: string
          gender: string
          interested_in: string
          photos: string[]
          verified: boolean
          updated_at: string
        }
        Insert: Omit<any, 'id' | 'created_at'>
        Update: Partial<any>
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          recipient_id: string
          content: string
          read: boolean
          type: 'text' | 'call_log'
          call_type?: 'audio' | 'video'
          call_status?: 'ongoing' | 'incoming' | 'missed' | 'ended'
          call_duration?: number
        }
        Insert: Omit<any, 'id' | 'created_at'>
        Update: Partial<any>
      }
      matches: {
        Row: {
          id: string
          created_at: string
          user_id: string
          matched_user_id: string
          status: 'liked' | 'matched' | 'blocked'
          updated_at: string
        }
        Insert: Omit<any, 'id' | 'created_at'>
        Update: Partial<any>
      }
    }
  }
}
