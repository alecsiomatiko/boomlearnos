import pool from "./mysql"

// Tipos para el sistema de gemas
export interface GemCalculation {
  baseGems: number
  categoryMultiplier: number
  difficultyMultiplier: number
  priorityMultiplier: number
  timeBonus: number
  qualityBonus: number
  totalGems: number
  breakdown: {
    category: string
    difficulty: string
    priority: string
    completedEarly: boolean
    completedOnTime: boolean
    completedLate: boolean
  }
}

export interface Task {
  id: string
  category: string
  difficulty: string
  priority: string
  due_date: string
  completed_at?: string
  estimated_hours: number
  actual_hours?: number
  completion_percentage?: number
}

// Multiplicadores según la fórmula C × D × P = G
const CATEGORY_MULTIPLIERS = {
  important_urgent: 4, // Importante y Urgente
  important_not_urgent: 3, // Importante, No Urgente
  not_important_urgent: 2, // No Importante, Urgente
  not_important_not_urgent: 1, // No Importante, No Urgente
}

const DIFFICULTY_MULTIPLIERS = {
  simple: 1, // Simple
  medium: 2, // Medio
  complicated: 3, // Complicado
  complex: 4, // Complejo
}

const PRIORITY_MULTIPLIERS = {
  low: 1, // Baja
  medium: 2, // Media
  high: 3, // Alta
  critical: 4, // Crítica
}

// Gemas base por categoría
const BASE_GEMS = {
  important_urgent: 25,
  important_not_urgent: 20,
  not_important_urgent: 15,
  not_important_not_urgent: 10,
}

// Calcular nivel basado en gemas totales
export function calculateLevel(totalGems: number): number {
  if (totalGems < 100) return 1
  if (totalGems < 300) return 2
  if (totalGems < 600) return 3
  if (totalGems < 1000) return 4
  if (totalGems < 1500) return 5
  if (totalGems < 2100) return 6
  if (totalGems < 2800) return 7
  if (totalGems < 3600) return 8
  if (totalGems < 4500) return 9
  return 10
}

// Obtener gemas necesarias para el siguiente nivel
export function getGemsForNextLevel(currentGems: number): number {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
  const currentLevel = calculateLevel(currentGems)

  if (currentLevel >= 10) return 0
  return levels[currentLevel] - currentGems
}

// Calcular bonificación por racha
export function calculateStreakBonus(streak: number): number {
  if (streak < 3) return 0
  if (streak < 7) return 5
  if (streak < 14) return 10
  if (streak < 30) return 15
  return 20
}

