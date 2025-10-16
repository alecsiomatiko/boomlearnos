'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const debugInfo = { 
      isLoading, 
      pathname, 
      hasUser: !!user,
      userEmail: user?.email,
      first_login: user?.first_login,
      first_login_type: typeof user?.first_login,
      first_login_strict_false: user?.first_login === false,
      first_login_strict_true: user?.first_login === true,
      first_login_loose_1: (user?.first_login as any) === 1
    };
    console.log('🔐 [PASSWORD GUARD] Checking...', debugInfo);

    // No hacer nada si está cargando
    if (isLoading) {
      console.log('🔐 [PASSWORD GUARD] Still loading...');
      return;
    }

    // Permitir acceso a /change-password
    if (pathname === '/change-password') {
      console.log('🔐 [PASSWORD GUARD] Already on change-password page');
      return;
    }

    // Si el usuario tiene first_login = true, redirigir a cambio de contraseña
    const shouldRedirect = user && (user.first_login === true || (user.first_login as any) === 1);
    console.log('🔐 [PASSWORD GUARD] Should redirect?', shouldRedirect);
    
    if (shouldRedirect) {
      console.log('🔐 [PASSWORD GUARD] YES - Redirecting to change-password...');
      router.push('/change-password');
    } else {
      console.log('🔐 [PASSWORD GUARD] NO - Staying on current page');
    }
  }, [user, isLoading, pathname, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando...</p>
        </div>
      </div>
    );
  }

  // Si está en change-password o no requiere cambio, mostrar contenido
  if (pathname === '/change-password' || (!user?.first_login && (user?.first_login as any) !== 1)) {
    return <>{children}</>;
  }

  // Si requiere cambio pero no está en la página correcta, mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
