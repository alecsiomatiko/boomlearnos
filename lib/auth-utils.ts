/**
 * Helper para hacer fetch con autenticación JWT automática
 */

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch wrapper que incluye automáticamente el token JWT y organization_id
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const authUserStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  
  let organizationId = null;
  if (authUserStr) {
    try {
      const authUser = JSON.parse(authUserStr);
      organizationId = authUser.organization?.id || authUser.organizationId;
      
      console.log('🔑 [authFetch] Auth user data:', {
        email: authUser.email,
        hasOrganization: !!authUser.organization,
        organizationId: authUser.organization?.id,
        directOrgId: authUser.organizationId,
        finalOrgId: organizationId
      });
    } catch (e) {
      console.error('❌ [authFetch] Error parsing auth_user:', e);
    }
  } else {
    console.warn('⚠️ [authFetch] No auth_user in localStorage');
  }
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (organizationId) {
    headers.set('x-organization-id', organizationId);
    console.log('✅ [authFetch] Setting x-organization-id header:', organizationId);
  } else {
    console.warn('⚠️ [authFetch] No organizationId found to set header');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
