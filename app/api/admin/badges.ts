import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// GET: Listar todos los logros de la organización
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const badges = await executeQuery('SELECT * FROM badges WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  return NextResponse.json({ success: true, data: Array.isArray(badges) ? badges : [] });
}

// POST: Crear nuevo logro
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { name, description, icon, color, type, target_value, period, custom_condition, is_active } = body;
  const result = await executeQuery(
    `INSERT INTO badges (organization_id, name, description, icon, color, type, target_value, period, custom_condition, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [organizationId, name, description, icon, color, type, target_value, period, custom_condition, is_active]
  );
  const insertId = !Array.isArray(result) && result.insertId ? result.insertId : null;
  return NextResponse.json({ success: true, id: insertId });
}

// PUT: Editar logro
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { id, name, description, icon, color, type, target_value, period, custom_condition, is_active } = body;
  const result = await executeQuery(
    `UPDATE badges SET name=?, description=?, icon=?, color=?, type=?, target_value=?, period=?, custom_condition=?, is_active=? WHERE id=? AND organization_id=?`,
    [name, description, icon, color, type, target_value, period, custom_condition, is_active, id, organizationId]
  );
  const affectedRows = !Array.isArray(result) && result.affectedRows ? result.affectedRows : 0;
  return NextResponse.json({ success: true, affectedRows });
}

// DELETE: Eliminar logro
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const { id } = await request.json();
  const result = await executeQuery('DELETE FROM badges WHERE id=? AND organization_id=?', [id, organizationId]);
  const affectedRows = !Array.isArray(result) && result.affectedRows ? result.affectedRows : 0;
  return NextResponse.json({ success: true, affectedRows });
}
