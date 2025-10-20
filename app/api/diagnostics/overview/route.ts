import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  console.log('� [DIAGNOSTICS API] ================ ENDPOINT LLAMADO ================')
  console.log('�🔍 [DIAGNOSTICS] Endpoint /api/diagnostics/overview llamado')
  
  try {
    // Obtener userId de la URL
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 [DIAGNOSTICS] UserId recibido:', userId)

    if (!userId) {
      console.log('❌ [DIAGNOSTICS] No se proporcionó userId')
      return NextResponse.json(
        { success: false, error: 'User ID requerido' },
        { status: 400 }
      )
    }

    console.log('🔍 [DIAGNOSTICS] Obteniendo overview para usuario:', userId)

    // Obtener el usuario específico
    const userQuery = `
      SELECT id, first_name, last_name, email, name
      FROM users 
      WHERE id = ?
      LIMIT 1
    `
    
    const userResult = await executeQuery(userQuery, [userId]) as any[]
    if (!userResult || userResult.length === 0) {
      console.log('❌ [DIAGNOSTICS] Usuario no encontrado:', userId)
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    console.log('✅ [DIAGNOSTICS] Usuario encontrado:', userResult[0].first_name, userResult[0].last_name)

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

    // Obtener diagnóstico de onboarding (verificar ambas tablas)
    let onboardingData = null
    
    // Primero verificar la nueva tabla advanced_diagnostics
    const advancedQuery = `
      SELECT 
        diagnostic_answers,
        created_at
      FROM advanced_diagnostics
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `

    try {
      const advancedResult = await executeQuery(advancedQuery, [userId]) as any[]
      console.log('🔍 [DIAGNOSTICS] Resultado advanced_diagnostics:', advancedResult?.length || 0, 'registros')
      if (advancedResult && advancedResult.length > 0) {
        onboardingData = advancedResult[0]
        console.log('✅ [DIAGNOSTICS] Diagnóstico avanzado encontrado, creado:', onboardingData.created_at)
      }
    } catch (error) {
      console.log('🔍 [DIAGNOSTICS] advanced_diagnostics table not found, checking legacy table')
    }

    // Si no se encuentra en la nueva tabla, buscar en la tabla legacy
    if (!onboardingData) {
      const onboardingQuery = `
        SELECT 
          diagnostic_answers,
          created_at
        FROM onboarding_diagnostics
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `

      try {
        const onboardingResult = await executeQuery(onboardingQuery, [userId]) as any[]
        if (onboardingResult && onboardingResult.length > 0) {
          onboardingData = onboardingResult[0]
        }
      } catch (error) {
        console.log('🔍 [DIAGNOSTICS] onboarding_diagnostics table not found')
      }
    }

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

    console.log('📋 [DIAGNOSTICS] Respuesta final - Onboarding completed:', diagnostics.onboardingDiagnostic.completed)
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
