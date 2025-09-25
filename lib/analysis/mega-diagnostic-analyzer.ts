import { DiagnosticQuestion, DiagnosticOption } from '@/types/mega-diagnostic';

// Interfaces para el sistema de análisis
export interface ModuleResponse {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  weight: number;
  moduleCode: string;
  moduleTitle: string;
}

export interface ModuleAnalysis {
  moduleCode: string;
  moduleTitle: string;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  averageScore: number;
  maxPossibleScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  criticalIssues: string[];
  recommendations: string[];
  scoreBreakdown: {
    excellent: number; // 4 puntos
    good: number;      // 3 puntos
    fair: number;      // 2 puntos
    poor: number;      // 1 punto
  };
}

export interface ComprehensiveAnalysis {
  userId: string;
  completedAt: Date;
  overallScore: number;
  maxPossibleScore: number;
  completionPercentage: number;
  moduleAnalyses: ModuleAnalysis[];
  crossModuleInsights: {
    strongestAreas: string[];
    weakestAreas: string[];
    correlations: Array<{
      module1: string;
      module2: string;
      correlation: number;
      insight: string;
    }>;
  };
  strategicRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  aiGeneratedInsights: string;
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
    mitigation: string[];
  };
}

export interface ChatContext {
  userId: string;
  analysis: ComprehensiveAnalysis;
  conversationHistory: Array<{
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    relatedModules?: string[];
  }>;
}

// Clase principal para el análisis
export class MegaDiagnosticAnalyzer {
  
  /**
   * Analiza las respuestas de un módulo específico
   */
  static analyzeModule(
    moduleCode: string,
    moduleTitle: string,
    responses: ModuleResponse[]
  ): ModuleAnalysis {
    const moduleResponses = responses.filter(r => r.moduleCode === moduleCode);
    const totalQuestions = new Set(moduleResponses.map(r => r.questionId)).size;
    const answeredQuestions = moduleResponses.length;
    
    // Calcular puntuaciones
    const scores = moduleResponses.map(r => r.weight);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = answeredQuestions * 4; // Asumiendo escala 1-4
    const averageScore = totalScore / answeredQuestions || 0;
    
    // Breakdown de puntuaciones
    const scoreBreakdown = {
      excellent: scores.filter(s => s === 4).length,
      good: scores.filter(s => s === 3).length,
      fair: scores.filter(s => s === 2).length,
      poor: scores.filter(s => s === 1).length,
    };
    
    // Análisis de fortalezas y áreas de mejora
    const strengthAreas = this.identifyStrengths(moduleResponses);
    const improvementAreas = this.identifyImprovements(moduleResponses);
    const criticalIssues = this.identifyCriticalIssues(moduleResponses);
    const recommendations = this.generateModuleRecommendations(moduleCode, moduleResponses);
    
    return {
      moduleCode,
      moduleTitle,
      totalQuestions,
      answeredQuestions,
      completionPercentage: (answeredQuestions / totalQuestions) * 100,
      averageScore,
      maxPossibleScore,
      strengthAreas,
      improvementAreas,
      criticalIssues,
      recommendations,
      scoreBreakdown
    };
  }

  /**
   * Genera un análisis completo de todos los módulos
   */
  static generateComprehensiveAnalysis(
    userId: string,
    allResponses: ModuleResponse[]
  ): ComprehensiveAnalysis {
    // Agrupar respuestas por módulo
    const moduleGroups = this.groupResponsesByModule(allResponses);
    
    // Analizar cada módulo
    const moduleAnalyses = Object.entries(moduleGroups).map(([moduleCode, responses]) => {
      const moduleTitle = responses[0]?.moduleTitle || moduleCode;
      return this.analyzeModule(moduleCode, moduleTitle, responses);
    });
    
    // Calcular métricas generales
    const totalScore = allResponses.reduce((sum, r) => sum + r.weight, 0);
    const maxPossibleScore = allResponses.length * 4;
    const overallScore = (totalScore / maxPossibleScore) * 100;
    
    // Análisis cruzado entre módulos
    const crossModuleInsights = this.generateCrossModuleInsights(moduleAnalyses);
    
    // Recomendaciones estratégicas
    const strategicRecommendations = this.generateStrategicRecommendations(moduleAnalyses);
    
    // Evaluación de riesgo
    const riskAssessment = this.assessOverallRisk(moduleAnalyses);
    
    return {
      userId,
      completedAt: new Date(),
      overallScore,
      maxPossibleScore,
      completionPercentage: this.calculateOverallCompletion(moduleAnalyses),
      moduleAnalyses,
      crossModuleInsights,
      strategicRecommendations,
      aiGeneratedInsights: '', // Se llenará con IA
      riskAssessment
    };
  }

  /**
   * Identifica fortalezas basadas en respuestas con alta puntuación
   */
  private static identifyStrengths(responses: ModuleResponse[]): string[] {
    return responses
      .filter(r => r.weight >= 3)
      .map(r => r.questionText)
      .slice(0, 3); // Top 3
  }

