import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import mysql from 'mysql2/promise'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
}

interface DiagnosticAnswers {
  [key: string]: string | string[]
}

export async function POST(request: NextRequest) {
  try {
    const { answers, userId } = await request.json()

    if (!answers || !userId) {
      return NextResponse.json(
        { error: 'Faltan respuestas o ID de usuario' },
        { status: 400 }
      )
    }

    // Generar análisis con OpenAI
    const analysis = await generateDiagnosticAnalysis(answers)
    
    // Guardar en la base de datos
    await saveDiagnosticResults(userId, answers, analysis)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Error processing diagnostic:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)
    
    try {
      const query = `
        SELECT diagnostic_answers, diagnostic_analysis, created_at, updated_at
        FROM advanced_diagnostics 
        WHERE user_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `
      
      const [results] = await connection.execute(query, [userId]) as any[]
      
      if (!results || results.length === 0) {
        return NextResponse.json(
          { error: 'No se encontró diagnóstico para este usuario' },
          { status: 404 }
        )
      }

      const diagnostic = results[0]
      
      return NextResponse.json({
        success: true,
        answers: JSON.parse(diagnostic.diagnostic_answers),
        analysis: JSON.parse(diagnostic.diagnostic_analysis),
        completedAt: diagnostic.updated_at
      })

    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error retrieving diagnostic:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function generateDiagnosticAnalysis(answers: DiagnosticAnswers) {
  const prompt = `
Eres un consultor de negocios experto. Analiza las siguientes respuestas de diagnóstico empresarial y proporciona:

1. **Nivel de Madurez Digital** (1-5)
2. **Fortalezas Principales** (3-4 puntos clave)
3. **Áreas de Oportunidad** (3-4 puntos específicos)
4. **Recomendaciones Inmediatas** (5 acciones concretas priorizadas)
5. **Hoja de Ruta** (plan a 90 días con hitos específicos)

Respuestas del diagnóstico:
${JSON.stringify(answers, null, 2)}

Por favor, proporciona un análisis profundo y accionable en formato JSON con la siguiente estructura:
{
  "maturityLevel": {
    "score": 1-5,
    "description": "Breve descripción del nivel"
  },
  "strengths": [
    "Fortaleza 1",
    "Fortaleza 2",
    "Fortaleza 3"
  ],
  "opportunities": [
    "Oportunidad 1",
    "Oportunidad 2", 
    "Oportunidad 3"
  ],
  "immediateActions": [
    {
      "action": "Acción específica",
      "priority": "Alta/Media/Baja",
      "timeframe": "1-2 semanas",
      "impact": "Alto/Medio/Bajo"
    }
  ],
  "roadmap": {
    "phase1": {
      "title": "Primeros 30 días",
      "goals": ["Meta 1", "Meta 2"],
      "actions": ["Acción 1", "Acción 2"]
    },
    "phase2": {
      "title": "Días 31-60", 
      "goals": ["Meta 1", "Meta 2"],
      "actions": ["Acción 1", "Acción 2"]
    },
    "phase3": {
      "title": "Días 61-90",
      "goals": ["Meta 1", "Meta 2"], 
      "actions": ["Acción 1", "Acción 2"]
    }
  },
  "keyMetrics": [
    {
      "metric": "Métrica específica",
      "currentState": "Estado actual estimado",
      "target": "Objetivo recomendado",
      "timeline": "Plazo para alcanzar"
    }
  ]
}
`

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un consultor de negocios experto especializado en transformación digital y crecimiento empresarial. Proporciona análisis profundos y recomendaciones accionables basadas en diagnósticos empresariales."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  const analysisText = completion.choices[0]?.message?.content || ''
  
  try {
    // Extraer JSON del texto de respuesta
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError)
  }

  // Fallback si no se puede parsear el JSON
  return {
    maturityLevel: {
      score: 3,
      description: "Nivel intermedio de digitalización"
    },
    strengths: [
      "Disposición al cambio",
      "Conocimiento del mercado",
      "Motivación de crecimiento"
    ],
    opportunities: [
      "Mejora en procesos digitales",
      "Optimización de recursos",
      "Expansión de mercado"
    ],
    immediateActions: [
      {
        action: "Revisar procesos actuales",
        priority: "Alta",
        timeframe: "1-2 semanas",
        impact: "Alto"
      }
    ],
    roadmap: {
      phase1: {
        title: "Primeros 30 días",
        goals: ["Evaluación completa", "Plan de acción"],
        actions: ["Auditoría de procesos", "Definir objetivos"]
      },
      phase2: {
        title: "Días 31-60",
        goals: ["Implementación inicial", "Capacitación"],
        actions: ["Herramientas básicas", "Entrenamiento equipo"]
      },
      phase3: {
        title: "Días 61-90",
        goals: ["Optimización", "Medición"],
        actions: ["Ajustes y mejoras", "Análisis de resultados"]
      }
    },
    keyMetrics: [
      {
        metric: "Eficiencia operativa",
        currentState: "Baseline a establecer",
        target: "Incremento del 20%",
        timeline: "90 días"
      }
    ]
  }
}

async function saveDiagnosticResults(userId: string, answers: DiagnosticAnswers, analysis: any) {
  const connection = await mysql.createConnection(dbConfig)
  
  try {
    // Crear tabla si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS advanced_diagnostics (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        diagnostic_answers JSON NOT NULL,
        diagnostic_analysis JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_diagnostic (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
    
    await connection.execute(createTableQuery)

    // Insertar o actualizar resultados del diagnóstico
    const query = `
      INSERT INTO advanced_diagnostics (user_id, diagnostic_answers, diagnostic_analysis)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      diagnostic_answers = VALUES(diagnostic_answers),
      diagnostic_analysis = VALUES(diagnostic_analysis),
      updated_at = CURRENT_TIMESTAMP
    `
    
    await connection.execute(query, [
      userId,
      JSON.stringify(answers),
      JSON.stringify(analysis)
    ])

    // Actualizar el estado de onboarding del usuario
    const updateUserQuery = `
      UPDATE users 
      SET onboarding_step = 'completed',
          updated_at = NOW()
      WHERE id = ?
    `
    
    await connection.execute(updateUserQuery, [userId])
    
  } finally {
    await connection.end()
  }
}