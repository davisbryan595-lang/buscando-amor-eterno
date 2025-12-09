import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
