import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { requireAdmin } from '@/lib/server/auth';
import bcrypt from 'bcryptjs';

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      department_id, 
      organization_id,
      permissions,
      new_password 
    } = body;

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id requerido' }, { status: 400 });
    }

    // Verificar que el usuario pertenece a la organización
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND organization_id = ?',
      [params.id, organization_id]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Construir query de actualización
    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(department_id || null);
    }
    if (permissions !== undefined) {
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(permissions));
    }
    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
      // Resetear first_login cuando admin cambia password
      updateFields.push('first_login = true');
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    updateValues.push(params.id);
    updateValues.push(organization_id);

    await pool.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND organization_id = ?
    `, updateValues);

    // Obtener usuario actualizado
    const [updatedUser] = await pool.query(`
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
    `, [params.id]);

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: Array.isArray(updatedUser) ? updatedUser[0] : null
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // Verificar que el usuario pertenece a la organización y no es admin
    const [user] = await pool.query(
      'SELECT role FROM users WHERE id = ? AND organization_id = ?',
      [params.id, organizationId]
    );

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if ((user[0] as any).role === 'admin') {
      return NextResponse.json({ error: 'No se puede eliminar un administrador' }, { status: 400 });
    }

    // Eliminar usuario
    await pool.query(
      'DELETE FROM users WHERE id = ? AND organization_id = ?',
      [params.id, organizationId]
    );

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
