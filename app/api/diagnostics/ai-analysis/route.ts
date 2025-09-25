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

    // Obtener datos del onboarding
    const onboardingQuery = `
      SELECT diagnostic_answers, created_at
      FROM onboarding_diagnostics
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `

    const onboardingResult = await executeQuery(onboardingQuery, [userId]) as any[]
    
    if (!onboardingResult || onboardingResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron datos de onboarding para analizar' },
        { status: 404 }
      )
    }

    const onboardingData = JSON.parse(onboardingResult[0].diagnostic_answers || '{}')
    console.log('✅ [AI-ANALYSIS] Datos de onboarding obtenidos')

    // Generar análisis basado en los datos del onboarding
    const analysis = generateAnalysisFromOnboarding(onboardingData, userName)

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

function generateAnalysisFromOnboarding(data: any, userName: string) {
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

  if (data.teamSize) {
    const size = data.teamSize
    if (size === '1-5') {
      recommendations.push({
        priority: 'high' as const,
        title: 'Validación de Mercado',
        description: 'Como startup, enfócate en definir claramente tu propuesta de valor y validar el mercado.',
        action: 'Crear Plan de Validación',
        route: '/dashboard/estrategia'
      })
      strengths.push('Agilidad y capacidad de pivotear rápidamente')
    } else if (size === '6-20') {
      recommendations.push({
        priority: 'medium' as const,
        title: 'Estructuración de Procesos',
        description: 'Es momento de estructurar procesos y crear una cultura organizacional sólida.',
        action: 'Definir Procesos',
        route: '/dashboard/procesos'
      })
      strengths.push('Equipo compacto con comunicación directa')
    } else {
      recommendations.push({
        priority: 'high' as const,
        title: 'Sistemas de Gestión',
        description: 'Implementa sistemas de gestión más robustos y delega responsabilidades.',
        action: 'Mejorar Gestión',
        route: '/dashboard/gestion'
      })
      strengths.push('Capacidad de abordar proyectos de mayor escala')
    }
  }

  if (data.currentChallenges) {
    recommendations.push({
      priority: 'medium' as const,
      title: 'Abordar Desafíos',
      description: `Resolver los desafíos identificados: ${data.currentChallenges}`,
      action: 'Crear Plan de Acción',
      route: '/dashboard/desafios'
    })
  }

  if (data.goals) {
    recommendations.push({
      priority: 'high' as const,
      title: 'Plan de Objetivos',
      description: `Crear un plan de acción específico para: ${data.goals}`,
      action: 'Definir Plan',
      route: '/dashboard/objetivos'
    })
  }

  // Agregar insights básicos si no hay suficientes
  if (insights.length === 0) {
    insights.push(
      {
        category: 'Potencial',
        icon: 'trending-up',
        status: 'completed' as const,
        findings: ['Tu organización muestra un potencial significativo de crecimiento.']
      },
      {
        category: 'Base Sólida',
        icon: 'check-circle',
        status: 'completed' as const,
        findings: ['Las respuestas del diagnóstico indican una base sólida para el desarrollo.']
      }
    )
  }

  // Agregar recomendaciones por defecto si no hay suficientes
  if (recommendations.length === 0) {
    recommendations.push(
      {
        priority: 'high' as const,
        title: 'Plan Estratégico',
        description: 'Desarrollar un plan estratégico a 6 meses con objetivos específicos.',
        action: 'Crear Plan',
        route: '/dashboard/estrategia'
      },
      {
        priority: 'medium' as const,
        title: 'Métricas y KPIs',
        description: 'Implementar métricas clave para medir el progreso.',
        action: 'Definir Métricas',
        route: '/dashboard/metricas'
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
