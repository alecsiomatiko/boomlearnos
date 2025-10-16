import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/server/mysql'
import { requireAdmin } from '../../../../lib/server/auth'
import { getOrgIdForRequest } from '../../../../lib/server/org-utils'

// GET /api/admin/rewards-history?rewardId=...&userId=...
export async function GET(request: Request) {
  await requireAdmin(request)
  const organizationId = await getOrgIdForRequest(request)

  const url = new URL(request.url)
  const searchParams = url.searchParams
  const userId = searchParams.get('userId')
  const rewardId = searchParams.get('rewardId')

  let query = 'SELECT ur.*, u.name as user_name, r.name as reward_name FROM user_rewards ur JOIN users u ON ur.user_id = u.id JOIN rewards r ON ur.reward_id = r.id WHERE r.organization_id = ?'
  const params: any[] = [organizationId]
  if (rewardId) { query += ' AND ur.reward_id = ?'; params.push(rewardId) }
  if (userId) { query += ' AND ur.user_id = ?'; params.push(userId) }

  const rows = await executeQuery({ query, values: params })
  return NextResponse.json({ data: rows })
}
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';

// GET /api/admin/rewards-history?rewardId=...&userId=...
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const organizationId = body.organization_id;
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }
    let query = 'SELECT ur.*, u.name as user_name, r.title as reward_title FROM user_rewards ur JOIN users u ON ur.user_id = u.id JOIN rewards r ON ur.reward_id = r.id WHERE r.organization_id = ?';
    const params: any[] = [organizationId];
    if (body.rewardId) { query += ' AND ur.reward_id = ?'; params.push(body.rewardId); }
    if (body.userId) { query += ' AND ur.user_id = ?'; params.push(body.userId); }
    query += ' ORDER BY ur.claimed_at DESC';
    const rows = await executeQuery(query, params);
    return NextResponse.json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reward history' }, { status: 500 });
  }
}
