import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    
    const { id } = params;
    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado: falta organization_id' 
      }, { status: 401 });
    }

    const body = await request.json();
    const fields: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      fields.push('title = ?');
      values.push(body.title);
    }
    if (body.description !== undefined) {
      fields.push('description = ?');
      values.push(body.description);
    }
    if (body.cost !== undefined) {
      fields.push('cost = ?');
      values.push(body.cost);
    }
    if (body.category !== undefined) {
      fields.push('category = ?');
      values.push(body.category);
    }
    if (body.rarity !== undefined) {
      fields.push('rarity = ?');
      values.push(body.rarity);
    }
    if (body.icon !== undefined) {
      fields.push('icon = ?');
      values.push(body.icon);
    }
    if (body.stock_limit !== undefined) {
      fields.push('stock_limit = ?');
      values.push(body.stock_limit !== null ? body.stock_limit : -1);
    }
    if (body.is_available !== undefined) {
      fields.push('is_available = ?');
      values.push(body.is_available ? 1 : 0);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    fields.push('updated_at = NOW()');
    
    const query = `UPDATE rewards SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`;
    values.push(id, organizationId);
    
    await executeQuery(query, values);

    return NextResponse.json({
      success: true,
      message: 'Recompensa actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar recompensa' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    
    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado: falta organization_id' 
      }, { status: 401 });
    }

    // Verificar si la recompensa existe
    const existing: any = await executeQuery(
      'SELECT id FROM rewards WHERE id = ? AND organization_id = ?', 
      [id, organizationId]
    );
    
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recompensa no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar registros relacionados primero (user_rewards)
    await executeQuery(
      'DELETE FROM user_rewards WHERE reward_id = ? AND organization_id = ?', 
      [id, organizationId]
    );
    
    // Eliminar la recompensa
    await executeQuery(
      'DELETE FROM rewards WHERE id = ? AND organization_id = ?', 
      [id, organizationId]
    );

    return NextResponse.json({
      success: true,
      message: 'Recompensa eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting reward:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar recompensa' },
      { status: 500 }
    );
  }
}