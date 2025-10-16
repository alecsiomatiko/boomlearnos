import { useAuth } from "@/contexts/auth-context";

/**
 * Helper para peticiones multi-tenant: agrega organization_id automáticamente al body.
 * Uso: await orgApi('/api/admin/rewards', { method: 'POST', body: { ... } })
 */
export function useOrgApi() {
  const { user } = useAuth();

  // Try several common places where organization id might be stored on the user object
  function resolveOrgId(): string | null {
    const candidates = [
      // nested organization object
      (user as any)?.organization?.id,
      // snake_case / camelCase variants used in different parts of the app
      (user as any)?.organization_id,
      (user as any)?.organizationId,
      (user as any)?.current_organization_id,
      (user as any)?.currentOrganizationId,
    ];

    for (const c of candidates) {
      if (c) return String(c);
    }

    // Fallback: try reading the saved auth user from localStorage (client-only)
    try {
      const saved = localStorage.getItem('auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const fallback = parsed?.organization?.id || parsed?.organization_id || parsed?.current_organization_id || parsed?.currentOrganizationId;
        if (fallback) return String(fallback);
      }
    } catch (e) {
      // ignore JSON parse errors
    }

    return null;
  }

  async function resolveOrgIdAsync(): Promise<string | null> {
    // First try synchronous resolver
    const sync = resolveOrgId()
    if (sync) return sync

    // Try fetching user profile to obtain organization if user id exists
    try {
      const userId = (user as any)?.id
      if (userId) {
        const resp = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`)
        if (resp.ok) {
          const json = await resp.json()
          const orgId = json?.profile?.organization?.id || json?.profile?.organization?.org_id || null
          if (orgId) {
            // persist to localStorage for future sync resolver
            try {
              const saved = localStorage.getItem('auth_user')
              if (saved) {
                const parsed = JSON.parse(saved)
                parsed.organization = parsed.organization || {}
                parsed.organization.id = orgId
                localStorage.setItem('auth_user', JSON.stringify(parsed))
              }
            } catch (e) {
              // ignore
            }
            return String(orgId)
          }
        }
      }
    } catch (e) {
      console.warn('[useOrgApi] Could not resolve orgId via profile API', e)
    }

    return null
  }

  async function orgApi(
    url: string,
    options: Omit<RequestInit, 'body'> & { body?: Record<string, any> }
  ) {
    // Try sync then async resolution
    let orgId = resolveOrgId();
    if (!orgId) {
      orgId = await resolveOrgIdAsync()
    }
    if (!orgId) {
      const msg = 'No organization_id in user context or localStorage. Ensure user has organization set.';
      console.error('[useOrgApi]', msg, { user });
      throw new Error(msg);
    }

    const method = options.method?.toUpperCase() || 'GET';
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    
    // For GET/HEAD: add organization_id as query param, no body
    if (method === 'GET' || method === 'HEAD') {
      const separator = url.includes('?') ? '&' : '?';
      const urlWithOrg = `${url}${separator}organization_id=${encodeURIComponent(orgId)}`;
      const { body, ...restOptions } = options; // Remove body from options
      const response = await fetch(urlWithOrg, {
        ...restOptions,
        headers,
        method,
      });
      return response;
    }
    
    // For POST/PUT/DELETE: add organization_id to body
    const bodyObj = options.body ? { ...options.body, organization_id: orgId } : { organization_id: orgId };
    const response = await fetch(url, {
      ...options,
      headers,
      method,
      body: JSON.stringify(bodyObj),
    });
    return response;
  }

  return orgApi;
}
