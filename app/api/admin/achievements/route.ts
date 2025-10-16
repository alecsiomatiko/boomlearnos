import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// This route uses server-side auth from lib/server/auth and org-utils

// GET: Listar todos los logros de la organización
export async function GET(request: NextRequest) {
  // Require an authenticated admin
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;

  // Get organization from server-side user session
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });

  const achievements = await executeQuery('SELECT * FROM achievements WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]);
  return NextResponse.json({ success: true, data: Array.isArray(achievements) ? achievements : [] });
}


// POST: Crear nuevo logro
export async function POST(request: NextRequest) {
  // Require authenticated admin
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;

  // Parse body once
  const body = await request.json();
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });

  const { id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock } = body;
  const result: any = await executeQuery(
    `INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, name, description, category, points, rarity, max_progress, icon, active, trigger_type || 'manual', trigger_value || 0, auto_unlock || false]
  );
  const insertId = !Array.isArray(result) && result.insertId ? result.insertId : null;
  return NextResponse.json({ success: true, id: insertId });
}