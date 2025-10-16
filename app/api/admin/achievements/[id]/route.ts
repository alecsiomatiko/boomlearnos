import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    const body = await request.json();
    const { name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock } = body;
    const { id } = params;
    const orgId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!orgId) return NextResponse.json({ error: 'No autorizado: falta organization_id' }, { status: 401 });
    await executeQuery(
      `UPDATE achievements SET name=?, description=?, category=?, points=?, rarity=?, max_progress=?, icon=?, active=?, trigger_type=?, trigger_value=?, auto_unlock=?, updated_at=NOW() 
       WHERE id=? AND organization_id=?`,
      [name, description, category, points, rarity, max_progress, icon, active, trigger_type || 'manual', trigger_value || 0, auto_unlock || false, id, orgId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Error updating achievement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // Eliminar user_achievements primero (si existe la tabla)
    try {
      await executeQuery('DELETE FROM user_achievements WHERE achievement_id = ?', [id]);
    } catch (e) {
      // Si la tabla no existe, ignorar
    }
    // Eliminar el logro
    const adminCheck = await requireAdmin(request);
    if (adminCheck !== true) return adminCheck;
    const orgId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!orgId) return NextResponse.json({ error: 'No autorizado: falta organization_id' }, { status: 401 });
    await executeQuery('DELETE FROM achievements WHERE id = ? AND organization_id = ?', [id, orgId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { error: 'Error deleting achievement' },
      { status: 500 }
    );
  }
}