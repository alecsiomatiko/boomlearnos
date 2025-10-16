import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const users = await executeQuery(
      `SELECT 
        id, email, name, password, role, level, total_gems, phone, first_login, permissions,
        onboarding_step, onboarding_completed, can_access_dashboard, organization_id
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
        const orgId = user.organization_id;
        if (orgId) {
          const orgData = await executeQuery(
            'SELECT id, name FROM organizations WHERE id = ?',
            [orgId]
          ) as any[]
          
          if (orgData && orgData.length > 0) {
            organization = orgData[0]
          }
        }

        // Parsear permisos
        let permissions = {};
        try {
          permissions = user.permissions ? JSON.parse(user.permissions) : {};
        } catch (e) {
          console.warn('Error parsing permissions:', e);
        }

        // ✅ GENERAR JWT TOKEN
        const token = jwt.sign(
          { 
            sub: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: orgId
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Crear respuesta con token en cookie
        const response = NextResponse.json({
          success: true,
          token, // También devolver en body para localStorage
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            level: user.level,
            points: user.total_gems,
            total_gems: user.total_gems,
            first_login: user.first_login,
            permissions: permissions,
            onboardingStep: user.onboarding_step,
            onboardingCompleted: user.onboarding_completed,
            canAccessDashboard: user.can_access_dashboard,
            organization: organization,
            organizationId: orgId,
            badges: [],
          }
        });

        // Establecer cookie HTTP-only
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: '/'
        });

        return response;
      }
    }
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error)
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}