/**
 * Hook para manejar el flujo del diagnóstico
 * 
 * Maneja toda la lógica de un módulo del diagnóstico:
 * - Carga las preguntas del módulo
 * - Rastrea el progreso del usuario
 * - Guarda respuestas conforme se van contestando
 * - Navegación entre preguntas
 * 
 * Este hook se usa en los componentes del mega-diagnostic para mostrar
 * las preguntas de cada módulo y guardar las respuestas del usuario.
 * 
 * Ejemplo de uso:
 * ```tsx
 * const { 
 *   loading, 
 *   currentQuestion, 
 *   saveAnswer, 
 *   nextQuestion 
 * } = useDiagnostic('MOD2', userId);
 * 
 * // Guardar respuesta
 * await saveAnswer(questionId, [selectedOptionId]);
 * nextQuestion();
 * ```
 * 
 * @param moduleId - Código del módulo (ej: "MOD2", "MOD5")
 * @param userId - ID del usuario que está respondiendo
 */

import { useState, useEffect } from 'react';
import { DiagnosticService, type DiagnosticQuestion, type DiagnosticProgress } from '@/services/diagnostic-service';

export function useDiagnostic(moduleId: string, userId: string) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null);

  // Cargar preguntas y progreso al montar o cambiar de módulo
  useEffect(() => {
    async function loadData() {
      if (!moduleId || !userId) return;

      try {
        setLoading(true);
        const [questionsData, progressData] = await Promise.all([
          DiagnosticService.getModuleQuestions(moduleId),
          DiagnosticService.getProgress(userId, moduleId)
        ]);

        setQuestions(questionsData);
        setProgress(progressData);
      } catch (error) {
        console.error('Error loading diagnostic data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [moduleId, userId]);

  /**
   * Guardar la respuesta de una pregunta
   * 
   * Calcula el score de la respuesta y lo guarda en la BD.
   * Actualiza el progreso local del módulo.
   * 
   * @param questionId - ID de la pregunta
   * @param selectedOptions - Array de IDs de opciones seleccionadas
   * @throws Error si falla el guardado
   */
  const saveAnswer = async (questionId: string, selectedOptions: string[]) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const score = DiagnosticService.calculateQuestionScore(question, selectedOptions);

      await DiagnosticService.saveAnswer(userId, questionId, selectedOptions, score);

      setAnswers(prev => ({
        ...prev,
        [questionId]: selectedOptions
      }));

      // Update progress
      if (progress) {
        const newAnsweredCount = progress.answered_questions + (answers[questionId] ? 0 : 1);
        setProgress({
          ...progress,
          answered_questions: newAnsweredCount,
          completion_percentage: (newAnsweredCount / progress.total_questions) * 100
        });
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      throw error;
    }
  };

  /**
   * Avanzar a la siguiente pregunta
   */
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  /**
   * Retroceder a la pregunta anterior
   */
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  /**
   * Ir a una pregunta específica por índice
   * 
   * @param index - Índice de la pregunta (0-based)
   */
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return {
    loading,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    progress,
    saveAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    isFirstQuestion,
    isLastQuestion,
  };
}