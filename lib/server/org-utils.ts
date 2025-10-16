import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export async function getOrgIdForRequest(request: NextRequest, opts: { allowHeaderFallback?: boolean } = {}) {
  const user = await getCurrentUser(request);
  if (user && user.organization && user.organization.id) return user.organization.id;

  // If user not authenticated or has no org, allow header/query only when explicitly allowed
  if (!opts.allowHeaderFallback) return null;
  const headerOrg = request.headers.get('x-organization-id') || null;
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('organization_id');
    return headerOrg || q;
  } catch {
    return headerOrg;
  }
}

export function requireOrgId(orgId: string | null) {
  if (!orgId) return NextResponse.json({ success: false, error: 'No autorizado: falta organization_id' }, { status: 401 });
  return true;
}
