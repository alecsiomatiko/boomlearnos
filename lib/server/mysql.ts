import mysql from "mysql2/promise"
import { v4 as uuidv4 } from "uuid"

// This file should only be imported by server components or API routes
// Client components should import types from '@/types/mysql'

// Configuración de la base de datos MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'srv440.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u191251575_BoomlearnOS',
  password: process.env.DB_PASSWORD || 'Cerounocero.com20182417',
  database: process.env.DB_NAME || 'u191251575_BoomlearnOS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
}

// Pool de conexiones
export const pool = mysql.createPool(dbConfig)

// Función para ejecutar consultas
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Tipos para las entidades (actualizados para MySQL)
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

// Función para obtener o crear usuario por defecto
export async function getOrCreateDefaultUser(): Promise<User> {
  const defaultUserId = "550e8400-e29b-41d4-a716-446655440000"

  try {
    const users = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [defaultUserId]
    ) as User[]

    if (users.length > 0) {
      return users[0]
    }

    // Si no existe, crear el usuario por defecto
    await executeQuery(`
      INSERT INTO users (
        id, email, name, phone, city, business_type, role, level, total_gems, current_streak, longest_streak, energy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      defaultUserId, 'admin@kalabasboom.com', 'Administrador KalabasBoom', '+1234567890',
      'Ciudad de México', 'Tecnología', 'admin', 5, 1250, 7, 15, 85
    ])

    const newUsers = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [defaultUserId]
    ) as User[]

    return newUsers[0]
  } catch (error) {
    console.error("Error getting/creating default user:", error)

    // Retornar usuario mock cuando hay error
    return {
      id: defaultUserId,
      email: "admin@kalabasboom.com",
      name: "Administrador KalabasBoom",
      phone: "+1234567890",
      city: "Ciudad de México",
      business_type: "Tecnología",
      role: "admin",
      level: 5,
      total_gems: 1250,
      current_streak: 7,
      longest_streak: 15,
      energy: 85,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

// Función para obtener tareas mock
export async function getMockTasks(): Promise<Task[]> {
  try {
    const tasks = await executeQuery(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      ["550e8400-e29b-41d4-a716-446655440000"]
    ) as Task[]

    if (tasks.length > 0) {
      return tasks
    }
  } catch (error) {
    console.error("Error getting tasks from database:", error)
  }

  // Retornar tareas mock si no hay en la base de datos
  return [
    {
      id: "1",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Revisar reportes mensuales de ventas",
      description: "Analizar los reportes de ventas del mes anterior y preparar resumen ejecutivo",
      category: "important_urgent",
      difficulty: "medium",
      priority: "high",
      status: "pending",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 3,
      completion_percentage: 0,
      gems_earned: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Actualizar estrategia de marketing digital",
      description: "Revisar y actualizar la estrategia de marketing para el próximo trimestre",
      category: "important_not_urgent",
      difficulty: "complicated",
      priority: "medium",
      status: "pending",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 5,
      completion_percentage: 0,
      gems_earned: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Responder emails urgentes",
      description: "Revisar y responder emails marcados como urgentes",
      category: "not_important_urgent",
      difficulty: "simple",
      priority: "high",
      status: "pending",
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 1,
      completion_percentage: 0,
      gems_earned: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

// =============================
// Diagnostic system functions
// =============================

export interface DiagnosticModule {
  id: string
  module_code: string
  title: string
  description: string | null
  icon: string | null
  total_questions: number
  answered_questions: number
}

export interface DiagnosticOption {
  id: string
  option_code: string
  option_text: string
  weight: number
  emoji?: string | null
}

export interface DiagnosticQuestion {
  id: string
  question_code: string
  question_text: string
  question_type: 'single' | 'multiple'
  weight: number
  feedback_text?: string | null
  options: DiagnosticOption[]
}

export interface DiagnosticProgress {
  answered_questions: number
  total_questions: number
  completion_percentage: number
}

export interface DiagnosticResult {
  total_score: number
  answered_questions: number
  score_breakdown: { by_category: { category: string; score: number }[] }
}

// Obtener módulos con conteo de preguntas y progreso básico
export async function getDiagnosticModules(
  userId = "550e8400-e29b-41d4-a716-446655440000"
): Promise<DiagnosticModule[]> {
  const modules = (await executeQuery(
    `SELECT dm.id, dm.module_code, dm.title, dm.description, dm.icon,
            COUNT(DISTINCT dq.id) AS total_questions,
            COALESCE(ump.answered_questions, 0) AS answered_questions
     FROM diagnostic_modules dm
     LEFT JOIN diagnostic_submodules ds ON ds.module_id = dm.id
     LEFT JOIN diagnostic_questions dq ON dq.submodule_id = ds.id
     LEFT JOIN user_module_progress ump ON ump.module_id = dm.id AND ump.user_id = ?
     WHERE dm.is_active = 1
     GROUP BY dm.id, dm.module_code, dm.title, dm.description, dm.icon, ump.answered_questions
     ORDER BY dm.order_index`,
    [userId]
  )) as DiagnosticModule[]

  return modules
}

// Obtener preguntas de un módulo con sus opciones
export async function getModuleQuestions(
  moduleId: string
): Promise<DiagnosticQuestion[]> {
  const rows = (await executeQuery(
    `SELECT dq.id AS question_id, dq.question_code, dq.question_text, dq.question_type,
            dq.weight, dq.feedback_text,
            do.id AS option_id, do.option_code, do.option_text, do.weight AS option_weight, do.emoji
     FROM diagnostic_questions dq
     JOIN diagnostic_submodules ds ON ds.id = dq.submodule_id
     LEFT JOIN diagnostic_options do ON do.question_id = dq.id
     WHERE ds.module_id = ?
     ORDER BY dq.order_index, do.order_index`,
    [moduleId]
  )) as any[]

  const questionsMap: Record<string, DiagnosticQuestion> = {}

  for (const row of rows) {
    if (!questionsMap[row.question_id]) {
      questionsMap[row.question_id] = {
        id: row.question_id,
        question_code: row.question_code,
        question_text: row.question_text,
        question_type: row.question_type,
        weight: row.weight,
        feedback_text: row.feedback_text,
        options: [],
      }
    }

    if (row.option_id) {
      questionsMap[row.question_id].options.push({
        id: row.option_id,
        option_code: row.option_code,
        option_text: row.option_text,
        weight: row.option_weight,
        emoji: row.emoji,
      })
    }
  }

  return Object.values(questionsMap)
}

// Guardar respuesta del usuario
export async function saveUserAnswer(
  userId: string,
  questionId: string,
  answers: string[],
  score: number
): Promise<void> {
  // Obtener módulo relacionado a la pregunta
  const moduleResult = (await executeQuery(
    `SELECT ds.module_id FROM diagnostic_questions dq
       JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
       WHERE dq.id = ?`,
    [questionId]
  )) as { module_id: string }[]

  if (moduleResult.length === 0) throw new Error('Question not found')
  const moduleId = moduleResult[0].module_id

  // Buscar sesión activa o crear una
  const sessionRows = (await executeQuery(
    `SELECT id FROM user_diagnostic_sessions
       WHERE user_id = ? AND module_id = ? AND status = 'active'
       LIMIT 1`,
    [userId, moduleId]
  )) as { id: string }[]

  let sessionId = sessionRows[0]?.id
  if (!sessionId) {
    sessionId = uuidv4()
    await executeQuery(
      `INSERT INTO user_diagnostic_sessions (id, user_id, module_id, session_number, status)
       VALUES (?, ?, ?, 1, 'active')`,
      [sessionId, userId, moduleId]
    )
  }

  await executeQuery(
    `INSERT INTO user_diagnostic_answers (id, user_id, session_id, question_id, selected_options, calculated_score)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_options = VALUES(selected_options), calculated_score = VALUES(calculated_score), updated_at = CURRENT_TIMESTAMP`,
    [uuidv4(), userId, sessionId, questionId, JSON.stringify(answers), score]
  )
}

// Obtener progreso del usuario en un módulo
export async function getDiagnosticProgress(
  userId: string,
  moduleId: string
): Promise<DiagnosticProgress> {
  const progressRows = (await executeQuery(
    `SELECT answered_questions, total_questions, completion_percentage
       FROM user_module_progress
       WHERE user_id = ? AND module_id = ?`,
    [userId, moduleId]
  )) as DiagnosticProgress[]

  if (progressRows.length > 0) return progressRows[0]

  const totals = (await executeQuery(
    `SELECT COUNT(DISTINCT dq.id) AS total_questions
       FROM diagnostic_questions dq
       JOIN diagnostic_submodules ds ON ds.id = dq.submodule_id
       WHERE ds.module_id = ?`,
    [moduleId]
  )) as { total_questions: number }[]

  return {
    answered_questions: 0,
    total_questions: totals[0]?.total_questions || 0,
    completion_percentage: 0,
  }
}

// Calcular resultados de un módulo
export async function calculateModuleScore(
  userId: string,
  moduleId: string
): Promise<DiagnosticResult> {
  const rows = (await executeQuery(
    `SELECT ds.title AS category, uda.calculated_score
       FROM diagnostic_questions dq
       JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
       LEFT JOIN user_diagnostic_answers uda ON uda.question_id = dq.id AND uda.user_id = ?
       WHERE ds.module_id = ?`,
    [userId, moduleId]
  )) as { category: string; calculated_score: number | null }[]

  let total = 0
  let answered = 0
  const breakdown: Record<string, number> = {}

  for (const row of rows) {
    if (row.calculated_score !== null) {
      total += row.calculated_score
      answered += 1
      breakdown[row.category] = (breakdown[row.category] || 0) + row.calculated_score
    }
  }

  return {
    total_score: total,
    answered_questions: answered,
    score_breakdown: {
      by_category: Object.entries(breakdown).map(([category, score]) => ({
        category,
        score,
      })),
    },
  }
}
