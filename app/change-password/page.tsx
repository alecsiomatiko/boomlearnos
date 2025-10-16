'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Key, Eye, EyeOff, CheckCircle, XCircle, Lock, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validaciones en tiempo real
  const passwordRequirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword === confirmPassword && newPassword.length > 0
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  // Redirigir si el usuario no requiere cambio de contraseña
  useEffect(() => {
    if (user && !user.first_login) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Por favor cumple con todos los requisitos de la contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el usuario en localStorage
        if (user) {
          const updatedUser = { ...user, first_login: false };
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }

        // Mostrar mensaje de éxito y redirigir
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !user.first_login) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white text-center">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
              <Lock className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Cambio de Contraseña Obligatorio</h1>
            <p className="text-purple-100">
              Por seguridad, debes cambiar tu contraseña temporal en el primer inicio de sesión
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Alert informativo */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">¡Bienvenido a BoomlearnOS!</p>
                <p>Tu administrador te ha proporcionado una contraseña temporal. Por favor, cámbiala ahora por una contraseña segura que solo tú conozcas.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contraseña actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Contraseña temporal que recibiste"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Tu nueva contraseña segura"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Escribe nuevamente tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Requisitos de contraseña */}
              {newPassword.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Requisitos de contraseña:
                  </p>
                  
                  <RequirementItem
                    met={passwordRequirements.length}
                    text="Al menos 8 caracteres"
                  />
                  <RequirementItem
                    met={passwordRequirements.uppercase}
                    text="Al menos 1 letra mayúscula (A-Z)"
                  />
                  <RequirementItem
                    met={passwordRequirements.lowercase}
                    text="Al menos 1 letra minúscula (a-z)"
                  />
                  <RequirementItem
                    met={passwordRequirements.number}
                    text="Al menos 1 número (0-9)"
                  />
                  <RequirementItem
                    met={passwordRequirements.special}
                    text="Al menos 1 carácter especial (!@#$%^&*...)"
                  />
                  {confirmPassword.length > 0 && (
                    <RequirementItem
                      met={passwordRequirements.match}
                      text="Las contraseñas coinciden"
                    />
                  )}
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={!allRequirementsMet || isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all shadow-lg
                  ${allRequirementsMet && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cambiando contraseña...
                  </div>
                ) : (
                  'Cambiar Contraseña y Continuar'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-white text-sm">
            ¿Necesitas ayuda? Contacta a tu administrador
          </p>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-sm ${met ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );
}
