import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

export interface QuestionResponse {
  questionId: number;
  selectedOptionId: number;
}

export interface SaveResponsesResult {
  success: boolean;
  message: string;
  stats?: {
    savedCount: number;
    updatedCount: number;
    totalProcessed: number;
    moduleCompletion: {
      answeredQuestions: number;
      totalQuestions: number;
      completionPercentage: number;
      averageScore: number;
    };
  };
}

export function useResponseManager() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResponsesResult | null>(null);

  /**
   * Guarda todas las respuestas de un módulo completado
   */
  const saveModuleResponses = useCallback(async (
    moduleId: string,
    responses: QuestionResponse[]
  ): Promise<SaveResponsesResult> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    setIsSaving(true);
    console.log(`🔍 [RESPONSE MANAGER] Guardando ${responses.length} respuestas del módulo ${moduleId}`);
    console.log(`👤 [RESPONSE MANAGER] Usuario ID: ${user.id}`);
    console.log(`📋 [RESPONSE MANAGER] Respuestas a enviar:`, responses);

    try {
      const requestBody = {
        userId: user.id,
        moduleId,
        responses
      };
      
      console.log(`📦 [RESPONSE MANAGER] Body de la request:`, requestBody);

      const response = await fetch('/api/diagnostic/save-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📡 [RESPONSE MANAGER] Respuesta HTTP status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`💥 [RESPONSE MANAGER] Error HTTP ${response.status}:`, errorData);
        throw new Error(errorData.error || 'Error al guardar respuestas');
      }

      const result: SaveResponsesResult = await response.json();
      setLastSaveResult(result);
      
      console.log('✅ [RESPONSE MANAGER] Respuestas guardadas exitosamente:', result);
      return result;

    } catch (error) {
      console.error('❌ [RESPONSE MANAGER] Error guardando respuestas:', error);
      const errorResult: SaveResponsesResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
      setLastSaveResult(errorResult);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  /**
   * Guarda una respuesta individual (para auto-guardado)
   */
  const saveSingleResponse = useCallback(async (
    questionId: number,
    selectedOptionId: number
  ): Promise<boolean> => {
    if (!user?.id) {
      console.warn('⚠️ [RESPONSE MANAGER] Usuario no autenticado para auto-guardado');
      return false;
    }

    try {
      const response = await fetch('/api/diagnostic/save-responses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          questionId,
          selectedOptionId
        }),
      });

      if (!response.ok) {
        console.error('❌ [RESPONSE MANAGER] Error en auto-guardado');
        return false;
      }

      const result = await response.json();
      console.log(`✅ [RESPONSE MANAGER] Auto-guardado: Pregunta ${questionId} -> Opción ${selectedOptionId}`);
      return result.success;

    } catch (error) {
      console.error('❌ [RESPONSE MANAGER] Error en auto-guardado:', error);
      return false;
    }
  }, [user?.id]);

  /**
   * Obtiene las respuestas guardadas del usuario
   */
  const getUserResponses = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch(`/api/diagnostic/user-responses?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener respuestas del usuario');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ [RESPONSE MANAGER] Error obteniendo respuestas:', error);
      throw error;
    }
  }, [user?.id]);

  /**
   * Verifica si un módulo está completado
   */
  const checkModuleCompletion = useCallback(async (moduleId: string) => {
    if (!user?.id) {
      return { isCompleted: false, completionPercentage: 0 };
    }

    try {
      const data = await getUserResponses();
      const moduleResponses = data.userResponses?.filter(
        (response: any) => response.moduleCode === moduleId
      ) || [];

      // Esto es una estimación básica - idealmente deberíamos tener info del total de preguntas del módulo
      const completionPercentage = moduleResponses.length > 0 ? 
        (moduleResponses.length >= 10 ? 100 : (moduleResponses.length / 10) * 100) : 0;

      return {
        isCompleted: completionPercentage >= 100,
        completionPercentage,
        answeredQuestions: moduleResponses.length
      };

    } catch (error) {
      console.error('❌ [RESPONSE MANAGER] Error verificando completitud:', error);
      return { isCompleted: false, completionPercentage: 0 };
    }
  }, [user?.id, getUserResponses]);

  return {
    // Estados
    isSaving,
    lastSaveResult,
    
    // Métodos
    saveModuleResponses,
    saveSingleResponse,
    getUserResponses,
    checkModuleCompletion,
    
    // Info del usuario
    isAuthenticated: !!user?.id,
    userId: user?.id || null
  };
}
