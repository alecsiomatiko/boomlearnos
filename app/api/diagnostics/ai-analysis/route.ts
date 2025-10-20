import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [AI-ANALYSIS] Iniciando análisis IA...')

    // Obtener el usuario más reciente
    const userQuery = `
      SELECT id, first_name, last_name, email, name
      FROM users 
      ORDER BY created_at DESC
      LIMIT 1
    `
    const userResult = await executeQuery(userQuery, []) as any[]
    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    const userId = userResult[0].id
    const userName = userResult[0].name || `${userResult[0].first_name || ''} ${userResult[0].last_name || ''}`.trim()
    console.log('🔍 [AI-ANALYSIS] Analizando para usuario:', userName)

    // Llamar al endpoint de plan estratégico IA
    let strategicPlan = null
    try {
      // Construir URL absoluta para entorno server-side
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const url = baseUrl.startsWith('http') ? `${baseUrl}/api/dashboard/generate-strategic-plan` : `https://${baseUrl}/api/dashboard/generate-strategic-plan`;
      const planRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const planData = await planRes.json()
      if (planData.success && planData.plan) {
        strategicPlan = planData.plan
      }
    } catch (e) {
      console.warn('[AI-ANALYSIS] No se pudo obtener plan estratégico IA:', e)
    }

    // Obtener datos del onboarding (verificar ambas tablas)
    let onboardingResult = null
    
    // Primero buscar en advanced_diagnostics
    try {
      const advancedQuery = `
        SELECT diagnostic_answers, created_at
        FROM advanced_diagnostics
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `
      onboardingResult = await executeQuery(advancedQuery, [userId]) as any[]
    } catch (error) {
      console.log('🔍 [AI-ANALYSIS] advanced_diagnostics table not found, trying legacy table')
    }

    // Si no se encuentra, buscar en la tabla legacy
    if (!onboardingResult || onboardingResult.length === 0) {
      try {
        const onboardingQuery = `
          SELECT diagnostic_answers, created_at
          FROM onboarding_diagnostics
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `
        onboardingResult = await executeQuery(onboardingQuery, [userId]) as any[]
      } catch (error) {
        console.log('🔍 [AI-ANALYSIS] onboarding_diagnostics table not found')
      }
    }
    
    if (!onboardingResult || onboardingResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron datos de onboarding para analizar' },
        { status: 404 }
      )
    }

    const onboardingData = JSON.parse(onboardingResult[0].diagnostic_answers || '{}')
    console.log('✅ [AI-ANALYSIS] Datos de onboarding obtenidos')

  // Generar análisis basado en los datos del onboarding y el plan estratégico IA
  const analysis = generateAnalysisFromOnboarding(onboardingData, userName, strategicPlan)

    console.log('✅ [AI-ANALYSIS] Análisis generado exitosamente')

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('❌ [AI-ANALYSIS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateAnalysisFromOnboarding(data: any, userName: string, strategicPlan?: any) {
  // Extraer información clave del onboarding
  const insights = []
  const recommendations = []
  const strengths = []
  const improvements = []

  // Analizar respuestas del onboarding
  if (data.organizationName) {
    insights.push({
      category: 'Organización',
      icon: 'building',
      status: 'completed' as const,
      findings: [`La organización "${data.organizationName}" muestra potencial de crecimiento.`]
    })
  }

  if (data.businessType) {
    insights.push({
      category: 'Tipo de Negocio',
      icon: 'target',
      status: 'completed' as const,
      findings: [`El tipo de negocio "${data.businessType}" tiene oportunidades específicas en el mercado actual.`]
    })
  }

  // Si hay plan estratégico IA, usarlo como recomendación principal
  if (typeof strategicPlan === 'object' && strategicPlan.objetivo_general) {
    recommendations.push({
      priority: 'high',
      title: 'Plan Estratégico (IA)',
      description: strategicPlan.objetivo_general,
      action: 'Ver Plan',
      route: '/dashboard/estrategia',
      plan: strategicPlan
    })
  }

  // Si no hay plan estratégico, usar recomendaciones por defecto
  if (recommendations.length === 0) {
    recommendations.push(
      {
        priority: 'high' as const,
        title: 'Plan Estratégico',
        description: 'Desarrollar un plan estratégico a 6 meses con objetivos específicos.',
        action: 'Crear Plan',
        route: '/dashboard/estrategia'
      }
    )
  }

  return {
    overview: {
      title: `Análisis IA para ${userName}`,
      summary: `Análisis integral basado en el diagnóstico organizacional completado.`,
      completedDiagnostics: {
        onboarding: true,
        megaDiagnostic: false
      },
      generatedAt: new Date().toISOString()
    },
    insights,
    recommendations,
    nextSteps: [
      'Completar el módulo "Propósito de Vida y BHAG"',
      'Definir objetivos SMART para el próximo trimestre',
      'Implementar un sistema de seguimiento de KPIs',
      'Programar revisiones mensuales del progreso'
    ]
  }
}