  /**
   * Identifica áreas de mejora basadas en respuestas con baja puntuación
   */
  private static identifyImprovements(responses: ModuleResponse[]): string[] {
    return responses
      .filter(r => r.weight <= 2)
      .map(r => r.questionText)
      .slice(0, 3); // Top 3
  }

  /**
   * Identifica problemas críticos (puntuación 1)
   */
  private static identifyCriticalIssues(responses: ModuleResponse[]): string[] {
    return responses
      .filter(r => r.weight === 1)
      .map(r => r.questionText);
  }

  /**
   * Genera recomendaciones específicas por módulo
   */
  private static generateModuleRecommendations(
    moduleCode: string, 
    responses: ModuleResponse[]
  ): string[] {
    const recommendations: Record<string, string[]> = {
      'MOD1': [
        'Definir un organigrama claro con roles y responsabilidades específicas',
        'Implementar procesos de delegación efectiva',
        'Establecer reuniones regulares de seguimiento'
      ],
      'MOD2': [
        'Documentar procesos críticos del negocio',
        'Implementar mejora continua en operaciones',
        'Automatizar tareas repetitivas'
      ],
      'MOD3': [
        'Definir proceso de ventas estructurado',
        'Implementar CRM para seguimiento de clientes',
        'Capacitar equipo en técnicas de venta'
      ],
      // ... más módulos
    };

    const lowScoreAreas = responses.filter(r => r.weight <= 2);
    const moduleRecs = recommendations[moduleCode] || ['Revisar procesos actuales', 'Buscar capacitación especializada'];
    
    return lowScoreAreas.length > 0 ? moduleRecs : ['Mantener las buenas prácticas actuales'];
  }

  /**
   * Agrupa respuestas por módulo
   */
  private static groupResponsesByModule(responses: ModuleResponse[]): Record<string, ModuleResponse[]> {
    return responses.reduce((groups, response) => {
      const module = response.moduleCode;
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(response);
      return groups;
    }, {} as Record<string, ModuleResponse[]>);
  }

  /**
   * Genera insights de correlación entre módulos
   */
  private static generateCrossModuleInsights(analyses: ModuleAnalysis[]) {
    const sortedByScore = [...analyses].sort((a, b) => b.averageScore - a.averageScore);
    
    return {
      strongestAreas: sortedByScore.slice(0, 3).map(a => a.moduleTitle),
      weakestAreas: sortedByScore.slice(-3).map(a => a.moduleTitle),
      correlations: [
        {
          module1: 'Liderazgo',
          module2: 'Organización',
          correlation: 0.8,
          insight: 'Un liderazgo fuerte se correlaciona directamente con una mejor organización'
        }
        // Más correlaciones...
      ]
    };
  }

  /**
   * Genera recomendaciones estratégicas por prioridad
   */
  private static generateStrategicRecommendations(analyses: ModuleAnalysis[]) {
    const criticalModules = analyses.filter(a => a.averageScore < 2);
    const improvementModules = analyses.filter(a => a.averageScore >= 2 && a.averageScore < 3);
    
    return {
      immediate: criticalModules.length > 0 
        ? ['Abordar problemas críticos en: ' + criticalModules.map(m => m.moduleTitle).join(', ')]
        : ['Mantener monitoreo continuo'],
      shortTerm: improvementModules.map(m => 
        `Mejorar procesos en ${m.moduleTitle}`
      ).slice(0, 3),
      longTerm: [
        'Desarrollar plan estratégico integral',
        'Implementar sistema de mejora continua',
        'Establecer KPIs para todas las áreas'
      ]
    };
  }

  /**
   * Evalúa el riesgo general del negocio
   */
  private static assessOverallRisk(analyses: ModuleAnalysis[]) {
    const criticalCount = analyses.filter(a => a.averageScore < 2).length;
    const lowCount = analyses.filter(a => a.averageScore < 2.5).length;
    
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let factors: string[];
    let mitigation: string[];
    
    if (criticalCount >= 3) {
      level = 'CRITICAL';
      factors = ['Múltiples áreas con problemas graves', 'Riesgo de colapso operacional'];
      mitigation = ['Intervención inmediata requerida', 'Consulta con expertos'];
    } else if (criticalCount >= 1 || lowCount >= 5) {
      level = 'HIGH';
      factors = ['Áreas críticas identificadas', 'Riesgo de deterioro'];
      mitigation = ['Plan de acción urgente', 'Asignación de recursos'];
    } else if (lowCount >= 2) {
      level = 'MEDIUM';
      factors = ['Algunas áreas requieren atención'];
      mitigation = ['Plan de mejora estructurado'];
    } else {
      level = 'LOW';
      factors = ['Operación estable'];
      mitigation = ['Mantenimiento preventivo'];
    }
    
    return { level, factors, mitigation };
  }

  /**
   * Calcula el porcentaje de completitud general
   */
  private static calculateOverallCompletion(analyses: ModuleAnalysis[]): number {
    const totalAnswered = analyses.reduce((sum, a) => sum + a.answeredQuestions, 0);
    const totalQuestions = analyses.reduce((sum, a) => sum + a.totalQuestions, 0);
    return totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  }
}
