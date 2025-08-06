import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (users.length > 0) {
      const user = users[0]
      // Solo para pruebas, compara texto plano
      if (password === user.password) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            level: user.level,
            points: user.total_gems,
            badges: [],
          }
        })
      }
    }
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error en el servidor" }, { status: 500 })
  }
}