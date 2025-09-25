import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const users = await executeQuery(
      `SELECT 
        id, email, name, first_name, last_name, password, role, level, total_gems,
        onboarding_step, onboarding_completed, can_access_dashboard, current_organization_id
       FROM users WHERE email = ?`,
      [email]
    ) as any[]

    if (users.length > 0) {
      const user = users[0]
      // Comparar contraseña hasheada
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Obtener información de la organización si tiene una
        let organization = null
        if (user.current_organization_id) {
          const orgData = await executeQuery(
            'SELECT id, name FROM organizations WHERE id = ?',
            [user.current_organization_id]
          ) as any[]
          
          if (orgData && orgData.length > 0) {
            organization = orgData[0]
          }
        }

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            level: user.level,
            points: user.total_gems,
            onboardingStep: user.onboarding_step,
            onboardingCompleted: user.onboarding_completed,
            canAccessDashboard: user.can_access_dashboard,
            organization: organization,
            badges: [],
          }
        })
      }
    }
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error)
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}