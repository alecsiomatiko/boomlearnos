import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { requireAdmin } from '@/lib/server/auth';
import bcrypt from 'bcryptjs';

// GET - Listar todos los usuarios de la organización
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult !== true) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  if (!organizationId) {
    return NextResponse.json({ error: 'organization_id requerido' }, { status: 400 });
  }

  try {
    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.first_login,
        u.permissions,
        u.organization_id,
        u.department_id,
        u.created_at,
        d.name as department_name,
        d.color as department_color
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.organization_id = ? AND u.role != 'admin'
      ORDER BY u.created_at DESC
    `, [organizationId]);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST - Crear nuevo usuario (colaborador)
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult !== true) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      password, 
      department_id, 
      organization_id,
      permissions 
    } = body;

    // Validaciones
    if (!name || !email || !phone || !password || !organization_id) {
      return NextResponse.json({ 
        error: 'Campos requeridos: name, email, phone, password, organization_id' 
      }, { status: 400 });
    }

    // Verificar que el email no exista
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ 
        error: 'El email ya está registrado' 
      }, { status: 400 });
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Permisos por defecto si no se proporcionan
    const defaultPermissions = {
      tasks_view_team: false,
      tasks_assign_others: false,
      messages: true,
      achievements: true,
      checkin: false,
      team: false
    };

    const finalPermissions = permissions || defaultPermissions;

    // Insertar usuario
    const [result] = await pool.query(`
      INSERT INTO users (
        name, 
        email, 
        phone, 
        password, 
        role, 
        first_login, 
        organization_id, 
        department_id, 
        permissions
      ) VALUES (?, ?, ?, ?, 'user', true, ?, ?, ?)
    `, [
      name, 
      email, 
      phone, 
      hashedPassword, 
      organization_id, 
      department_id || null, 
      JSON.stringify(finalPermissions)
    ]);

    // Obtener usuario creado con información del departamento
    const [newUser] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.first_login,
        u.permissions,
        u.organization_id,
        u.department_id,
        u.created_at,
        d.name as department_name,
        d.color as department_color
      FROM users u
      LEFT JOIN organization_departments d ON u.department_id = d.id
      WHERE u.id = ?
    `, [(result as any).insertId]);

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: Array.isArray(newUser) ? newUser[0] : null,
      password_plain: password // Para mostrar en el modal de WhatsApp
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
