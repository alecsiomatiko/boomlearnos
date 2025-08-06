import { useState, useEffect } from 'react';
import { DiagnosticService, type DiagnosticQuestion, type DiagnosticProgress } from '@/services/diagnostic-service';

export function useDiagnostic(moduleId: string, userId: string) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null);

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

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

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