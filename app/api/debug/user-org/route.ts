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

    // Consultar usuario con su organización
    const result = await executeQuery(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.organization_id,
        u.onboarding_step,
        u.onboarding_completed,
        org.id as org_id,
        org.name,
        org.mission,
        org.vision,
        org.values_json,
        org.identity_status,
        org.ai_generation_failed,
        org.ai_error_message
      FROM users u
      LEFT JOIN organizations org ON u.organization_id = org.id
      WHERE u.id = ?
    `, [userId]) as any[]

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    const user = result[0]

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          organization_id: user.organization_id,
          onboarding_step: user.onboarding_step,
          onboarding_completed: user.onboarding_completed
        },
        organization: user.org_id ? {
          id: user.org_id,
          name: user.name,
          mission: user.mission,
          vision: user.vision,
          values: user.values_json,
          identity_status: user.identity_status,
          ai_generation_failed: user.ai_generation_failed,
          ai_error_message: user.ai_error_message
        } : null
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}