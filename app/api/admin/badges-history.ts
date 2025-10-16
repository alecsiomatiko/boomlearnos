import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// GET /api/admin/badges-history?badgeId=...&userId=...
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck !== true) return adminCheck;
  const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
  if (!organizationId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('badgeId');
    const userId = searchParams.get('userId');
  let query = 'SELECT ub.*, u.name as user_name, b.name as badge_name FROM user_badges ub JOIN users u ON ub.user_id = u.id JOIN badges b ON ub.badge_id = b.id WHERE b.organization_id = ?';
  const params: any[] = [organizationId];
  if (badgeId) { query += ' AND ub.badge_id = ?'; params.push(badgeId); }
  if (userId) { query += ' AND ub.user_id = ?'; params.push(userId); }
    query += ' ORDER BY ub.unlocked_at DESC';
    const rows = await executeQuery(query, params);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch badge history' }, { status: 500 });
  }
}
