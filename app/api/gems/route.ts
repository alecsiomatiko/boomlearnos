import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, getOrCreateDefaultUser } from "@/lib/server/mysql"
import { getGemsHistory, calculateLevel, getGemsForNextLevel } from "@/lib/gems-system"
import { getCurrentUser } from "@/lib/server/auth"
import { getOrgIdForRequest } from "@/lib/server/org-utils"

export async function GET(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || currentUser.id;
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
      // Obtener estadísticas del usuario - VERIFICA organization_id
      const userStats = await executeQuery('SELECT total_gems, level, current_streak, longest_streak, name FROM users WHERE id = ? AND organization_id = ?', [userId, organizationId]) as any[]

      if (userStats.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

      const userInfo = userStats[0]
      const gemsForNextLevel = getGemsForNextLevel(userInfo.total_gems)
      const currentLevel = calculateLevel(userInfo.total_gems)

      // Obtener gemas ganadas hoy - FILTRA POR organization_id
      const today = new Date().toISOString().split('T')[0]
      const todayGems = await executeQuery('SELECT COALESCE(SUM(gems_amount), 0) as gems_today FROM gems_history WHERE user_id = ? AND organization_id = ? AND DATE(created_at) = ?', [userId, organizationId, today]) as any[]

      // Obtener gemas ganadas esta semana - FILTRA POR organization_id
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const weekGems = await executeQuery('SELECT COALESCE(SUM(gems_amount), 0) as gems_week FROM gems_history WHERE user_id = ? AND organization_id = ? AND created_at >= ?', [userId, organizationId, weekAgo]) as any[]

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
