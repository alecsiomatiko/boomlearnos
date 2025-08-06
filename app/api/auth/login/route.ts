import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (users.length > 0) {
      const user = users[0]
      // Comparar contraseña hasheada
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
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