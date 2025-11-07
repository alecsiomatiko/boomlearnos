import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { getOpenAIClient, isOpenAIAvailable } from '@/lib/openai-client'

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
Eres un consultor empresarial experto. Analiza las siguientes respuestas del diagnóstico inicial de onboarding y genera un análisis completo.

Respuestas del usuario:
${JSON.stringify(answers, null, 2)}

IMPORTANTE: Debes generar un JSON con la siguiente estructura EXACTA:

{
  "mission": "Una declaración de misión clara y concisa (2-3 oraciones) basada en el propósito del negocio, su propuesta de valor y cliente objetivo",
  "vision": "Una declaración de visión inspiradora (2-3 oraciones) basada en los objetivos a largo plazo y aspiraciones del negocio",
  "values": [
    "Valor 1 expandido con breve descripción",
    "Valor 2 expandido con breve descripción",
    "Valor 3 expandido con breve descripción"
  ],
  "diagnostic": {
    "maturityLevel": {
      "score": 1-5,
      "description": "Descripción del nivel de madurez digital y empresarial"
    },
    "strengths": [
      "Fortaleza 1 identificada",
      "Fortaleza 2 identificada",
      "Fortaleza 3 identificada"
    ],
    "opportunities": [
      "Oportunidad 1 específica",
      "Oportunidad 2 específica",
      "Oportunidad 3 específica"
    ],
    "immediateActions": [
      {
        "action": "Acción específica y accionable",
        "priority": "Alta",
        "timeframe": "1-2 semanas",
        "impact": "Alto",
        "why": "Breve explicación de por qué es importante"
      },
      {
        "action": "Segunda acción prioritaria",
        "priority": "Alta",
        "timeframe": "2-4 semanas",
        "impact": "Medio",
        "why": "Justificación de la acción"
      },
      {
        "action": "Tercera acción recomendada",
        "priority": "Media",
        "timeframe": "1 mes",
        "impact": "Medio",
        "why": "Razón de esta recomendación"
      }
    ],
    "roadmap": {
      "phase1": {
        "title": "Primeros 30 días - Fundamentos",
        "goals": ["Meta clara 1", "Meta clara 2"],
        "actions": ["Acción específica 1", "Acción específica 2", "Acción específica 3"]
      },
      "phase2": {
        "title": "Días 31-60 - Implementación",
        "goals": ["Meta de implementación 1", "Meta de implementación 2"],
        "actions": ["Acción de implementación 1", "Acción de implementación 2", "Acción de implementación 3"]
      },
      "phase3": {
        "title": "Días 61-90 - Optimización",
        "goals": ["Meta de optimización 1", "Meta de optimización 2"],
        "actions": ["Acción de optimización 1", "Acción de optimización 2", "Acción de optimización 3"]
      }
    },
    "keyMetrics": [
      {
        "metric": "Métrica específica a medir",
        "currentState": "Estado actual estimado basado en las respuestas",
        "target": "Objetivo recomendado realista",
        "timeline": "Plazo para alcanzar (ej: 90 días)"
      },
      {
        "metric": "Segunda métrica importante",
        "currentState": "Estado estimado",
        "target": "Meta sugerida",
        "timeline": "Tiempo recomendado"
      }
    ],
    "criticalInsights": [
      "Insight profundo 1 basado en las respuestas",
      "Insight profundo 2 sobre el negocio",
      "Insight profundo 3 con recomendación estratégica"
    ]
  }
}

