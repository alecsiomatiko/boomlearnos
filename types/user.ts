export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  city?: string
  business_type?: string
  role: 'user' | 'admin'
  level: string
  total_gems: number
  current_streak: number
  longest_streak: number
  energy: number
  last_checkin?: string
  badges?: Badge[]
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role: 'user' | 'admin'
  level: string
  total_gems: number
  badges: Badge[]
  onboardingStep?: number
  onboardingCompleted?: boolean
  canAccessDashboard?: boolean
  first_login?: boolean
  phone?: string
  permissions?: any
  organization?: {
    id: string
    name: string
  }
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword?: string
  phone?: string
  city?: string
  businessType?: string
  position?: string
  organizationName?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalGems: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
}

export interface GemTransaction {
  id: string
  user_id: string
  source_type: string
  source_id?: string
  gems_amount: number
  description: string
  calculation_details?: any
  created_at: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  checkin_date: string
  energy_level: number
  priority_text: string
  energy_gained: number
  streak_bonus: number
  total_gems: number
  gems_earned: number
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  gems: number // Cambiado de "points" a "gems"
  dueDate?: Date
}
