import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { NextRequest as Req } from 'next/server'
// Para insights IA
async function fetchAIInsights(userId: string, period: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/metrics/ai-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, period })
    });
    const data = await res.json();
    return data.success ? data.insights : null;
  } catch {
    return null;
  }
}

// GET /api/metrics - Obtener métricas del dashboard
export async function GET(request: Req) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month'

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Calcular fechas según el período
    const now = new Date()
    let daysBack = 30
    
    switch (period) {
      case 'week':
        daysBack = 7
        break
      case 'month':
        daysBack = 30
        break
      case 'quarter':
        daysBack = 90
        break
      case 'year':
        daysBack = 365
        break
    }

    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Helper para calcular cambio porcentual
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // 1. KPIs principales del usuario
    const userMetrics = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(t.id) as total_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gems_earned ELSE 0 END), 0) as gems_earned,
        COUNT(DISTINCT DATE(t.created_at)) as active_days
      FROM tasks t
      WHERE (t.user_id = ? OR t.assigned_to = ? OR t.created_by = ?)
        AND t.created_at >= ?
    `, [userId, userId, userId, startDate.toISOString()]) as any[]

    const currentUserMetrics = userMetrics[0] || {
      completed_tasks: 0,
      total_tasks: 0,
      gems_earned: 0,
      active_days: 0
    }

    // 2. Métricas del período anterior para comparación
    const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    const previousUserMetrics = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gems_earned ELSE 0 END), 0) as gems_earned
      FROM tasks t
      WHERE (t.user_id = ? OR t.assigned_to = ? OR t.created_by = ?)
        AND t.created_at >= ? AND t.created_at < ?
    `, [userId, userId, userId, previousStartDate.toISOString(), startDate.toISOString()]) as any[]

    const prevMetrics = previousUserMetrics[0] || { completed_tasks: 0, gems_earned: 0 }

    // 3. Datos del usuario
    const userData = await executeQuery(`
      SELECT name, total_gems, level, current_streak
      FROM users 
      WHERE id = ?
    `, [userId]) as any[]

    const user = userData[0] || { name: 'Usuario', total_gems: 0, level: 1 }


    // 4. Tendencias diarias
    const dailyTrends = await executeQuery(`
      SELECT 
        DATE(t.created_at) as date,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
        COUNT(t.id) as created,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gems_earned ELSE 0 END), 0) as gems
      FROM tasks t
      WHERE (t.user_id = ? OR t.assigned_to = ? OR t.created_by = ?)
        AND t.created_at >= ?
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at) ASC
    `, [userId, userId, userId, startDate.toISOString()]) as any[]

    // 5. Métricas por departamento
    const departmentMetrics = await executeQuery(`
      SELECT 
        d.name as department_name,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.assigned_to IS NOT NULL THEN t.assigned_to ELSE t.user_id END) as active_users,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gems_earned ELSE 0 END), 0) as gems_earned
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id
      LEFT JOIN tasks t ON (t.assigned_to = u.id OR t.user_id = u.id) AND t.created_at >= ?
      GROUP BY d.id, d.name
      ORDER BY completed_tasks DESC
    `, [startDate.toISOString()]) as any[]

    // 6. Top performers
    const topPerformers = await executeQuery(`
      SELECT 
        u.id,
        u.name,
        COALESCE(u.avatar_url, u.profile_image) as avatar,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gems_earned ELSE 0 END), 0) as gems_earned
      FROM users u
      LEFT JOIN tasks t ON (t.assigned_to = u.id OR t.user_id = u.id) AND t.created_at >= ?
      GROUP BY u.id, u.name, u.profile_image, u.avatar_url
      HAVING completed_tasks > 0
      ORDER BY gems_earned DESC, completed_tasks DESC
      LIMIT 10
    `, [startDate.toISOString()]) as any[]

    // 7. Energía y check-ins
    const checkins = await executeQuery(`
      SELECT checkin_date, energy_level FROM daily_checkins WHERE user_id = ? AND checkin_date >= ? ORDER BY checkin_date ASC`, [userId, startDate.toISOString()]) as any[];
    // Calcular energía promedio semanal y mensual
    const energyLevels = checkins.map(c => c.energy_level);
    const avgEnergy = energyLevels.length ? (energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length) : 0;
    // Mejor día de energía
    const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const energyByDay: Record<string, number[]> = {};
    checkins.forEach(c => {
      const d = new Date(c.checkin_date);
      const day = daysOfWeek[d.getDay()];
      if (!energyByDay[day]) energyByDay[day] = [];
      energyByDay[day].push(c.energy_level);
    });
    let bestDay = null, bestAvg = 0;
    for (const day in energyByDay) {
      const avg = energyByDay[day].reduce((a, b) => a + b, 0) / energyByDay[day].length;
      if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
    }

    // 8. Análisis por prioridad
    const priorities = ['urgent','high','medium','low'];
    const priorityStats = {} as Record<string, { total: number, completed: number }>;
    for (const p of priorities) {
      const rows = await executeQuery(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM tasks WHERE (user_id = ? OR assigned_to = ? OR created_by = ?) AND priority = ? AND created_at >= ?`, [userId, userId, userId, p, startDate.toISOString()]) as any[];
      priorityStats[p] = { total: Number(rows[0]?.total || 0), completed: Number(rows[0]?.completed || 0) };
    }

      // 9. Análisis por categorías (tasks.category) - para mostrar categorías como 'operaciones'
      const categoryStats = await executeQuery(`
        SELECT 
          COALESCE(category, 'Sin categoría') as category,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN gems_earned ELSE 0 END), 0) as gems_earned
        FROM tasks
        WHERE (user_id = ? OR assigned_to = ? OR created_by = ?)
          AND created_at >= ?
        GROUP BY category
        ORDER BY total DESC
      `, [userId, userId, userId, startDate.toISOString()]) as any[]

      // 10. Categorías ALL-TIME: categorías que tienen tareas asignadas en todo el histórico (ignora período)
      const categoriesAllTime = await executeQuery(`
        SELECT 
          COALESCE(category, 'Sin categoría') as category,
          COUNT(*) as total_assigned,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM tasks
        WHERE assigned_to IS NOT NULL
        GROUP BY category
        HAVING total_assigned > 0
        ORDER BY total_assigned DESC
      `, []) as any[]

      // shift previous numbering for AI insights
    // 9. Insights IA
    const aiInsights = await fetchAIInsights(userId, period);

    // Formatear respuesta

    // Aggregate totals for summary
    const totalTasksFromDepts = (departmentMetrics as any[]).reduce((sum: number, d: any) => sum + Number(d.total_tasks || 0), 0);
    const completedTasksFromDepts = (departmentMetrics as any[]).reduce((sum: number, d: any) => sum + Number(d.completed_tasks || 0), 0);

    const response = {
      success: true,
      data: {
        user: {
          name: user.name,
          totalGems: user.total_gems,
          level: user.level,
          currentStreak: user.current_streak || 0
        },
        kpis: [
          {
            title: "Tareas Completadas",
            value: `${currentUserMetrics.completed_tasks}/${currentUserMetrics.total_tasks}`,
            change: calculateChange(currentUserMetrics.completed_tasks, prevMetrics.completed_tasks),
            trend: currentUserMetrics.completed_tasks >= prevMetrics.completed_tasks ? 'up' : 'down',
            icon: "CheckCircle"
          },
          {
            title: "Gemas Ganadas",
            value: currentUserMetrics.gems_earned.toString(),
            change: calculateChange(currentUserMetrics.gems_earned, prevMetrics.gems_earned),
            trend: currentUserMetrics.gems_earned >= prevMetrics.gems_earned ? 'up' : 'down',
            icon: "Gem"
          },
          {
            title: "Días Activos",
            value: currentUserMetrics.active_days.toString(),
            change: 0,
            trend: 'neutral' as const,
            icon: "Calendar"
          },
          {
            title: "Tasa de Completitud",
            value: currentUserMetrics.total_tasks > 0 
              ? `${Math.round((currentUserMetrics.completed_tasks / currentUserMetrics.total_tasks) * 100)}%`
              : "0%",
            change: 0,
            trend: 'neutral' as const,
            icon: "Target"
          }
        ],
        charts: {
          departments: departmentMetrics.map((dept: any) => ({
            name: dept.department_name,
            completedTasks: dept.completed_tasks,
            totalTasks: dept.total_tasks,
            activeUsers: dept.active_users,
            gemsEarned: dept.gems_earned,
            completionRate: dept.total_tasks > 0 
              ? Math.round((dept.completed_tasks / dept.total_tasks) * 100) 
              : 0
          })),
          // Categories aggregation (tasks.category)
          categories: categoryStats.map((c: any) => ({
            name: c.category,
            total: Number(c.total || 0),
            completed: Number(c.completed || 0),
            gemsEarned: Number(c.gems_earned || 0),
            completionRate: c.total > 0 ? Math.round((Number(c.completed || 0) / Number(c.total || 1)) * 100) : 0
          })),
          // All-time categories (assigned tasks across history)
          categoriesAllTime: categoriesAllTime.map((c: any) => ({
            name: c.category,
            totalAssigned: Number(c.total_assigned || 0),
            completed: Number(c.completed || 0)
          })),
          trends: {
            daily: dailyTrends.map((day: any) => ({
              date: day.date,
              completed: day.completed,
              created: day.created,
              gems: day.gems
            }))
          }
        },
        leaderboard: topPerformers.map((performer: any, index: number) => ({
          rank: index + 1,
          name: performer.name,
          avatar: performer.avatar,
          completedTasks: performer.completed_tasks,
          gemsEarned: performer.gems_earned
        })),
        summary: {
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          totalUsers: departmentMetrics.reduce((sum: number, dept: any) => sum + dept.active_users, 0),
          totalDepartments: departmentMetrics.length,
          totalTasks: totalTasksFromDepts,
          completedTasks: completedTasksFromDepts
        },
        // NUEVO: Energía y check-ins
        energy: {
          avg: Number(avgEnergy.toFixed(2)),
          bestDay: bestDay,
          bestDayAvg: Number(bestAvg.toFixed(2)),
          totalCheckins: checkins.length,
          checkins: checkins
        },
        // NUEVO: Prioridades
        priorities: priorities.map(p => ({
          priority: p,
          total: priorityStats[p].total,
          completed: priorityStats[p].completed,
          completionRate: priorityStats[p].total > 0 ? Math.round((priorityStats[p].completed / Math.max(priorityStats[p].total,1)) * 100) : 0
        })),
        // NUEVO: Insights IA
        aiInsights: aiInsights
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' }, 
      { status: 500 }
    )
  }
}