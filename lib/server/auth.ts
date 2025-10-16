import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/server/mysql';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || '';

export interface CurrentUser {
  id: string;
  email?: string;
  role?: string;
  organization?: { id: string } | null;
  [k: string]: any;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') || '';
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  // Try cookie fallback
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )(?:token|auth_token)=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    if (!JWT_SECRET) {
      console.warn('JWT secret not configured; authentication disabled');
      return null;
    }
    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload?.sub || payload?.id;
    if (!userId) return null;
    const users = await executeQuery('SELECT id, email, role, first_name, last_name, organization_id FROM users WHERE id = ? LIMIT 1', [userId]) as any[];
    if (!users || users.length === 0) return null;
    const user = users[0];

    // Get organization from user's organization_id field
    if (user.organization_id) {
      user.organization = { id: user.organization_id };
    } else {
      user.organization = null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.role || 'user',
      organization: user.organization
    };
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}

export async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!user.role || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden: admin required' }, { status: 403 });
  return true;
}
