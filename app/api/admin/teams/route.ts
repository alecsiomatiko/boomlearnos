import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// GET: Listar equipos de la organización
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const teams = await executeQuery('SELECT id, name, description, created_at FROM teams WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  return NextResponse.json({ success: true, data: Array.isArray(teams) ? teams : [] });
}

// POST: Crear equipo en la organización
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { name, description } = body;
  if (!name) {
    return NextResponse.json({ success: false, error: 'Falta el nombre del equipo' }, { status: 400 });
  }
  const result = await executeQuery(
    'INSERT INTO teams (name, description, organization_id, created_at) VALUES (?, ?, ?, NOW())',
    [name, description || '', organizationId]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
