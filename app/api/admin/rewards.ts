import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const rewards = await executeQuery('SELECT * FROM rewards WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  return NextResponse.json({ success: true, data: Array.isArray(rewards) ? rewards : [] });
}

// POST: Crear nueva recompensa (scoped)
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { title, description, category, cost, stock_limit, max_claims_per_user, icon, is_available } = body;
  const result = await executeQuery(
    `INSERT INTO rewards (organization_id, title, description, category, cost, stock_limit, max_claims_per_user, icon, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [organizationId, title, description, category, cost, stock_limit, max_claims_per_user, icon, is_available]
  );
  const insertId = !Array.isArray(result) && (result as any).insertId ? (result as any).insertId : null;
  return NextResponse.json({ success: true, id: insertId });
}

// PUT: Editar recompensa (scoped)
export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { id, title, description, category, cost, stock_limit, max_claims_per_user, icon, is_available } = body;
  const result = await executeQuery(
    `UPDATE rewards SET title=?, description=?, category=?, cost=?, stock_limit=?, max_claims_per_user=?, icon=?, is_available=? WHERE id=? AND organization_id=?`,
    [title, description, category, cost, stock_limit, max_claims_per_user, icon, is_available, id, organizationId]
  );
  const affectedRows = !Array.isArray(result) && (result as any).affectedRows ? (result as any).affectedRows : 0;
  return NextResponse.json({ success: true, affectedRows });
}

// DELETE: Eliminar recompensa (scoped)
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const { id } = await request.json();
  const result = await executeQuery('DELETE FROM rewards WHERE id=? AND organization_id=?', [id, organizationId]);
  const affectedRows = !Array.isArray(result) && (result as any).affectedRows ? (result as any).affectedRows : 0;
  return NextResponse.json({ success: true, affectedRows });
}
