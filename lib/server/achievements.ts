
import { executeQuery } from './mysql';

// Badge type for type safety
interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  type: 'tasks_completed' | 'checkins_completed' | 'streak' | 'avg_energy' | 'urgent_tasks' | 'gems_earned' | 'custom';
  target_value: number;
  period: 'all' | 'week' | 'month' | 'year';
  custom_condition?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Verifica y desbloquea logros automáticamente para un usuario

export async function checkAndUnlockBadges(userId: number) {
  // 1. Obtener todos los logros activos
  const badgesRes = await executeQuery('SELECT * FROM badges WHERE is_active = TRUE', []);
  const badges: Badge[] = Array.isArray(badgesRes) ? badgesRes as Badge[] : [];
  // 2. Obtener logros ya desbloqueados por el usuario
  const userBadgesRes = await executeQuery('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
  const unlocked = new Set(Array.isArray(userBadgesRes) ? (userBadgesRes as { badge_id: number }[]).map(b => b.badge_id) : []);

  for (const badge of badges) {
    if (unlocked.has(badge.id)) continue;
    let meets = false;
    // Lógica para cada tipo de logro
    switch (badge.type) {
      case 'tasks_completed': {
        // Tareas completadas en el periodo
        let query = 'SELECT COUNT(*) as total FROM tasks WHERE assigned_user_id = ? AND status = "completed"';
        const params: any[] = [userId];
        if (badge.period !== 'all') {
          query += ' AND completed_at >= DATE_SUB(NOW(), INTERVAL 1 ' + badge.period.toUpperCase() + ')';
        }
        const [row] = await executeQuery(query, params) as any[];
        meets = row && row.total >= badge.target_value;
        break;
      }
      case 'checkins_completed': {
        let query = 'SELECT COUNT(*) as total FROM daily_checkins WHERE user_id = ?';
        const params: any[] = [userId];
        if (badge.period !== 'all') {
          query += ' AND checkin_date >= DATE_SUB(NOW(), INTERVAL 1 ' + badge.period.toUpperCase() + ')';
        }
        const [row] = await executeQuery(query, params) as any[];
        meets = row && row.total >= badge.target_value;
        break;
      }
      case 'streak': {
        // Streak actual del usuario
        const [row] = await executeQuery('SELECT current_streak FROM users WHERE id = ?', [userId]) as any[];
        meets = row && row.current_streak >= badge.target_value;
        break;
      }
      case 'avg_energy': {
        let query = 'SELECT AVG(energy_level) as avg_energy FROM daily_checkins WHERE user_id = ?';
        const params: any[] = [userId];
        if (badge.period !== 'all') {
          query += ' AND checkin_date >= DATE_SUB(NOW(), INTERVAL 1 ' + badge.period.toUpperCase() + ')';
        }
        const [row] = await executeQuery(query, params) as any[];
        meets = row && row.avg_energy >= badge.target_value;
        break;
      }
      case 'urgent_tasks': {
        let query = 'SELECT COUNT(*) as total FROM tasks WHERE assigned_user_id = ? AND status = "completed" AND priority = "urgent"';
        const params: any[] = [userId];
        if (badge.period !== 'all') {
          query += ' AND completed_at >= DATE_SUB(NOW(), INTERVAL 1 ' + badge.period.toUpperCase() + ')';
        }
        const [row] = await executeQuery(query, params) as any[];
        meets = row && row.total >= badge.target_value;
        break;
      }
      case 'gems_earned': {
        let query = 'SELECT SUM(gems_earned) as total_gems FROM tasks WHERE assigned_user_id = ? AND status = "completed"';
        const params: any[] = [userId];
        if (badge.period !== 'all') {
          query += ' AND completed_at >= DATE_SUB(NOW(), INTERVAL 1 ' + badge.period.toUpperCase() + ')';
        }
        const [row] = await executeQuery(query, params) as any[];
        meets = row && row.total_gems >= badge.target_value;
        break;
      }
      case 'custom': {
        // Aquí puedes implementar lógica personalizada si lo deseas
        meets = false;
        break;
      }
    }
    if (meets) {
      await executeQuery('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
    }
  }
}
