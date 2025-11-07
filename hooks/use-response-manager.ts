import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

/**
 * Una respuesta a una pregunta del diagnóstico
 * @property questionId - UUID de la pregunta (ej: "084c2eba-6ff2-40b6-8076-31c527479678")
 * @property selectedOptionId - UUID de la opción seleccionada
 */
export interface QuestionResponse {
  questionId: string;
  selectedOptionId: string;
}

/**
 * Resultado cuando guardas las respuestas
 * Te dice si jaló o no, y cuántas se guardaron
 */
export interface SaveResponsesResult {
  success: boolean;
  message: string;
  stats?: {
    savedCount: number;        // Cuántas respuestas nuevas se guardaron
    updatedCount: number;      // Cuántas se actualizaron (si volviste a responder)
    totalProcessed: number;    // Total que procesó
    moduleCompletion: {        // Info del módulo completo
      answeredQuestions: number;     // Cuántas llevas respondidas
      totalQuestions: number;        // Total de preguntas del módulo
      completionPercentage: number;  // Porcentaje (0-100)
      averageScore: number;          // Promedio de tus respuestas
    };
  };
}

/**
 * Hook principal para guardar y cargar respuestas del diagnóstico
 * 
 * Uso:
 * ```tsx
 * const { saveModuleResponses, getUserResponses, isSaving } = useResponseManager();
 * 
 * // Guardar respuestas
 * await saveModuleResponses("MOD2", responses);
 * 
 * // Cargar respuestas guardadas
 * const saved = await getUserResponses("MOD2");
 * ```
 */
export function useResponseManager() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResponsesResult | null>(null);

  /**
   * Guarda las respuestas de un módulo completo
   * 
   * Recibe un array de respuestas y las manda todas juntas al backend.
   * El backend se encarga de ver cuales son nuevas y cuales ya existian
   * para actualzarlas (si volviste a responder la misma pregunta).
   * 
   * @param moduleId - Codigo del modulo tipo "MOD2", "MOD5", etc
   * @param responses - Array con { questionId, selectedOptionId } de cada respuesta
   * @returns Promesa con el resultado que incluye estadisticas del guardado
   * 
   * Ejemplo:
   * ```tsx
   * const respuestas = [
   *   { questionId: "uuid-pregunta-1", selectedOptionId: "uuid-opcion-a" },
   *   { questionId: "uuid-pregunta-2", selectedOptionId: "uuid-opcion-b" }
   * ];
   * const resultado = await saveModuleResponses("MOD2", respuestas);
   * console.log(`Se guardaron ${resultado.stats?.savedCount} respuestas`);
   * ```
   */
  const saveModuleResponses = useCallback(async (
    moduleId: string,
    responses: QuestionResponse[]
  ): Promise<SaveResponsesResult> => {
    // Checa que el usuario este logueado
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Busca el organization_id en cualquier variante (el objeto user es medio inconsistente)
    const organizationId = user?.current_organization_id || user?.organization_id || (user as any)?.organizationId || user?.organization?.id;
    
    if (!organizationId) {
      throw new Error('Usuario sin organización activa');
    }

    setIsSaving(true);
    console.log(`🔍 [RESPONSE MANAGER] Guardando ${responses.length} respuestas del módulo ${moduleId}`);
    console.log(`👤 [RESPONSE MANAGER] Usuario ID: ${user.id}`);
    console.log(`🏢 [RESPONSE MANAGER] Organización ID: ${organizationId}`);
    console.log(`📋 [RESPONSE MANAGER] Respuestas a enviar:`, responses);

    try {
      const requestBody = {
        userId: user.id,
        organizationId: organizationId,
        moduleId,
        responses
      };
      
      console.log(`📦 [RESPONSE MANAGER] Body de la request:`, requestBody);

      // Manda el POST al backend
      const response = await fetch('/api/diagnostic/save-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📡 [RESPONSE MANAGER] Respuesta HTTP status: ${response.status}`);

      // Si el backend respondio con error (400, 500, etc)
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
  }, [user?.id, user?.organization_id, user?.current_organization_id]);

  /**
   * Guarda una respuesta individual (para auto-guardado)
   * 
   * Esta funcion la usa el componente cuando seleccionas una opcion
   * para que se guarde al instante sin esperar a que termines todo el modulo.
   * 
   * NOTA: Actualmente usa number para los IDs pero deberia usar string (UUID).
   * Si te da error 400, probablemente sea por esto.
   * 
   * @param questionId - ID de la pregunta (deberia ser UUID pero aun es number)
   * @param selectedOptionId - ID de la opcion seleccionada (deberia ser UUID)
   * @returns true si se guardo bien, false si fallo
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
   * Obtiene las respuestas guardadas del usuario para la organización actual
   * 
   * Esto carga todas las respuestas que el usuario ha dado en todos los modulos
   * pero solo de la organizacion en la que esta actualmente.
   * 
   * Si el usuario cambia de organizacion, va a cargar las respuestas de esa otra
   * (porque cada organizacion tiene su propio diagnostico).
   * 
   * @returns Array de respuestas guardadas con info de la pregunta y opcion seleccionada
   */
  const getUserResponses = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Busca el organization_id en cualquier variante
    const organizationId = user?.current_organization_id || user?.organization_id || (user as any)?.organizationId || user?.organization?.id;
    
    if (!organizationId) {
      console.error('❌ [RESPONSE MANAGER] Usuario sin organización:', {
        userId: user.id,
        current_organization_id: user?.current_organization_id,
        organization_id: (user as any)?.organization_id,
        organizationId: (user as any)?.organizationId,
        organization: user?.organization
      });
      throw new Error('Usuario sin organización activa');
    }

    try {
      const response = await fetch(
        `/api/diagnostic/user-responses?userId=${user.id}&organizationId=${organizationId}`
      );
      
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
