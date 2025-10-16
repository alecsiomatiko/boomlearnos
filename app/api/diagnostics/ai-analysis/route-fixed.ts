import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 [IA-ANALYSIS] Generando análisis de diagnósticos...')
    
    // 1. Obtener usuario actual por query param (userId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })

    const [userRow] = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]) as any[]
    if (!userRow) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    const user = userRow
    console.log(`✅ [IA-ANALYSIS] Usuario encontrado: ${user.name}`)
    
    // 2. Obtener datos del diagnóstico de onboarding
    console.log('📊 [IA-ANALYSIS] Obteniendo datos de onboarding...')
    const onboardingQuery = `
      SELECT od.*, o.companyName, o.businessType, o.companySize, o.mission, o.vision, o.values
      FROM onboarding_diagnostics od
      LEFT JOIN organizations o ON od.user_id = o.created_by
      WHERE od.user_id = ?
      ORDER BY od.created_at DESC
      LIMIT 1
    `
    
    const onboardingResult = await executeQuery(onboardingQuery, [user.id]) as any[]
    
    // 3. Obtener respuestas del mega diagnóstico (usando tabla correcta)
    console.log('📊 [IA-ANALYSIS] Obteniendo datos del mega diagnóstico...')
    const megaDiagnosticQuery = `
      SELECT da.*, dq.question_text, dq.question_code, dq.question_type, dq.weight,
             ds.title as submodule_title, ds.submodule_code,
             dm.title as module_title, dm.module_code
      FROM diagnostic_answers da
      JOIN diagnostic_questions dq ON da.question_id = dq.id
      JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
      JOIN diagnostic_modules dm ON ds.module_id = dm.id
      WHERE da.user_id = ?
      ORDER BY da.created_at DESC
    `
    
    const megaDiagnosticResult = await executeQuery(megaDiagnosticQuery, [user.id]) as any[]
    
    // 4. Generar análisis con datos disponibles
    const analysis = await generateAIAnalysis({
      user,
      onboardingDiagnostic: onboardingResult[0] || null,
      megaDiagnosticAnswers: megaDiagnosticResult || []
    })
    
    console.log('✅ [IA-ANALYSIS] Análisis generado exitosamente')
    
    return NextResponse.json({
      success: true,
      analysis
    })
    
  } catch (error) {
    console.error('❌ [IA-ANALYSIS] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function generateAIAnalysis(data: {
  user: any
  onboardingDiagnostic: any
  megaDiagnosticAnswers: any[]
}) {
  const { user, onboardingDiagnostic, megaDiagnosticAnswers } = data
  
  // Parsear respuestas del onboarding si existen
  let onboardingAnswers = null
  if (onboardingDiagnostic?.diagnostic_answers) {
    try {
      onboardingAnswers = JSON.parse(onboardingDiagnostic.diagnostic_answers)
    } catch (error) {
      console.error('Error parsing onboarding answers:', error)
    }
  }

  // Construir análisis basado en datos disponibles
  const hasOnboardingData = !!onboardingAnswers
  const hasMegaDiagnosticData = megaDiagnosticAnswers.length > 0
  
  if (!hasOnboardingData && !hasMegaDiagnosticData) {
    return {
      hasData: false,
      summary: "No hay datos de diagnóstico disponibles para analizar.",
      recommendations: [
        {
          title: "Completar Diagnóstico Inicial",
          priority: "high",
          description: "Completa tu diagnóstico de onboarding para obtener insights personalizados.",
          action: "Ir al diagnóstico inicial"
        }
      ],
      insights: [],
      nextSteps: [
        "Completar el diagnóstico de onboarding",
        "Iniciar el mega diagnóstico organizacional"
      ],
      completionStatus: {
        onboarding: false,
        megaDiagnostic: false,
        overallProgress: 0
      }
    }
  }

  // Análisis con datos del onboarding
  const insights = []
  const recommendations = []
  
  if (hasOnboardingData) {
    // Analizar industria y tamaño de empresa
    if (onboardingAnswers.industry) {
      insights.push({
        category: "Perfil Empresarial",
        title: `Empresa del sector ${onboardingAnswers.industry}`,
        description: `Tu empresa opera en el sector ${onboardingAnswers.industry}, lo que presenta oportunidades específicas de crecimiento.`,
        impact: "medium"
      })
    }

    if (onboardingAnswers.company_size) {
      const sizeInsights = {
        pequena: "Las empresas pequeñas tienen mayor agilidad para implementar cambios rápidos.",
        mediana: "Las empresas medianas pueden balancear recursos con flexibilidad operacional.",
        grande: "Las empresas grandes tienen recursos pero requieren procesos más estructurados."
      }
      
      insights.push({
        category: "Tamaño Organizacional",
        title: `Empresa ${onboardingAnswers.company_size}`,
        description: sizeInsights[onboardingAnswers.company_size] || "Tamaño organizacional identificado.",
        impact: "medium"
      })
    }

    // Recomendaciones basadas en el diagnóstico inicial
    if (onboardingAnswers.main_goals) {
      recommendations.push({
        title: "Alineación de Objetivos",
        priority: "high",
        description: `Basado en tus objetivos principales, te recomendamos enfocar esfuerzos en métricas específicas de ${onboardingAnswers.main_goals}.`,
        action: "Definir KPIs específicos"
      })
    }

    if (onboardingAnswers.unique_value_proposition) {
      recommendations.push({
        title: "Fortalecimiento de Propuesta de Valor",
        priority: "medium",
        description: "Desarrollar estrategias para comunicar mejor tu propuesta de valor única al mercado.",
        action: "Crear plan de comunicación"
      })
    }
  }

  // Si hay datos del mega diagnóstico, agregar análisis más detallado
  if (hasMegaDiagnosticData) {
    const moduleProgress = {}
    megaDiagnosticAnswers.forEach(answer => {
      const module = answer.module_code
      if (!moduleProgress[module]) {
        moduleProgress[module] = {
          title: answer.module_title,
          answers: 0,
          totalScore: 0
        }
      }
      moduleProgress[module].answers++
      moduleProgress[module].totalScore += answer.calculated_score || 0
    })

    Object.entries(moduleProgress).forEach(([code, data]: [string, any]) => {
      insights.push({
        category: "Diagnóstico Avanzado",
        title: `Módulo: ${data.title}`,
        description: `Completadas ${data.answers} respuestas con puntuación promedio de ${(data.totalScore / data.answers).toFixed(1)}.`,
        impact: "high"
      })
    })
  }

  // Generar próximos pasos
  const nextSteps = []
  if (!hasMegaDiagnosticData) {
    nextSteps.push("Iniciar el mega diagnóstico organizacional")
    nextSteps.push("Completar todos los módulos del diagnóstico")
  } else {
    nextSteps.push("Revisar recomendaciones específicas por módulo")
    nextSteps.push("Implementar plan de acción basado en resultados")
  }

  if (hasOnboardingData && onboardingAnswers.customer_pain_points) {
    nextSteps.push("Desarrollar soluciones para los puntos de dolor identificados")
  }

  return {
    hasData: true,
    summary: hasOnboardingData && hasMegaDiagnosticData 
      ? "Análisis completo basado en diagnóstico inicial y mega diagnóstico organizacional."
      : hasOnboardingData 
        ? "Análisis basado en tu diagnóstico inicial. Completa el mega diagnóstico para obtener insights más profundos."
        : "Análisis basado en diagnóstico organizacional parcial.",
    insights,
    recommendations,
    nextSteps,
    completionStatus: {
      onboarding: hasOnboardingData,
      megaDiagnostic: hasMegaDiagnosticData,
      overallProgress: hasOnboardingData && hasMegaDiagnosticData ? 100 : hasOnboardingData ? 50 : 25
    }
  }
}
