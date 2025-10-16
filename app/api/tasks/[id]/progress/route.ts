import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

// PUT /api/tasks/[id]/progress - Actualizar progreso de una tarea
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()
    const { userId, completionPercentage } = body

    if (!taskId || !userId || completionPercentage === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Validar rango de porcentaje
    if (completionPercentage < 0 || completionPercentage > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Completion percentage must be between 0 and 100' 
      }, { status: 400 })
    }

    // Verificar que la tarea existe
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

    // Verificar permisos
    if (task.assigned_user_id !== userId && task.created_by !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized to update this task' 
      }, { status: 403 })
    }

    // Actualizar progreso
    await executeQuery(`
      UPDATE tasks 
      SET completion_percentage = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [completionPercentage, taskId])

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        completionPercentage,
        message: 'Task progress updated successfully'
      }
    })

  } catch (error) {
    console.error('Error updating task progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task progress' }, 
      { status: 500 }
    )
  }
}