// Función principal para calcular gemas usando la fórmula C × D × P = G
export function calculateGems(task: Task, completedAt?: Date): GemCalculation {
  const categoryMultiplier = CATEGORY_MULTIPLIERS[task.category as keyof typeof CATEGORY_MULTIPLIERS] || 1
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[task.difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || 1
  const priorityMultiplier = PRIORITY_MULTIPLIERS[task.priority as keyof typeof PRIORITY_MULTIPLIERS] || 1

  // Gemas base según la categoría
  const baseGems = BASE_GEMS[task.category as keyof typeof BASE_GEMS] || 10

  // Aplicar la fórmula: C × D × P
  const formulaResult = categoryMultiplier * difficultyMultiplier * priorityMultiplier
  const coreGems = baseGems + formulaResult * 2 // Multiplicamos por 2 para hacer más significativo

  // Calcular bonificaciones de tiempo
  let timeBonus = 0
  let completedEarly = false
  let completedOnTime = false
  let completedLate = false

  if (completedAt && task.due_date) {
    const dueDate = new Date(task.due_date)
    const completed = completedAt
    const timeDiff = dueDate.getTime() - completed.getTime()
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

    if (daysDiff > 1) {
      // Completado más de 1 día antes
      timeBonus = Math.floor(coreGems * 0.2) // 20% bonus
      completedEarly = true
    } else if (daysDiff >= 0) {
      // Completado a tiempo
      timeBonus = Math.floor(coreGems * 0.1) // 10% bonus
      completedOnTime = true
    } else if (daysDiff > -1) {
      // Completado hasta 1 día tarde (sin penalización)
      timeBonus = 0
      completedLate = true
    } else {
      // Completado más de 1 día tarde (penalización)
      timeBonus = -Math.floor(coreGems * 0.1) // -10% penalty
      completedLate = true
    }
  }

  // Bonificación por calidad (basada en horas estimadas vs reales)
  let qualityBonus = 0
  if (task.actual_hours && task.estimated_hours) {
    const efficiency = task.estimated_hours / task.actual_hours
    if (efficiency > 1.2) {
      // Completado en menos del 80% del tiempo estimado
      qualityBonus = Math.floor(coreGems * 0.15) // 15% bonus
    } else if (efficiency > 1.0) {
      // Completado en menos tiempo del estimado
      qualityBonus = Math.floor(coreGems * 0.05) // 5% bonus
    }
  }

  const totalGems = Math.max(1, coreGems + timeBonus + qualityBonus)

  return {
    baseGems: coreGems,
    categoryMultiplier,
    difficultyMultiplier,
    priorityMultiplier,
    timeBonus,
    qualityBonus,
    totalGems,
    breakdown: {
      category: task.category,
      difficulty: task.difficulty,
      priority: task.priority,
      completedEarly,
      completedOnTime,
      completedLate,
    },
  }
}

// Otorgar gemas a un usuario
export async function awardGems(
  userId: string,
  amount: number,
  description: string,
  sourceId?: string,
  checkinId?: string,
  calculationDetails?: GemCalculation,
): Promise<number> {
  try {
    const conn = await pool.getConnection();
    try {
      const sourceType = sourceId ? "task_completion" : checkinId ? "daily_checkin" : "manual";
      const sourceRef = sourceId || checkinId || null;
      const calcDetails = calculationDetails ? JSON.stringify(calculationDetails) : null;

      // Agregar al historial de gemas
      await conn.query(
        `INSERT INTO gems_history (user_id, source_type, source_id, gems_amount, description, calculation_details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, sourceType, sourceRef, amount, description, calcDetails]
      );

      // Actualizar total de gemas del usuario
      const [updateResult] = await conn.query(
        `UPDATE users SET total_gems = total_gems + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [amount, userId]
      );

      console.log(`[awardGems] Awarded ${amount} gems to user ${userId} for: ${description}`);
      console.log(`[awardGems] Update result:`, updateResult);
      
      // Verify the update
      const [userRows] = await conn.query(
        `SELECT total_gems FROM users WHERE id = ?`,
        [userId]
      );
      const newTotal = (userRows as any[])[0]?.total_gems ?? null;
      console.log(`[awardGems] User total gems after update:`, { userId, newTotal });

      // Return the updated total so callers can update UI immediately
      return newTotal;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error awarding gems:", error);
    throw error;
  }
}

// Obtener historial de gemas
export async function getGemsHistory(userId: string, limit = 10): Promise<any[]> {
  try {
    const conn = await pool.getConnection();
    try {
      const [history] = await conn.query(
        `SELECT gh.*, t.title as task_title
         FROM gems_history gh
         LEFT JOIN tasks t ON gh.source_id = t.id AND gh.source_type = 'task_completion'
         WHERE gh.user_id = ?
         ORDER BY gh.created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
      return history as any[];
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error getting gems history:", error);
    return [];
  }
}

// Actualizar racha del usuario
export async function updateStreak(userId: string): Promise<number> {
  try {
    const conn = await pool.getConnection();
    try {
      const [userRows] = await conn.query(
        `SELECT current_streak, last_checkin FROM users WHERE id = ?`,
        [userId]
      );
      const users = userRows as any[];

      if (users.length === 0) return 0;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      let newStreak = 1;
      if (users[0].last_checkin === yesterday) {
        newStreak = users[0].current_streak + 1;
      }

      await conn.query(
        `UPDATE users 
         SET current_streak = ?, 
             longest_streak = GREATEST(longest_streak, ?),
             last_checkin = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newStreak, newStreak, today, userId]
      );

      return newStreak;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error updating streak:", error);
    return 1;
  }
}
