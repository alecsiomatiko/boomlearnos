import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';

// POST /api/badges/claim - Intentar reclamar un logro (usualmente automático)
export async function POST(request: NextRequest) {
  try {
    const { userId, badgeId } = await request.json();
    if (!userId || !badgeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Verificar si ya lo tiene
    const existing = await executeQuery('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badgeId]);
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Already claimed' }, { status: 409 });
    }
    // Registrar el logro
    await executeQuery('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badgeId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to claim badge' }, { status: 500 });
  }
}
