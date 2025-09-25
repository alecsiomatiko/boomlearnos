import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId es requerido'
      }, { status: 400 })
    }

    // Obtener información del usuario y su onboarding
    const user = await executeQuery(
      `SELECT 
        id, 
        email, 
        name, 
        first_name, 
        last_name,
        onboarding_step, 
        onboarding_completed, 
        can_access_dashboard,
        current_organization_id
       FROM users WHERE id = ?`,
      [userId]
    ) as any[]

    if (!user || user.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    const userData = user[0]

    // Si ya completó el onboarding, obtener información de la organización
    let organization = null
    if (userData.current_organization_id) {
      const orgData = await executeQuery(
        'SELECT id, name, mission, vision, values_json FROM organizations WHERE id = ?',
        [userData.current_organization_id]
      ) as any[]

      if (orgData && orgData.length > 0) {
        const org = orgData[0]
        organization = {
          id: org.id,
          name: org.name,
          mission: org.mission,
          vision: org.vision,
          values: org.values_json ? JSON.parse(org.values_json) : []
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        firstName: userData.first_name,
        lastName: userData.last_name,
        onboardingStep: userData.onboarding_step,
        onboardingCompleted: userData.onboarding_completed,
        canAccessDashboard: userData.can_access_dashboard
      },
      organization
    })

  } catch (error) {
    console.error('❌ [ONBOARDING STATUS] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
