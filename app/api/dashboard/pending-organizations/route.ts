import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PENDING-ORG] Obteniendo organizaciones pendientes - iniciando...')

    // Buscar organizaciones pendientes del usuario más reciente completado
    const organizations = await executeQuery(`
      SELECT 
        org.id,
        org.name,
        org.business_type,
        org.description,
        org.target_audience,
        org.unique_value,
        org.current_goals,
        org.main_challenges,
        org.identity_status,
        org.ai_generation_failed,
        org.ai_error_message,
        org.created_at
      FROM organizations org
      JOIN users u ON org.owner_id = u.id
      WHERE u.onboarding_step = 'completed' 
        AND org.identity_status = 'pending'
      ORDER BY u.created_at DESC, org.created_at DESC
      LIMIT 5
    `) as any[]

    console.log('🔍 [PENDING-ORG] Organizaciones encontradas:', organizations.length)

    return NextResponse.json({
      success: true,
      pendingOrganizations: organizations
    })

  } catch (error) {
    console.error('❌ [PENDING-ORG] Error obteniendo organizaciones pendientes:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
