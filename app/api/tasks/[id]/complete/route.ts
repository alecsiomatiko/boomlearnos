import { NextRequest, NextResponse } from 'next/server'

import { executeQuery } from '@/lib/server/mysql'
import { checkAndUnlockBadges } from '@/lib/server/achievements'

// POST /api/tasks/[id]/complete - Completar una tarea y otorgar gemas
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()
    const { userId } = body

    if (!taskId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar que la tarea existe y no está completada
    const [task] = await executeQuery(`
      SELECT * FROM tasks 
      WHERE id = ? AND status != 'completed'
    `, [taskId]) as any[]

    if (!task) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task not found or already completed' 
      }, { status: 404 })
    }

    // Verificar que el usuario tiene permiso para completar la tarea
    if (task.assigned_user_id !== userId && task.created_by !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized to complete this task' 
      }, { status: 403 })
    }

    // Iniciar transacción
    await executeQuery('START TRANSACTION', [])

    try {
      // Marcar tarea como completada
      await executeQuery(`
        UPDATE tasks 
        SET status = 'completed', 
            completion_percentage = 100,
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [taskId])

      // Calcular gemas a otorgar (usar gems_earned del task o calcular basado en dificultad)
      let gemsEarned = task.gems_earned || 0
      
      if (gemsEarned === 0) {
        // Calcular gemas basado en dificultad y prioridad

        const difficultyMap: Record<string, number> = {
          'easy': 1,
          'medium': 1.5,
          'hard': 2,
          'very_hard': 3
        };
        const priorityMap: Record<string, number> = {
          'low': 1,
          'medium': 1.2,
          'high': 1.5,
          'urgent': 2
        };
        const difficultyMultiplier = difficultyMap[String(task.difficulty)] || 1;
        const priorityMultiplier = priorityMap[String(task.priority)] || 1;

        gemsEarned = Math.round(50 * difficultyMultiplier * priorityMultiplier)
      }

      // Actualizar gemas del usuario
      await executeQuery(`
        UPDATE users 
        SET total_gems = total_gems + ?
        WHERE id = ?
      `, [gemsEarned, userId])

      // Registrar en historial de gemas
      await executeQuery(`
        INSERT INTO gems_history (user_id, source_type, source_id, gems_amount, description)
        VALUES (?, 'task_completion', ?, ?, ?)
      `, [userId, taskId, gemsEarned, `Tarea completada: ${task.title}`])


      // Lógica automática: verificar y desbloquear logros (badges)
      await checkAndUnlockBadges(userId);

      // Confirmar transacción
      await executeQuery('COMMIT', [])


      return NextResponse.json({
        success: true,
        data: {
          taskId,
          gemsEarned,
          message: `Tarea completada! +${gemsEarned} gemas`
        }
      })

    } catch (transactionError) {
      // Revertir transacción en caso de error
      await executeQuery('ROLLBACK', [])
      throw transactionError
    }

  } catch (error) {
    console.error('Error completing task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete task' }, 
      { status: 500 }
    )
  }
}