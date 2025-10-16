
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { requireAdmin } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';


export async function POST(req: Request) {
  try {
    // ensure admin
    // adapt Request -> NextRequest usage by creating a minimal wrapper
    // but requireAdmin expects NextRequest; in app router route handlers NextRequest is provided by framework
    // We'll assume it works in runtime; for now call getOrgIdForRequest via minimal shim if possible
    const provisionalReq: any = req;
    const adminCheck = await requireAdmin(provisionalReq);
    if (adminCheck !== true) return adminCheck;

    const organizationId = await getOrgIdForRequest(provisionalReq, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ error: 'Falta organization_id' }, { status: 400 });
    }
    // Helper to detect presence of organization_id on a table
    const dbName = process.env.DB_NAME || 'u191251575_BoomlearnOS';
    async function hasColumn(tableName: string, columnName = 'organization_id') {
      const colRes = await executeQuery(
        'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [dbName, tableName, columnName]
      ) as any[];
      return (colRes[0]?.cnt || 0) > 0;
    }

    console.log('[admin/stats] dbName=', dbName, 'organizationId=', organizationId);

    // Get total users for this org (fallback to current_organization_id or global count)
    let totalUsers = 0;
    if (await hasColumn('users', 'organization_id')) {
      const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users WHERE organization_id = ?', [organizationId]) as any[];
      totalUsers = usersResult[0]?.count || 0;
    } else if (await hasColumn('users', 'current_organization_id')) {
      const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users WHERE current_organization_id = ?', [organizationId]) as any[];
      totalUsers = usersResult[0]?.count || 0;
    } else {
      const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users') as any[];
      totalUsers = usersResult[0]?.count || 0;
    }

    // Get total achievements for this org (fallback to global count)
    let totalAchievements = 0;
    if (await hasColumn('achievements', 'organization_id')) {
      const achievementsResult = await executeQuery('SELECT COUNT(*) as count FROM achievements WHERE active = true AND organization_id = ?', [organizationId]) as any[];
      totalAchievements = achievementsResult[0]?.count || 0;
    } else {
      const achievementsResult = await executeQuery('SELECT COUNT(*) as count FROM achievements WHERE active = true') as any[];
      totalAchievements = achievementsResult[0]?.count || 0;
    }

    // Get total rewards for this org
    let totalRewards = 0;
    if (await hasColumn('rewards', 'organization_id')) {
      const rewardsResult = await executeQuery('SELECT COUNT(*) as count FROM rewards WHERE is_available = true AND organization_id = ?', [organizationId]) as any[];
      totalRewards = rewardsResult[0]?.count || 0;
    } else {
      const rewardsResult = await executeQuery('SELECT COUNT(*) as count FROM rewards WHERE is_available = true') as any[];
      totalRewards = rewardsResult[0]?.count || 0;
    }

    // Get total tasks for this org
    let totalTasks = 0;
    if (await hasColumn('tasks', 'organization_id')) {
      const tasksResult = await executeQuery('SELECT COUNT(*) as count FROM tasks WHERE organization_id = ?', [organizationId]) as any[];
      totalTasks = tasksResult[0]?.count || 0;
    } else {
      const tasksResult = await executeQuery('SELECT COUNT(*) as count FROM tasks') as any[];
      totalTasks = tasksResult[0]?.count || 0;
    }

    // Get total gems in circulation for this org (users.total_gems)
    let totalGems = 0;
    if (await hasColumn('users', 'organization_id')) {
      const gemsResult = await executeQuery('SELECT SUM(total_gems) as total FROM users WHERE organization_id = ?', [organizationId]) as any[];
      totalGems = gemsResult[0]?.total || 0;
    } else if (await hasColumn('users', 'current_organization_id')) {
      const gemsResult = await executeQuery('SELECT SUM(total_gems) as total FROM users WHERE current_organization_id = ?', [organizationId]) as any[];
      totalGems = gemsResult[0]?.total || 0;
    } else {
      const gemsResult = await executeQuery('SELECT SUM(total_gems) as total FROM users') as any[];
      totalGems = gemsResult[0]?.total || 0;
    }

    // Get active users (users with tasks in last 30 days) for this org
    let activeUsers = 0;
    if (await hasColumn('tasks', 'organization_id')) {
      const activeUsersResult = await executeQuery(
        'SELECT COUNT(DISTINCT assigned_to) as count FROM tasks WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND organization_id = ?',
        [organizationId]
      ) as any[];
      activeUsers = activeUsersResult[0]?.count || 0;
    } else {
      const activeUsersResult = await executeQuery(
        'SELECT COUNT(DISTINCT assigned_to) as count FROM tasks WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      ) as any[];
      activeUsers = activeUsersResult[0]?.count || 0;
    }

    return NextResponse.json({
      totalUsers,
      totalAchievements,
      totalRewards,
      totalTasks,
      totalGems,
      activeUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}