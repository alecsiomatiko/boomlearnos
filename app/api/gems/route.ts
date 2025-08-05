import { type NextRequest, NextResponse } from "next/server"
import { sql, getOrCreateDefaultUser } from "@/lib/neon"
import { getGemsHistory, calculateLevel, getGemsForNextLevel } from "@/lib/gems-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "550e8400-e29b-41d4-a716-446655440000"
    const action = searchParams.get("action")

    const user = await getOrCreateDefaultUser()
    const history = await getGemsHistory(userId, 20)

    const stats = {
      totalGems: user.total_gems,
      currentLevel: calculateLevel(user.total_gems),
      gemsForNextLevel: getGemsForNextLevel(user.total_gems),
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
    }

    if (action === "history") {
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const history = await getGemsHistory(userId, limit)

      return NextResponse.json({
        success: true,
        data: history,
      })
    }

    if (action === "stats") {
      if (!sql) {
        // Mock stats when no database
        return NextResponse.json({
          success: true,
          data: {
            user: {
              name: "Usuario Test",
              totalGems: 2500,
              level: 5,
              currentStreak: 5,
              longestStreak: 10,
            },
            progress: {
              gemsForNextLevel: 600,
              currentLevelProgress: 500,
            },
            recent: {
              gemsToday: 94,
              gemsThisWeek: 340,
            },
          },
        })
      }

      // Obtener estadísticas del usuario
      const userStats = await sql`
        SELECT 
          total_gems, 
          level, 
          current_streak, 
          longest_streak,
          name
        FROM users 
        WHERE id = ${userId}
      `

      if (userStats.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      const userInfo = userStats[0]
      const gemsForNextLevel = getGemsForNextLevel(userInfo.total_gems)
      const currentLevel = calculateLevel(userInfo.total_gems)

      // Obtener gemas ganadas hoy
      const today = new Date().toISOString().split("T")[0]
      const todayGems = await sql`
        SELECT COALESCE(SUM(gems_amount), 0) as gems_today
        FROM gems_history 
        WHERE user_id = ${userId} 
        AND DATE(created_at) = ${today}
      `

      // Obtener gemas ganadas esta semana
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const weekGems = await sql`
        SELECT COALESCE(SUM(gems_amount), 0) as gems_week
        FROM gems_history 
        WHERE user_id = ${userId} 
        AND created_at >= ${weekAgo}
      `

      return NextResponse.json({
        success: true,
        data: {
          user: {
            name: userInfo.name,
            totalGems: userInfo.total_gems,
            level: currentLevel,
            currentStreak: userInfo.current_streak,
            longestStreak: userInfo.longest_streak,
          },
          progress: {
            gemsForNextLevel,
            currentLevelProgress: userInfo.total_gems % 100,
          },
          recent: {
            gemsToday: todayGems[0]?.gems_today || 0,
            gemsThisWeek: weekGems[0]?.gems_week || 0,
          },
        },
      })
    }

    // Por defecto, devolver información básica
    return NextResponse.json({
      success: true,
      data: {
        user: user,
        stats: stats,
        history: history,
      },
    })
  } catch (error) {
    console.error("Error fetching gems data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch gems data" }, { status: 500 })
  }
}
