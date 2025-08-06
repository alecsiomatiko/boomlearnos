import mysql from "mysql2/promise"

const DB_HOST = process.env.DB_HOST || ""
const DB_PORT = Number(process.env.DB_PORT || 3306)
const DB_USER = process.env.DB_USER || ""
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_NAME = process.env.DB_NAME || ""

export const pool = DB_HOST && DB_USER && DB_NAME
  ? mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    })
  : null

export async function sql(
  strings: TemplateStringsArray | string,
  ...values: any[]
) {
  if (!pool) return []

  if (Array.isArray(strings)) {
    const query = strings.reduce(
      (acc, str, i) => acc + str + (i < values.length ? "?" : ""),
      "",
    )
    const [rows] = await pool.execute(query, values)
    return rows as any[]
  }

  const query = strings as string
  const params = values[0] || []
  const q = query.replace(/\$\d+/g, "?")
  const [rows] = await pool.execute(q, params)
  return rows as any[]
}

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
  calculation_details?: any
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

export async function getOrCreateDefaultUser(): Promise<User> {
  const defaultUserId = "550e8400-e29b-41d4-a716-446655440000"

  if (!pool) {
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

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${defaultUserId}`
    if (users.length > 0) {
      return users[0] as User
    }

    await sql`INSERT INTO users (
        id, email, name, phone, city, business_type, role, level, total_gems, current_streak, longest_streak, energy
      ) VALUES (
        ${defaultUserId}, 'admin@kalabasboom.com', 'Administrador KalabasBoom', '+1234567890',
        'Ciudad de México', 'Tecnología', 'admin', 5, 1250, 7, 15, 85
      )`

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
  } catch (error) {
    console.error("Error getting/creating default user:", error)
    throw error
  }
}

export async function getMockTasks(): Promise<Task[]> {
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

