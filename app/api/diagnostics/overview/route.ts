import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    // Obtener el usuario actual
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
    console.log('🔍 [DIAGNOSTICS] Obteniendo overview para usuario:', userId)

    // Obtener datos de la organización usando owner_id
    const orgQuery = `
      SELECT 
        org.name as company_name,
        org.business_type,
        org.size as company_size,
        org.mission,
        org.vision,
        org.values_json as \`values\`
      FROM organizations org
      WHERE org.owner_id = ?
    `

    const orgResult = await executeQuery(orgQuery, [userId]) as any[]
    const organization = orgResult && orgResult.length > 0 ? orgResult[0] : null

    // Obtener diagnóstico de onboarding
    const onboardingQuery = `
      SELECT 
        diagnostic_answers,
        created_at
      FROM onboarding_diagnostics
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `

    const onboardingResult = await executeQuery(onboardingQuery, [userId]) as any[]
    const onboardingData = onboardingResult && onboardingResult.length > 0 ? onboardingResult[0] : null

    // Simular datos del mega diagnóstico (por ahora)
    const megaData: any[] = []

    // Procesar datos del mega diagnóstico
    const completedModules = megaData
      .filter(session => session.completed_at)
      .map(session => session.module_id)

    const lastSession = megaData.length > 0 ? megaData[0].created_at : null
    const averageProgress = megaData.length > 0 
      ? megaData.reduce((sum, session) => sum + (session.progress_percentage || 0), 0) / megaData.length
      : 0

    const diagnostics = {
      onboardingDiagnostic: {
        completed: !!onboardingData,
        completedAt: onboardingData?.created_at || null,
        answers: onboardingData ? JSON.parse(onboardingData.diagnostic_answers || '{}') : {}
      },
      organization: {
        companyName: organization?.company_name || '',
        businessType: organization?.business_type || '',
        companySize: organization?.company_size || '',
        mission: organization?.mission || null,
        vision: organization?.vision || null,
        values: organization?.values || null
      },
      megaDiagnostic: {
        completed: megaData.length > 0,
        lastSession,
        progress: Math.round(averageProgress),
        completedModules: [...new Set(completedModules)]
      }
    }

    console.log('✅ [DIAGNOSTICS] Overview obtenido exitosamente')

    return NextResponse.json({
      success: true,
      diagnostics
    })

  } catch (error) {
    console.error('❌ [DIAGNOSTICS] Error obteniendo overview:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
