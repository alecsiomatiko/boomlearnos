import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Tipos para Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          city?: string
          business_type?: string
          avatar_url?: string
          role: string
          level: number
          total_gems: number
          current_streak: number
          longest_streak: number
          energy: number
          last_checkin?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          city?: string
          business_type?: string
          avatar_url?: string
          role?: string
          level?: number
          total_gems?: number
          current_streak?: number
          longest_streak?: number
          energy?: number
          last_checkin?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          city?: string
          business_type?: string
          avatar_url?: string
          role?: string
          level?: number
          total_gems?: number
          current_streak?: number
          longest_streak?: number
          energy?: number
          last_checkin?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
