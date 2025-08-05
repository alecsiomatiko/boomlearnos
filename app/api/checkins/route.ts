import { type NextRequest, NextResponse } from "next/server"
import { sql, getOrCreateDefaultUser } from "@/lib/neon"
import { updateStreak, calculateStreakBonus, awardGems } from "@/lib/gems-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "550e8400-e29b-41d4-a716-446655440000"

    if (!sql) {
      return NextResponse.json({
        success: true,
        data: {
          hasCheckedInToday: false,
          currentStreak: 6,
          todayCheckin: null,
        },
      })
    }

    const today = new Date().toISOString().split("T")[0]

    const todayCheckin = await sql`
      SELECT * FROM daily_checkins 
      WHERE user_id = ${userId} AND checkin_date = ${today}
    `

    const user = await getOrCreateDefaultUser()

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedInToday: todayCheckin.length > 0,
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

    if (!sql) {
      return NextResponse.json({
        success: true,
        data: {
          gemsEarned: 25,
          streakBonus: 10,
          newStreak: 7,
          energyGained: 20,
        },
      })
    }

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya hizo check-in hoy
    const existingCheckin = await sql`
      SELECT * FROM daily_checkins 
      WHERE user_id = ${userId} AND checkin_date = ${today}
    `

    if (existingCheckin.length > 0) {
      return NextResponse.json({ success: false, error: "Already checked in today" }, { status: 400 })
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
    const checkin = await sql`
      INSERT INTO daily_checkins (
        user_id, checkin_date, energy_level, priority_text, 
        energy_gained, streak_bonus, gems_earned
      ) VALUES (
        ${userId}, ${today}, ${energyLevel}, ${priorityText || ""}, 
        ${energyGained}, ${streakBonus}, ${totalGems}
      ) RETURNING *
    `

    // Otorgar gemas
    await awardGems(
      userId,
      totalGems,
      `Check-in diario completado (Racha: ${newStreak} días)`,
      undefined,
      checkin[0].id,
    )

    // Actualizar energía del usuario
    await sql`
      UPDATE users 
      SET energy = LEAST(100, energy + ${energyGained}), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      data: {
        gemsEarned: totalGems,
        streakBonus: streakBonus,
        newStreak: newStreak,
        energyGained: energyGained,
        checkin: checkin[0],
      },
    })
  } catch (error) {
    console.error("Error creating checkin:", error)
    return NextResponse.json({ success: false, error: "Failed to create checkin" }, { status: 500 })
  }
}
