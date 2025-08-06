// Client-safe type definitions (no server-side imports)
export interface User {
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

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  difficulty: string
  priority: string
  status: string
  due_date: string
  estimated_hours: number
  actual_hours?: number
  completion_percentage: number
  gems_earned: number
  assigned_to?: string
  created_by?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface GemHistory {
  id: string
  user_id: string
  source_type: string
  source_id?: string
  gems_amount: number
  description: string
  calculation_details?: string
  created_at: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  checkin_date: string
  energy_level: number
  priority_text?: string
  energy_gained: number
  streak_bonus: number
  gems_earned: number
  created_at: string
}