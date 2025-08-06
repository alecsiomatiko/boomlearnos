import { type NextRequest, NextResponse } from "next/server"
import { sql, getOrCreateDefaultUser, getMockTasks, type Task } from "@/lib/mysql"
import { calculateGems, awardGems } from "@/lib/gems-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "550e8400-e29b-41d4-a716-446655440000"
    const status = searchParams.get("status")

    if (!sql) {
      // Return mock data when no database
      const mockTasks = await getMockTasks()
      const filteredTasks = status ? mockTasks.filter((t) => t.status === status) : mockTasks
      return NextResponse.json({
        success: true,
        data: filteredTasks,
      })
    }

    let query = `
      SELECT * FROM tasks
      WHERE user_id = ? OR assigned_to = ? OR created_by = ?
    `
    const params = [userId, userId, userId]

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY due_date ASC, created_at DESC`

    const tasks = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, difficulty, priority, dueDate, estimatedHours, assignedTo, createdBy } = body

    const user = await getOrCreateDefaultUser()
    const userId = user?.id || "550e8400-e29b-41d4-a716-446655440000"

    // Validar campos requeridos
    if (!title || !category || !difficulty || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!sql) {
      // Mock response when no database
      const mockTask = {
        id: Date.now().toString(),
        user_id: userId,
        title,
        description: description || "",
        category,
        difficulty,
        priority: priority || "medium",
        status: "pending",
        due_date: dueDate,
        estimated_hours: estimatedHours || 1,
        completion_percentage: 0,
        gems_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: mockTask,
      })
    }

    const insertResult: any = await sql`
      INSERT INTO tasks (
        user_id, title, description, category, difficulty, priority,
        due_date, estimated_hours, assigned_to, created_by
      ) VALUES (
        ${userId}, ${title}, ${description || ""}, ${category}, ${difficulty}, ${priority || "medium"},
        ${dueDate}, ${estimatedHours || 1}, ${assignedTo || userId}, ${createdBy || userId}
      )
    `

    const task = await sql`SELECT * FROM tasks WHERE id = ${insertResult.insertId}`

    return NextResponse.json({
      success: true,
      data: task[0],
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, completionPercentage, actualHours } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 })
    }

    if (!sql) {
      // Mock response when no database
      return NextResponse.json({
        success: true,
        data: { id, status, completion_percentage: completionPercentage },
        gemsEarned: status === "completed" ? 94 : 0,
      })
    }

    // Obtener la tarea actual
    const currentTask = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `

    if (currentTask.length === 0) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    const task = currentTask[0] as Task
    const completedAt = status === "completed" ? new Date().toISOString() : null

    // Calcular gemas si se completa la tarea
    let gemsEarned = 0
    if (status === "completed" && task.status !== "completed") {
      const gemCalculation = calculateGems(task, completedAt ? new Date(completedAt) : undefined)
      gemsEarned = gemCalculation.totalGems

      // Otorgar gemas al usuario
      await awardGems(
        task.user_id || task.assigned_to || "550e8400-e29b-41d4-a716-446655440000",
        gemsEarned,
        `Tarea completada: ${task.title}`,
        task.id,
        undefined,
        gemCalculation,
      )
    }

    // Actualizar la tarea
    await sql`
      UPDATE tasks SET
        status = ${status || task.status},
        completion_percentage = ${completionPercentage ?? task.completion_percentage},
        actual_hours = ${actualHours ?? task.actual_hours},
        gems_earned = ${gemsEarned || task.gems_earned},
        completed_at = ${completedAt || task.completed_at},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    const updated = await sql`SELECT * FROM tasks WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      data: updated[0],
      gemsEarned,
    })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 })
  }
}
