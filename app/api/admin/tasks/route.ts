import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// GET: Listar tareas de la organización
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const tasks = await executeQuery('SELECT id, title, description, status, assigned_to, due_date, created_at FROM tasks WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  return NextResponse.json({ success: true, data: Array.isArray(tasks) ? tasks : [] });
}

// POST: Crear tarea en la organización
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  const body = await request.json();
  const { title, description, assigned_to, due_date, status } = body;
  if (!title) {
    return NextResponse.json({ success: false, error: 'Falta el título de la tarea' }, { status: 400 });
  }
  const result = await executeQuery(
    'INSERT INTO tasks (title, description, assigned_to, due_date, status, organization_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [title, description || '', assigned_to || null, due_date || null, status || 'pending', organizationId]
  );
  return NextResponse.json({ success: true, id: result.insertId });
}
