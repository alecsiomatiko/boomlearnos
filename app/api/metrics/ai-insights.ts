import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import { OpenAI } from 'openai'

// POST /api/metrics/ai-insights
export async function POST(request: NextRequest) {
  try {
    const { userId, period } = await request.json()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // 1. Obtener datos de tareas
    const tasks = await executeQuery(
      `SELECT status, completion_percentage, created_at, completed_at, estimated_hours, actual_hours, gems_earned FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC`,
      [userId]
    )

    // 2. Obtener datos de check-ins
    const checkins = await executeQuery(
      `SELECT checkin_date, energy_level, notes FROM daily_checkins WHERE user_id = ? ORDER BY checkin_date DESC`,
      [userId]
    )

    // 3. Preparar resumen para IA
    const resumen = {
      tareas: tasks,
      checkins: checkins
    }

    // 4. Llamar a OpenAI para insights
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const prompt = `Eres un analista experto en productividad y bienestar laboral. Analiza los siguientes datos de tareas y check-ins de ánimo/energía. Genera insights accionables, tendencias, alertas y recomendaciones para la empresa. Responde en español, formato markdown, con títulos claros y bullets.\n\nDatos:\n${JSON.stringify(resumen)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un analista experto en productividad y bienestar laboral.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600
    })

    const insights = completion.choices[0]?.message?.content || 'No se generaron insights.'

    return NextResponse.json({ success: true, insights })
  } catch (error) {
    console.error('Error generando insights IA:', error)
    return NextResponse.json({ success: false, error: 'Error generando insights IA' }, { status: 500 })
  }
}
