import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/server/mysql'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      position, 
      password, 
      organizationId, 
      departmentId,
      invitationId 
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !position || !password || !organizationId || !departmentId || !invitationId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Verify invitation is still valid
    const invitationCheck = await executeQuery(
      'SELECT * FROM organization_invitations WHERE id = ? AND email = ? AND used = FALSE AND expires_at > NOW()',
      [invitationId, email]
    ) as any[]

    if (invitationCheck.length === 0) {
      return NextResponse.json({ error: 'Invitación no válida o expirada' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await executeQuery('SELECT id FROM users WHERE email = ?', [email]) as any[]

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with organization and department assignment
    await executeQuery(
      `INSERT INTO users (name, email, phone, role, organization_id, department_id, password, invitation_id, created_at)
       VALUES (?, ?, ?, 'user', ?, ?, ?, ?, NOW())`,
      [firstName + ' ' + lastName, email, phone, organizationId, departmentId, hashedPassword, invitationId]
    )

    // Mark invitation as used
    await executeQuery(
      `UPDATE organization_invitations SET used = TRUE, used_at = NOW(), used_by = (SELECT id FROM users WHERE email = ? LIMIT 1) WHERE id = ?`,
      [email, invitationId]
    )

    // Initialize user with default gems and level
    await executeQuery(
      `UPDATE users SET gems = 0, level = 'Rookie', points = 0, tasks_completed = 0, current_streak = 0 WHERE email = ?`,
      [email]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente' 
    })

  } catch (error) {
    console.error('Error in invitation registration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}