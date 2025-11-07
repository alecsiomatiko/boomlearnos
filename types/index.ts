/**
 * Definiciones de tipos TypeScript para BoomLearnOS
 * 
 * Este archivo contiene todas las interfaces y tipos principales
 * usados en la aplicacion para garantizar type-safety.
 */

/**
 * Tarea del sistema de gestion
 * 
 * @property id - UUID unico de la tarea
 * @property title - Titulo descriptivo
 * @property description - Descripcion detallada de la tarea
 * @property category - Categoria (marketing, ventas, operaciones, etc.)
 * @property priority - Prioridad: 'low' | 'medium' | 'high'
 * @property difficulty - Dificultad: 'easy' | 'medium' | 'hard' | 'expert'
 * @property progress - Progreso de completitud 0-100
 * @property dueDate - Fecha limite en formato ISO
 * @property createdAt - Fecha de creacion en formato ISO
 * @property assignedTo - ID del usuario asignado (opcional)
 * @property gems - Gemas que otorga al completarse
 * @property completed - Boolean si esta completada
 * @property completionPercentage - Porcentaje de avance 0-100
 * @property comments - Array de comentarios de la tarea
 */
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

/**
 * Comentario de una tarea
 * 
 * @property id - UUID del comentario (opcional en creacion)
 * @property author - Nombre del autor del comentario
 * @property text - Contenido del comentario
 * @property date - Fecha del comentario en formato ISO
 */
export interface Comment {
  id?: string
  author: string
  text: string
  date: string
}

/**
 * Usuario del sistema
 * 
 * @property id - UUID unico del usuario
 * @property name - Nombre completo o display name
 * @property email - Email del usuario (unico)
 * @property gems - Total de gemas acumuladas
 * @property level - Nivel actual del usuario (1-100)
 * @property avatar - URL de la imagen de avatar (opcional)
 */
export interface User {
  id: string
  name: string
  email: string
  gems: number
  level: number
  avatar?: string
}

/**
 * Insignia/Badge del sistema de gamificacion
 * 
 * @property id - ID unico de la badge
 * @property name - Nombre de la insignia
 * @property description - Descripcion de como desbloquearla
 * @property icon - Nombre del icono (de lucide-react)
 * @property rarity - Rareza que define valor y dificultad
 * @property unlocked - Si el usuario ya la desbloqueo
 * @property unlockedAt - Fecha de desbloqueo (opcional)
 */
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlocked: boolean
  unlockedAt?: string
}

/**
 * Logro/Achievement del sistema
 * 
 * @property id - ID unico del logro
 * @property title - Titulo del achievement
 * @property description - Descripcion del objetivo
 * @property progress - Progreso actual hacia el logro
 * @property maxProgress - Progreso maximo requerido
 * @property completed - Si ya se completo
 * @property gems - Gemas que otorga al completarse
 * @property badge - Badge asociada que se desbloquea (opcional)
 */
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
