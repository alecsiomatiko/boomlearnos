/**
 * Hook para análisis con IA de módulos del diagnóstico
 * 
 * Permite generar y obtener análisis generados por GPT-4 para módulos
 * específicos del diagnóstico. El análisis incluye:
 * - Puntuación del módulo (0-100)
 * - Fortalezas identificadas
 * - Debilidades a mejorar
 * - Recomendaciones personalizadas
 * - Siguientes pasos sugeridos
 * 
 * El análisis se genera basándose en las respuestas que el usuario
 * dio en ese módulo específico.
 * 
 * Ejemplo de uso:
 * ```tsx
 * const { analyzeModule, loading } = useModuleAIAnalysis();
 * 
 * const analysis = await analyzeModule(userId, 'MOD2');
 * if (analysis) {
 *   console.log('Score:', analysis.analysis.score);
 *   console.log('Recomendaciones:', analysis.analysis.recommendations);
 * }
 * ```
 */

import { useState } from 'react';

interface ModuleAnalysis {
  moduleCode: string;
  analysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    insights: string;
    nextSteps: string[];
    priority: 'high' | 'medium' | 'low';
  };
  generatedAt: string;
}

export function useModuleAIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generar análisis con IA para un módulo específico
   * 
   * Envía las respuestas del módulo a GPT-4 para que las analice
   * y genere recomendaciones. El análisis se guarda en la BD para
   * consultas futuras.
   * 
   * @param userId - ID del usuario
   * @param moduleCode - Código del módulo (ej: "MOD2")
   * @returns Objeto con el análisis o null si falla
   */
  const analyzeModule = async (
    userId: string, 
    moduleCode: string
  ): Promise<ModuleAnalysis | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[HOOK] Analizando módulo ${moduleCode} para usuario ${userId}`);

      const response = await fetch('/api/diagnostic/module-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          moduleCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar análisis');
      }

      if (data.success) {
        console.log(`[HOOK] Análisis generado para ${moduleCode}`);
        return data.analysis;
      } else {
        throw new Error(data.error || 'Error en la respuesta del servidor');
      }

    } catch (err: any) {
      console.error(`[HOOK] Error analizando módulo ${moduleCode}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener análisis guardado de un módulo
   * 
   * Busca si ya existe un análisis previo para este módulo.
   * Útil para mostrar análisis sin tener que regenerarlo.
   * 
   * @param userId - ID del usuario
   * @param moduleCode - Código del módulo
   * @returns Análisis guardado o null si no existe
   */
  const getModuleAnalysis = async (
    userId: string, 
    moduleCode: string
  ): Promise<ModuleAnalysis | null> => {
    try {
      console.log(`[HOOK] Obteniendo análisis guardado de ${moduleCode}`);

      const response = await fetch(
        `/api/diagnostic/module-ai-analysis?userId=${userId}&moduleCode=${moduleCode}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`[HOOK] Análisis encontrado para ${moduleCode}`);
        return data.analysis;
      }

      return null;
    } catch (err: any) {
      console.error(`[HOOK] Error obteniendo análisis de ${moduleCode}:`, err);
      return null;
    }
  };

  /**
   * Verificar si un módulo tiene análisis guardado
   * 
   * Check rápido para saber si hay que generar análisis
   * o si ya existe uno previo.
   * 
   * @param userId - ID del usuario
   * @param moduleCode - Código del módulo
   * @returns true si existe análisis, false si no
   */
  const hasModuleAnalysis = async (
    userId: string, 
    moduleCode: string
  ): Promise<boolean> => {
    const analysis = await getModuleAnalysis(userId, moduleCode);
    return analysis !== null;
  };

  return {
    analyzeModule,
    getModuleAnalysis,
    hasModuleAnalysis,
    loading,
    error
  };
}