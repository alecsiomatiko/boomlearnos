import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getOrCreateDefaultUser, pool } from "@/lib/server/mysql"
import { updateStreak, calculateStreakBonus, awardGems } from "@/lib/gems-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "550e8400-e29b-41d4-a716-446655440000"

    const today = new Date().toISOString().split("T")[0]

    const todayCheckin = await executeQuery('SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?', [userId, today]) as any[]
    const user = await getOrCreateDefaultUser()

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedInToday: (todayCheckin || []).length > 0,
        currentStreak: user.current_streak,
        todayCheckin: todayCheckin[0] || null,
      },
    })
  } catch (error) {
    console.error("Error fetching checkin data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch checkin data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = "550e8400-e29b-41d4-a716-446655440000", energyLevel, priorityText } = body

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya hizo check-in hoy
    const existingCheckin = await executeQuery('SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?', [userId, today]) as any[]

    if ((existingCheckin || []).length > 0) {
      return NextResponse.json({ success: false, error: 'Already checked in today' }, { status: 400 })
    }

    // Actualizar racha
    const newStreak = await updateStreak(userId)
    const streakBonus = calculateStreakBonus(newStreak)

    // Calcular gemas base + bonificación por racha
    const baseGems = 25
    const totalGems = baseGems + streakBonus

    // Calcular energía ganada basada en el nivel de energía reportado
    const energyGained = Math.max(10, Math.min(30, 100 - energyLevel))

    // Crear el check-in
    const conn = await pool.getConnection()
    let checkinId: number | null = null
    try {
      const [res] = await conn.query(
        `INSERT INTO daily_checkins (user_id, checkin_date, energy_level, priority_text, energy_gained, streak_bonus, gems_earned, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, today, energyLevel, priorityText || '', energyGained, streakBonus, totalGems]
      ) as any
      checkinId = res.insertId
    } finally {
      conn.release()
    }

  // Otorgar gemas (pass checkin id as string if present)
  await awardGems(userId, totalGems, `Check-in diario completado (Racha: ${newStreak} días)`, undefined, checkinId ? String(checkinId) : undefined)

    // Actualizar energía del usuario
    await executeQuery('UPDATE users SET energy = LEAST(100, energy + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [energyGained, userId])

    const checkinRow = await executeQuery('SELECT * FROM daily_checkins WHERE id = ?', [checkinId]) as any[]
    return NextResponse.json({
      success: true,
      data: {
        gemsEarned: totalGems,
        streakBonus: streakBonus,
        newStreak: newStreak,
        energyGained: energyGained,
        checkin: checkinRow[0] || null,
      },
    })
  } catch (error) {
    console.error("Error creating checkin:", error)
    return NextResponse.json({ success: false, error: "Failed to create checkin" }, { status: 500 })
  }
}
