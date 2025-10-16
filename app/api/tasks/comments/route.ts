import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

// POST /api/tasks/comments - Agregar comentario a una tarea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, userId, content } = body

    if (!taskId || !userId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar que la tarea existe
    const [task] = await executeQuery(`
      SELECT id FROM tasks WHERE id = ?
    `, [taskId]) as any[]

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    // Crear tabla de comentarios si no existe
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        task_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, [])

    // Insertar comentario
    const result = await executeQuery(`
      INSERT INTO task_comments (task_id, user_id, content)
      VALUES (?, ?, ?)
    `, [taskId, userId, content.trim()]) as any

    return NextResponse.json({
      success: true,
      data: {
        commentId: result.insertId,
        message: 'Comment added successfully'
      }
    })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' }, 
      { status: 500 }
    )
  }
}

// GET /api/tasks/comments?taskId=xxx - Obtener comentarios de una tarea
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 })
    }

    const comments = await executeQuery(`
      SELECT 
        tc.*, 
        u.name as author_name,
        COALESCE(u.avatar_url, u.profile_image) as author_avatar
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `, [taskId]) as any[]

    return NextResponse.json({
      success: true,
      data: {
          comments: comments.map((comment: any) => ({
          id: comment.id,
          author: comment.author_name,
          text: comment.content,
          date: comment.created_at,
          avatar: comment.author_avatar
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' }, 
      { status: 500 }
    )
  }
}