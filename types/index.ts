export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: string
  difficulty?: string
  progress: number
  dueDate: string
  createdAt: string
  assignedTo?: string
  gems: number
  completed: boolean
  completionPercentage?: number
  comments?: Comment[]
}

export interface Comment {
  id?: string
  author: string
  text: string
  date: string
}

export interface User {
  id: string
  name: string
  email: string
  gems: number
  level: number
  avatar?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlocked: boolean
  unlockedAt?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  maxProgress: number
  completed: boolean
  gems: number
  badge?: Badge
}
