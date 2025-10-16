import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado' 
      }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Campos requeridos: currentPassword, newPassword'
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      }, { status: 400 });
    }

    // Validaciones de seguridad
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'
      }, { status: 400 });
    }

    // Obtener usuario actual con password
    const [currentUser] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [user.id]
    );

    if (!Array.isArray(currentUser) || currentUser.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      (currentUser[0] as any).password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      }, { status: 400 });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y marcar first_login como false
    await pool.query(
      'UPDATE users SET password = ?, first_login = false WHERE id = ?',
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al cambiar contraseña'
    }, { status: 500 });
  }
}
