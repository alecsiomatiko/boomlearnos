import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { getCurrentUser } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';
import { generateUUID } from '@/lib/server/mysql';

/**
 * POST /api/achievements/check
 * Verifica y desbloquea logros automáticos para un usuario
 * Sistema genérico que lee las condiciones de la tabla achievements
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const userId = user.id;
    const unlockedAchievements: any[] = [];

    // Obtener todos los logros con auto_unlock habilitado
    const autoAchievements = await executeQuery(
      `SELECT id, name, points, trigger_type, trigger_value, max_progress 
       FROM achievements 
       WHERE organization_id = ? AND active = TRUE AND auto_unlock = TRUE`,
      [organizationId]
    ) as any[];

    console.log(`🏆 Verificando ${autoAchievements.length} logros automáticos para usuario ${userId}`);

    for (const achievement of autoAchievements) {
      // Verificar si ya está desbloqueado
      const [existing] = await executeQuery(
        'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userId, achievement.id]
      ) as any[];

      if (existing) {
        continue; // Ya desbloqueado
      }

      let currentValue = 0;
      let shouldUnlock = false;

      // Calcular progreso según el tipo de trigger
      switch (achievement.trigger_type) {
        case 'tasks_completed':
          const [tasks] = await executeQuery(
            'SELECT COUNT(*) as count FROM tasks WHERE (user_id = ? OR assigned_to = ?) AND status = "completed" AND organization_id = ?',
            [userId, userId, organizationId]
          ) as any[];
          currentValue = tasks.count;
          shouldUnlock = currentValue >= achievement.trigger_value;
          console.log(`📋 Tareas completadas: ${currentValue}/${achievement.trigger_value}`);
          break;

        case 'checkin_streak':
          const [userStreak] = await executeQuery(
            'SELECT current_streak FROM users WHERE id = ?',
            [userId]
          ) as any[];
          currentValue = userStreak?.current_streak || 0;
          shouldUnlock = currentValue >= achievement.trigger_value;
          console.log(`🔥 Racha actual: ${currentValue}/${achievement.trigger_value}`);
          break;

        case 'gems_earned':
          const [userGems] = await executeQuery(
            'SELECT total_gems FROM users WHERE id = ?',
            [userId]
          ) as any[];
          currentValue = userGems?.total_gems || 0;
          shouldUnlock = currentValue >= achievement.trigger_value;
          console.log(`💎 Gemas totales: ${currentValue}/${achievement.trigger_value}`);
          break;

        case 'messages_sent':
          const [messages] = await executeQuery(
            'SELECT COUNT(*) as count FROM messages WHERE sender_id = ?',
            [userId]
          ) as any[];
          currentValue = messages.count;
          shouldUnlock = currentValue >= achievement.trigger_value;
          console.log(`💬 Mensajes enviados: ${currentValue}/${achievement.trigger_value}`);
          break;

        default:
          // manual o no reconocido
          continue;
      }

      if (shouldUnlock) {
        console.log(`✅ Desbloqueando logro: ${achievement.name}`);
        
        // Desbloquear logro
        const achievementRecordId = generateUUID();
        await executeQuery(
          `INSERT INTO user_achievements (id, user_id, achievement_id, progress, max_progress, unlocked_at, organization_id) 
           VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
          [achievementRecordId, userId, achievement.id, achievement.trigger_value, achievement.max_progress, organizationId]
        );

        // Agregar también a user_badges (compatibilidad)
        const badgeId = generateUUID();
        try {
          await executeQuery(
            `INSERT INTO user_badges (id, user_id, badge_id, unlocked_at, organization_id) 
             VALUES (?, ?, ?, NOW(), ?)`,
            [badgeId, userId, achievement.id, organizationId]
          );
        } catch (e) {
          console.log('⚠️ No se pudo insertar en user_badges (tabla puede no existir)');
        }

        // Dar puntos/gemas al usuario
        if (achievement.points > 0) {
          await executeQuery(
            'UPDATE users SET total_gems = total_gems + ? WHERE id = ?',
            [achievement.points, userId]
          );

          // Registrar en historial de gemas
          const gemsHistoryId = generateUUID();
          await executeQuery(
            `INSERT INTO gems_history (id, user_id, source_type, source_id, gems_amount, description, organization_id, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [gemsHistoryId, userId, 'achievement', achievement.id, achievement.points, `Logro desbloqueado: ${achievement.name}`, organizationId]
          );
        }

        unlockedAchievements.push({
          id: achievement.id,
          name: achievement.name,
          points: achievement.points,
          trigger_type: achievement.trigger_type
        });
      }
    }

    console.log(`🎉 Total logros desbloqueados: ${unlockedAchievements.length}`);

    return NextResponse.json({
      success: true,
      data: {
        checked: true,
        unlockedCount: unlockedAchievements.length,
        unlockedAchievements
      }
    });

  } catch (error) {
    console.error('❌ Error checking achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
