import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Update user to admin
    const result: any = await executeQuery(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', email]
    )

    // Get updated user
    const users: any = await executeQuery(
      'SELECT id, email, role, first_name, last_name FROM users WHERE email = ?',
      [email]
    )

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
      user: users[0]
    })

  } catch (error: any) {
    console.error('❌ Error actualizando rol:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
