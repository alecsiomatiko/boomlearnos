import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrgIdForRequest } from '@/lib/server/org-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🏆 [ACHIEVEMENTS] Iniciando GET...')
    
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    console.log('🏆 [ACHIEVEMENTS] Usuario autenticado:', user?.id)
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    console.log('🏆 [ACHIEVEMENTS] OrganizationId:', organizationId)
    
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id;
    console.log('🏆 [ACHIEVEMENTS] Consultando logros para userId:', userId)

    // Obtener logros del usuario con progreso - FILTRA POR organization_id
    const userAchievements = await executeQuery(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.category,
        a.points,
        a.rarity,
        a.max_progress,
        a.icon,
        0 as progress,
        ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_badges ua ON ua.badge_id = a.id AND ua.user_id = ?
      WHERE a.active = TRUE AND a.organization_id = ?
      ORDER BY ua.unlocked_at DESC, a.points ASC
    `, [userId, organizationId]) as any[]
    
    console.log('🏆 [ACHIEVEMENTS] Logros encontrados:', userAchievements.length)

    // Calcular estadísticas generales - FILTRA POR organization_id
    const [stats] = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN ua.unlocked_at IS NOT NULL THEN 1 END) as completed_achievements,
        COUNT(a.id) as total_achievements,
        COALESCE(SUM(CASE WHEN ua.unlocked_at IS NOT NULL THEN a.points ELSE 0 END), 0) as total_points
      FROM achievements a
      LEFT JOIN user_badges ua ON ua.badge_id = a.id AND ua.user_id = ?
      WHERE a.active = TRUE AND a.organization_id = ?
    `, [userId, organizationId]) as any[]

    // Logros recientes (últimos 7 días) - FILTRA POR organization_id
    const recentAchievements = await executeQuery(`
      SELECT 
        a.name,
        a.description,
        a.points,
        a.rarity,
        ua.unlocked_at
      FROM user_badges ua
      JOIN achievements a ON a.id = ua.badge_id
      WHERE ua.user_id = ? 
        AND a.organization_id = ?
        AND ua.unlocked_at IS NOT NULL
        AND ua.unlocked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY ua.unlocked_at DESC
      LIMIT 5
    `, [userId, organizationId]) as any[]

    const response = {
      success: true,
      data: {
        achievements: userAchievements.map((achievement: any) => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          points: achievement.points,
          rarity: achievement.rarity,
          icon: achievement.icon,
          progress: achievement.progress,
          maxProgress: achievement.max_progress,
          completed: achievement.unlocked_at !== null,
          unlockedAt: achievement.unlocked_at
        })),
        stats: {
          completedAchievements: stats.completed_achievements,
          totalAchievements: stats.total_achievements,
          totalPoints: stats.total_points,
          completionPercentage: stats.total_achievements > 0 ? Math.round((stats.completed_achievements / stats.total_achievements) * 100) : 0
        },
        recent: recentAchievements.map((achievement: any) => ({
          name: achievement.name,
          description: achievement.description,
          points: achievement.points,
          rarity: achievement.rarity,
          unlockedAt: achievement.unlocked_at
        }))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [ACHIEVEMENTS] Error completo:', error)
    console.error('❌ [ACHIEVEMENTS] Stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' }, 
      { status: 500 }
    )
  }
}

// POST /api/achievements/check - Verificar y actualizar progreso de logros
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Llamar al procedimiento almacenado para actualizar logros
    await executeQuery('CALL UpdateUserAchievements(?)', [userId])

    // Obtener logros recién desbloqueados
    const newAchievements = await executeQuery(`
      SELECT 
        a.name,
        a.description,
        a.points,
        a.rarity,
        a.icon,
        ua.unlocked_at
      FROM user_badges ua
      JOIN achievements a ON a.id = ua.badge_id
      WHERE ua.user_id = ? 
        AND ua.unlocked_at IS NOT NULL
        AND ua.unlocked_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      ORDER BY ua.unlocked_at DESC
    `, [userId]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        newAchievements: newAchievements.map((achievement: any) => ({
          name: achievement.name,
          description: achievement.description,
          points: achievement.points,
          rarity: achievement.rarity,
          icon: achievement.icon,
          unlockedAt: achievement.unlocked_at
        }))
      }
    })

  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check achievements' }, 
      { status: 500 }
    )
  }
}