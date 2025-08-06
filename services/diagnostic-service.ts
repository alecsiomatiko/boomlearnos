import type { User } from '@/types';

export interface DiagnosticModule {
  id: string;
  module_code: string;
  title: string;
  description: string;
  icon: string;
  total_questions: number;
  answered_questions: number;
}

export interface DiagnosticQuestion {
  id: string;
  question_code: string;
  question_text: string;
  question_type: 'single' | 'multiple';
  weight: number;
  options: DiagnosticOption[];
  feedback_text?: string;
}

export interface DiagnosticOption {
  id: string;
  option_code: string;
  option_text: string;
  weight: number;
  emoji?: string;
}

export interface DiagnosticProgress {
  answered_questions: number;
  total_questions: number;
  completion_percentage: number;
}

export interface DiagnosticResult {
  total_score: number;
  answered_questions: number;
  score_breakdown: {
    by_category: Array<{
      category: string;
      score: number;
    }>;
  };
}

export class DiagnosticService {
  static async getModules(): Promise<DiagnosticModule[]> {
    const response = await fetch('/api/diagnostic/modules');
    if (!response.ok) {
      throw new Error('Error fetching diagnostic modules');
    }
    return response.json();
  }

  static async getModuleQuestions(moduleId: string): Promise<DiagnosticQuestion[]> {
    const response = await fetch(`/api/diagnostic/questions?moduleId=${moduleId}`);
    if (!response.ok) {
      throw new Error('Error fetching module questions');
    }
    return response.json();
  }

  static async saveAnswer(
    userId: string,
    questionId: string,
    answers: string[],
    score: number
  ): Promise<void> {
    const response = await fetch('/api/diagnostic/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        questionId,
        answers,
        score,
      }),
    });

    if (!response.ok) {
      throw new Error('Error saving answer');
    }
  }

  static async getProgress(
    userId: string,
    moduleId: string
  ): Promise<DiagnosticProgress> {
    const response = await fetch(
      `/api/diagnostic/progress?userId=${userId}&moduleId=${moduleId}`
    );
    if (!response.ok) {
      throw new Error('Error fetching progress');
    }
    return response.json();
  }

  static async getResults(
    userId: string,
    moduleId: string
  ): Promise<DiagnosticResult> {
    const response = await fetch(
      `/api/diagnostic/results?userId=${userId}&moduleId=${moduleId}`
    );
    if (!response.ok) {
      throw new Error('Error fetching results');
    }
    return response.json();
  }

  static calculateQuestionScore(
    question: DiagnosticQuestion,
    selectedOptions: string[]
  ): number {
    if (question.question_type === 'single') {
      const option = question.options.find(o => o.option_code === selectedOptions[0]);
      return option ? option.weight * question.weight : 0;
    } else {
      return selectedOptions.reduce((total, optionCode) => {
        const option = question.options.find(o => o.option_code === optionCode);
        return total + (option ? option.weight : 0);
      }, 0) * question.weight;
    }
  }
}