INSTRUCCIONES ESPECÍFICAS:
1. La MISIÓN debe reflejar el propósito del negocio (business_purpose), su propuesta de valor única (unique_value) y cliente objetivo (target_customer)
2. La VISIÓN debe estar alineada con la visión a largo plazo (long_term_vision) y metas de crecimiento (revenue_goal)
3. Los VALORES deben expandir los valores seleccionados (core_values) con una breve descripción de qué significan para este negocio
4. El DIAGNÓSTICO debe considerar: nivel de digitalización (digital_readiness), etapa del negocio (team_size_stage), principales retos (biggest_bottleneck, immediate_challenge)
5. Las ACCIONES INMEDIATAS deben ser priorizadas por urgencia y enfocarse en resolver los cuellos de botella identificados
6. El ROADMAP debe ser realista considerando la etapa del negocio
7. Las MÉTRICAS deben ser específicas, medibles y relevantes para este negocio

Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.
`

  // 🤖 Obtener cliente OpenAI
  const openai = getOpenAIClient()
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más rápido y económico que soporta JSON mode
      messages: [
        {
          role: "system",
          content: "Eres un consultor de negocios estratégico experto en transformación digital, growth marketing y desarrollo organizacional. Tu especialidad es crear declaraciones de misión, visión y valores corporativos alineados con diagnósticos empresariales profundos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })

    const analysisText = completion.choices[0]?.message?.content || ''
    
    try {
      const parsedAnalysis = JSON.parse(analysisText)
      console.log('✅ [AI] Análisis generado exitosamente con IA')
      return parsedAnalysis
    } catch (parseError) {
      console.error('❌ [AI] Error parsing OpenAI JSON response:', parseError)
      throw new Error('Error al parsear respuesta de IA')
    }
  } catch (openaiError) {
    console.error('❌ [AI] Error calling OpenAI:', openaiError)
    
    // Fallback: generar análisis básico sin IA
    return generateFallbackAnalysis(answers)
  }
}

// Función fallback si OpenAI falla
function generateFallbackAnalysis(answers: DiagnosticAnswers) {
  console.log('⚠️ [AI] Usando análisis fallback (sin IA)')
  
  return {
    mission: "Transformar y potenciar negocios mediante soluciones innovadoras que generen impacto real y sostenible en nuestros clientes y comunidades.",
    vision: "Ser reconocidos como líderes en nuestra industria, destacando por nuestra excelencia operativa, innovación constante y compromiso con el crecimiento sostenible de nuestros clientes.",
    values: [
      "Innovación: Buscamos constantemente nuevas formas de mejorar y crear valor",
      "Calidad: Comprometidos con la excelencia en cada aspecto de nuestro trabajo",
      "Integridad: Actuamos con honestidad, transparencia y respeto en todas nuestras relaciones"
    ],
    diagnostic: {
      maturityLevel: {
        score: 3,
        description: "Nivel intermedio de madurez empresarial con oportunidades de digitalización y optimización de procesos"
      },
      strengths: [
        "Claridad en la propuesta de valor y conocimiento del cliente objetivo",
        "Disposición al cambio y apertura a nuevas tecnologías",
        "Visión clara de crecimiento a largo plazo"
      ],
      opportunities: [
        "Mejorar nivel de digitalización para optimizar operaciones",
        "Implementar sistemas de medición y análisis de datos",
        "Desarrollar estrategias para resolver cuellos de botella identificados"
      ],
      immediateActions: [
        {
          action: "Auditoría de procesos actuales y identificación de oportunidades de automatización",
          priority: "Alta",
          timeframe: "1-2 semanas",
          impact: "Alto",
          why: "Identificar quick wins y áreas de mejora inmediata"
        },
        {
          action: "Implementar herramientas digitales básicas (CRM, gestión de proyectos)",
          priority: "Alta",
          timeframe: "2-4 semanas",
          impact: "Medio",
          why: "Mejorar eficiencia operativa y seguimiento de clientes"
        },
        {
          action: "Definir métricas clave (KPIs) y sistema de seguimiento",
          priority: "Media",
          timeframe: "1 mes",
          impact: "Medio",
          why: "Tomar decisiones basadas en datos y medir progreso"
        }
      ],
      roadmap: {
        phase1: {
          title: "Primeros 30 días - Fundamentos",
          goals: ["Establecer baseline de operaciones actuales", "Implementar herramientas básicas"],
          actions: ["Mapear procesos clave", "Configurar CRM básico", "Definir KPIs principales"]
        },
        phase2: {
          title: "Días 31-60 - Implementación",
          goals: ["Optimizar procesos críticos", "Capacitar al equipo"],
          actions: ["Automatizar tareas repetitivas", "Entrenar equipo en nuevas herramientas", "Implementar sistema de seguimiento"]
        },
        phase3: {
          title: "Días 61-90 - Optimización",
          goals: ["Medir resultados y ajustar", "Escalar mejoras"],
          actions: ["Analizar métricas y ROI", "Identificar next steps", "Planificar siguiente fase"]
        }
      },
      keyMetrics: [
        {
          metric: "Eficiencia operativa",
          currentState: "Baseline a establecer",
          target: "Incremento del 20-30%",
          timeline: "90 días"
        },
        {
          metric: "Adopción de herramientas digitales",
          currentState: "0% de uso sistemático",
          target: "80% del equipo usando activamente",
          timeline: "60 días"
        }
      ],
      criticalInsights: [
        "La digitalización es clave para escalar operaciones de manera eficiente",
        "Definir y medir métricas claras permitirá tomar mejores decisiones estratégicas",
        "Invertir en capacitación del equipo generará mejores resultados a largo plazo"
      ]
    }
  }
}

async function saveDiagnosticResults(userId: string, answers: DiagnosticAnswers, analysis: any) {
  const connection = await mysql.createConnection(dbConfig)
  
  try {
    await connection.beginTransaction()

    // 1. Crear tabla advanced_diagnostics si no existe
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

    // 2. Insertar o actualizar resultados del diagnóstico
    const advancedDiagnosticQuery = `
      INSERT INTO advanced_diagnostics (user_id, diagnostic_answers, diagnostic_analysis)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      diagnostic_answers = VALUES(diagnostic_answers),
      diagnostic_analysis = VALUES(diagnostic_analysis),
      updated_at = CURRENT_TIMESTAMP
    `
    await connection.execute(advancedDiagnosticQuery, [
      userId,
      JSON.stringify(answers),
      JSON.stringify(analysis)
    ])

    // 3. Actualizar la organización con Misión, Visión y Valores
    if (analysis.mission && analysis.vision && analysis.values) {
      console.log('📝 [ONBOARDING] Actualizando organización con Misión, Visión y Valores...')
      
      const updateOrgQuery = `
        UPDATE organizations 
        SET 
          mission = ?,
          vision = ?,
          values_json = ?
        WHERE created_by = ?
      `
      await connection.execute(updateOrgQuery, [
        analysis.mission,
        analysis.vision,
        JSON.stringify(analysis.values),
        userId
      ])
      
      console.log('✅ [ONBOARDING] Organización actualizada con identidad corporativa')
    }

    // 4. Obtener la organización del usuario
    const [orgResult] = await connection.execute(
      'SELECT id FROM organizations WHERE created_by = ? LIMIT 1',
      [userId]
    ) as any[]
    
    const organizationId = orgResult.length > 0 ? orgResult[0].id : null

    if (!organizationId) {
      console.warn('⚠️ [ONBOARDING] No se encontró organización para el usuario')
    }

    // 5. Verificar/crear módulo de "Diagnóstico de Onboarding" en diagnostic_modules
    const moduleCode = 'ONBOARDING_INITIAL'
    const [moduleCheck] = await connection.execute(
      'SELECT id FROM diagnostic_modules WHERE module_code = ?',
      [moduleCode]
    ) as any[]

    let moduleId: string
    
    if (moduleCheck.length === 0) {
      // Crear módulo si no existe
      console.log('🔧 [ONBOARDING] Creando módulo de Diagnóstico de Onboarding...')
      
      const createModuleQuery = `
        INSERT INTO diagnostic_modules (id, module_code, title, description, order_index, is_active)
        VALUES (UUID(), ?, ?, ?, 0, 1)
      `
      const [moduleInsert] = await connection.execute(createModuleQuery, [
        moduleCode,
        'Diagnóstico Inicial de Onboarding',
        'Diagnóstico empresarial inicial completado durante el proceso de registro'
      ]) as any[]
      
      // Obtener el ID del módulo recién creado
      const [newModule] = await connection.execute(
        'SELECT id FROM diagnostic_modules WHERE module_code = ?',
        [moduleCode]
      ) as any[]
      
      moduleId = newModule[0].id
      console.log('✅ [ONBOARDING] Módulo creado con ID:', moduleId)
    } else {
      moduleId = moduleCheck[0].id
      console.log('✓ [ONBOARDING] Módulo de Diagnóstico de Onboarding ya existe')
    }

    // 6. Crear un submodule para el diagnóstico de onboarding
    const submoduleCode = 'ONBOARDING_INITIAL_SUB'
    const [submoduleCheck] = await connection.execute(
      'SELECT id FROM diagnostic_submodules WHERE submodule_code = ?',
      [submoduleCode]
    ) as any[]

    let submoduleId: string

    if (submoduleCheck.length === 0) {
      console.log('🔧 [ONBOARDING] Creando submódulo de diagnóstico...')
      
      const createSubmoduleQuery = `
        INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index)
        VALUES (UUID(), ?, ?, ?, 1)
      `
      await connection.execute(createSubmoduleQuery, [
        moduleId,
        submoduleCode,
        'Evaluación Inicial'
      ])
      
      const [newSubmodule] = await connection.execute(
        'SELECT id FROM diagnostic_submodules WHERE submodule_code = ?',
        [submoduleCode]
      ) as any[]
      
      submoduleId = newSubmodule[0].id
      console.log('✅ [ONBOARDING] Submódulo creado con ID:', submoduleId)
    } else {
      submoduleId = submoduleCheck[0].id
    }

    // 7. Crear "preguntas" del diagnóstico de onboarding y guardar respuestas
    console.log('📊 [ONBOARDING] Guardando respuestas en diagnostic_answers...')
    
    let questionOrder = 1
    for (const [questionKey, answerValue] of Object.entries(answers)) {
      // Verificar si ya existe la pregunta
      const questionCode = `ONBOARDING_${questionKey.toUpperCase()}`
      const [questionCheck] = await connection.execute(
        'SELECT id FROM diagnostic_questions WHERE question_code = ?',
        [questionCode]
      ) as any[]

      let questionId: string

      if (questionCheck.length === 0) {
        // Crear pregunta
        const createQuestionQuery = `
          INSERT INTO diagnostic_questions (
            id, submodule_id, question_code, question_text, 
            question_type, weight, order_index
          ) VALUES (UUID(), ?, ?, ?, 'text', 1.0, ?)
        `
        await connection.execute(createQuestionQuery, [
          submoduleId,
          questionCode,
          questionKey,
          questionOrder
        ])
        
        const [newQuestion] = await connection.execute(
          'SELECT id FROM diagnostic_questions WHERE question_code = ?',
          [questionCode]
        ) as any[]
        
        questionId = newQuestion[0].id
      } else {
        questionId = questionCheck[0].id
      }

      // Guardar/actualizar respuesta del usuario
      const answerText = Array.isArray(answerValue) 
        ? answerValue.join(', ') 
        : String(answerValue)
      
      const saveAnswerQuery = `
        INSERT INTO diagnostic_answers (
          id, user_id, question_id, answer_text, score, 
          organization_id, created_at, updated_at
        ) VALUES (UUID(), ?, ?, ?, 1.0, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          answer_text = VALUES(answer_text),
          updated_at = NOW()
      `
      await connection.execute(saveAnswerQuery, [
        userId,
        questionId,
        answerText,
        organizationId
      ])

      questionOrder++
    }

    console.log(`✅ [ONBOARDING] Guardadas ${Object.keys(answers).length} respuestas en diagnostic_answers`)

    // 8. Crear/actualizar progreso del módulo
    const [progressCheck] = await connection.execute(
      'SELECT id FROM diagnostic_progress WHERE user_id = ? AND module_id = ?',
      [userId, moduleId]
    ) as any[]

    const totalQuestions = Object.keys(answers).length

    if (progressCheck.length === 0) {
      // Crear progreso
      const createProgressQuery = `
        INSERT INTO diagnostic_progress (
          id, user_id, module_id, questions_answered, 
          total_questions, is_completed, completed_at
        ) VALUES (UUID(), ?, ?, ?, ?, 1, NOW())
      `
      await connection.execute(createProgressQuery, [
        userId,
        moduleId,
        totalQuestions,
        totalQuestions
      ])
      console.log('✅ [ONBOARDING] Progreso de módulo creado (completado al 100%)')
    } else {
      // Actualizar progreso
      const updateProgressQuery = `
        UPDATE diagnostic_progress 
        SET 
          questions_answered = ?,
          total_questions = ?,
          is_completed = 1,
          completed_at = NOW()
        WHERE user_id = ? AND module_id = ?
      `
      await connection.execute(updateProgressQuery, [
        totalQuestions,
        totalQuestions,
        userId,
        moduleId
      ])
      console.log('✅ [ONBOARDING] Progreso de módulo actualizado (completado)')
    }

    // 9. Actualizar el estado de onboarding del usuario
    const updateUserQuery = `
      UPDATE users 
      SET onboarding_step = 'completed',
          updated_at = NOW()
      WHERE id = ?
    `
    await connection.execute(updateUserQuery, [userId])

    await connection.commit()
    console.log('🎉 [ONBOARDING] Todos los datos guardados exitosamente!')

  } catch (error) {
    await connection.rollback()
    console.error('❌ [ONBOARDING] Error guardando datos:', error)
    throw error
  } finally {
    await connection.end()
  }
}