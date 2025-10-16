import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';
import { getCurrentUser } from '@/lib/server/auth';
import { getOrgIdForRequest } from '@/lib/server/org-utils';

// GET /api/badges?userId=... - Listar logros disponibles y desbloqueados para el usuario
export async function GET(request: NextRequest) {
  try {
    // ✅ AUTENTICACIÓN Y FILTRADO POR ORGANIZACIÓN
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const organizationId = await getOrgIdForRequest(request, { allowHeaderFallback: false });
    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;
    
    // Todos los logros activos - FILTRA POR organization_id
    const badges = await executeQuery('SELECT * FROM badges WHERE is_active = TRUE AND organization_id = ? ORDER BY created_at ASC', [organizationId]) as any[];
    // Logros desbloqueados por el usuario
    const userBadges = await executeQuery('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]) as any[];
    const unlocked = new Set(userBadges.map((b: any) => b.badge_id));
    // Marcar cuáles están desbloqueados
    const result = badges.map((badge: any) => ({ ...badge, unlocked: unlocked.has(badge.id) }));
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch badges' }, { status: 500 });
  }
}
