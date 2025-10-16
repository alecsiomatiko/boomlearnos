import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/mysql"
import { getOrCreateDefaultUser as getOrCreateDefaultUserFromServer, getMockTasks as getMockTasksFromServer, type Task } from "@/lib/server/mysql"
import { generateUUID } from '@/lib/server/mysql'
import { calculateGems, awardGems } from "@/lib/gems-system"
import { getCurrentUser } from "@/lib/server/auth"
import { getOrgIdForRequest } from "@/lib/server/org-utils"

export async function GET(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: "No autorizado: falta organization_id" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id;
    const status = searchParams.get("status")

    // MySQL query - AHORA FILTRA POR organization_id
    const conn = await pool.getConnection();
    try {
      let query = `SELECT * FROM tasks WHERE organization_id = ? AND (user_id = ? OR assigned_to = ? OR created_by = ?)`;
      const params: any[] = [organizationId, userId, userId, userId];
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      query += ` ORDER BY due_date ASC, created_at DESC`;
      const [rows] = await conn.query(query, params);
      
      // Convert snake_case to camelCase
      const tasks = (rows as any[]).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        difficulty: task.difficulty,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours,
        completionPercentage: task.completion_percentage,
        gems: task.gems_earned,
        assignedTo: task.assigned_to,
        createdBy: task.created_by,
        completed: task.status === 'completed',
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        progress: task.completion_percentage,
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          tasks
        }
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: "No autorizado: falta organization_id" }, { status: 401 });
    }

    const body = await request.json()
    const { title, description, category, difficulty, priority, dueDate, estimatedHours, assignedTo, createdBy } = body

    // Validar campos requeridos
    if (!title || !category || !difficulty || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // MySQL query - INCLUYE organization_id
    const conn = await pool.getConnection();
    try {
      const taskId = generateUUID();
      await conn.query(
        `INSERT INTO tasks (
          id, user_id, organization_id, title, description, category, difficulty, priority,
          due_date, estimated_hours, assigned_to, created_by, status, completion_percentage, gems_earned, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, NOW(), NOW())`,
        [
          taskId,
          user.id,
          organizationId,
          title,
          description || "",
          category,
          difficulty,
          priority || "medium",
          dueDate,
          estimatedHours || 1,
          assignedTo || user.id,
          createdBy || user.id,
        ]
      );
      // Get the inserted row by UUID
      const [rows] = await conn.query(`SELECT * FROM tasks WHERE id = ?`, [taskId]);
      const dbTask = (rows as any[])[0];
      
      // Convert to camelCase
      const task = {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        category: dbTask.category,
        difficulty: dbTask.difficulty,
        priority: dbTask.priority,
        status: dbTask.status,
        dueDate: dbTask.due_date,
        estimatedHours: dbTask.estimated_hours,
        completionPercentage: dbTask.completion_percentage,
        gems: dbTask.gems_earned,
        assignedTo: dbTask.assigned_to,
        createdBy: dbTask.created_by,
        completed: dbTask.status === 'completed',
        createdAt: dbTask.created_at,
        progress: dbTask.completion_percentage,
      };
      
      return NextResponse.json({
        success: true,
        data: {
          taskId: taskId,
          task
        }
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, completionPercentage, actualHours } = body
    
    console.log('[PUT /api/tasks] Request body:', body);

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    // MySQL query
    const conn = await pool.getConnection();
    try {
      // Obtener la tarea actual
      const [currentTaskRows] = await conn.query(`SELECT * FROM tasks WHERE id = ?`, [id]);
      console.log('[PUT /api/tasks] Current task rows:', currentTaskRows);
      
      if ((currentTaskRows as any[]).length === 0) {
        return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
      }
      const task = (currentTaskRows as any[])[0] as Task;
      console.log('[PUT /api/tasks] Task found:', { id: task.id, status: task.status, user_id: task.user_id });
      
      const completedAt = status === "completed" ? new Date().toISOString() : null;

      // Calcular gemas si se completa la tarea
      let gemsEarned = 0;
      let newTotalGems: number | null = null;
      if (status === "completed" && task.status !== "completed") {
        console.log('[PUT /api/tasks] Calculating gems for task completion...');
        const gemCalculation = calculateGems(task, completedAt ? new Date(completedAt) : undefined);
        gemsEarned = gemCalculation.totalGems;
        console.log('[PUT /api/tasks] Gems calculated:', gemsEarned);
        
        // Otorgar gemas al usuario
        const userId = task.user_id || task.assigned_to || "550e8400-e29b-41d4-a716-446655440000";
        console.log('[PUT /api/tasks] Awarding gems to user:', userId);
        
        newTotalGems = await awardGems(
          userId,
          gemsEarned,
          `Tarea completada: ${task.title}`,
          task.id,
          undefined,
          gemCalculation,
        );
        
        console.log('[PUT /api/tasks] Gems awarded successfully, new total:', newTotalGems);
      } else {
        console.log('[PUT /api/tasks] No gems awarded. Status:', status, 'Task status:', task.status);
      }

      // Actualizar la tarea
      await conn.query(
        `UPDATE tasks SET
          status = ?,
          completion_percentage = ?,
          actual_hours = ?,
          gems_earned = ?,
          completed_at = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          status || task.status,
          completionPercentage ?? task.completion_percentage,
          actualHours ?? task.actual_hours,
          gemsEarned || task.gems_earned,
          completedAt || task.completed_at,
          id,
        ]
      );
      // Get updated row and convert to camelCase
      const [updatedRows] = await conn.query(`SELECT * FROM tasks WHERE id = ?`, [id]);
      const dbTask = (updatedRows as any[])[0];
      
      const updatedTask = {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        category: dbTask.category,
        difficulty: dbTask.difficulty,
        priority: dbTask.priority,
        status: dbTask.status,
        dueDate: dbTask.due_date,
        estimatedHours: dbTask.estimated_hours,
        actualHours: dbTask.actual_hours,
        completionPercentage: dbTask.completion_percentage,
        gems: dbTask.gems_earned,
        assignedTo: dbTask.assigned_to,
        createdBy: dbTask.created_by,
        completed: dbTask.status === 'completed',
        completedAt: dbTask.completed_at,
        createdAt: dbTask.created_at,
        progress: dbTask.completion_percentage,
      };
      
      // 🏆 Verificar logros automáticos si se completó la tarea
      let unlockedAchievements: any[] = [];
      if (status === 'completed' && task.status !== 'completed') {
        try {
          const checkUrl = new URL('/api/achievements/check', request.url);
          const checkReq = new NextRequest(checkUrl, {
            method: 'POST',
            headers: request.headers
          });
          const achievementResponse = await fetch(checkReq);
          if (achievementResponse.ok) {
            const achievementData = await achievementResponse.json();
            unlockedAchievements = achievementData.data?.unlockedAchievements || [];
            console.log(`🏆 Logros desbloqueados: ${unlockedAchievements.length}`);
          }
        } catch (e) {
          console.log('⚠️ No se pudieron verificar logros:', e);
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedTask,
        gemsEarned,
        newTotalGems,
        unlockedAchievements
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 })
  }
}
