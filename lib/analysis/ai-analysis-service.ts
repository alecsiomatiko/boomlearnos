import { ComprehensiveAnalysis, ModuleAnalysis, ChatContext } from './mega-diagnostic-analyzer';

export interface AIInsightRequest {
  analysis: ComprehensiveAnalysis;
  focusAreas?: string[];
  businessContext?: {
    industry: string;
    size: string;
    stage: string;
  };
}

export interface AIInsightResponse {
  executiveSummary: string;
  detailedAnalysis: string;
  strategicRecommendations: {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    area: string;
    action: string;
    timeline: string;
    expectedImpact: string;
  }[];
  industryBenchmarks: {
    area: string;
    yourScore: number;
    industryAverage: number;
    topPerformers: number;
  }[];
  nextSteps: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  relatedModules?: string[];
  attachments?: {
    type: 'chart' | 'recommendation' | 'analysis';
    data: any;
  }[];
}

export class AIAnalysisService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private static readonly ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  /**
   * Genera insights profundos usando IA sobre el análisis completo
   */
  static async generateDeepInsights(request: AIInsightRequest): Promise<AIInsightResponse> {
    const { analysis, businessContext } = request;
    
    const prompt = this.buildAnalysisPrompt(analysis, businessContext);
    
    try {
      // Usar OpenAI GPT-4 para análisis profundo
      const aiResponse = await this.callOpenAI(prompt);
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generando insights con IA:', error);
      // Fallback a análisis heurístico
      return this.generateFallbackInsights(analysis);
    }
  }

  /**
   * Maneja conversaciones de chat sobre el análisis
   */
  static async handleChatMessage(
    message: string,
    context: ChatContext
  ): Promise<ChatMessage> {
    const { analysis, conversationHistory } = context;
    
    const chatPrompt = this.buildChatPrompt(message, analysis, conversationHistory);
    
    try {
      const aiResponse = await this.callOpenAI(chatPrompt);
      
      return {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        relatedModules: this.extractRelatedModules(message, analysis),
        attachments: await this.generateRelevantAttachments(message, analysis)
      };
    } catch (error) {
      console.error('Error en chat con IA:', error);
      return {
        role: 'ai',
        content: 'Disculpa, hay un problema técnico. ¿Puedes reformular tu pregunta?',
        timestamp: new Date()
      };
    }
  }

  /**
   * Construye el prompt para análisis profundo
   */
  private static buildAnalysisPrompt(
    analysis: ComprehensiveAnalysis, 
    businessContext?: any
  ): string {
    const contextInfo = businessContext 
      ? `Contexto del negocio: Industria: ${businessContext.industry}, Tamaño: ${businessContext.size}, Etapa: ${businessContext.stage}`
      : '';

    return `
Eres un consultor de negocios experto con 20+ años de experiencia ayudando a empresas a optimizar sus operaciones. Analiza el siguiente diagnóstico empresarial completo y genera insights profundos y accionables.

${contextInfo}

DATOS DEL DIAGNÓSTICO:
- Puntuación General: ${analysis.overallScore.toFixed(1)}% (${analysis.overallScore}/100)
- Completitud: ${analysis.completionPercentage.toFixed(1)}%
- Nivel de Riesgo: ${analysis.riskAssessment.level}

ANÁLISIS POR MÓDULOS:
${analysis.moduleAnalyses.map(module => `
${module.moduleTitle}:
- Puntuación: ${module.averageScore.toFixed(1)}/4 (${((module.averageScore/4)*100).toFixed(1)}%)
- Completitud: ${module.completionPercentage.toFixed(1)}%
- Fortalezas: ${module.strengthAreas.join(', ') || 'Ninguna identificada'}
- Áreas de mejora: ${module.improvementAreas.join(', ') || 'Ninguna identificada'}
- Problemas críticos: ${module.criticalIssues.join(', ') || 'Ninguno'}
`).join('\n')}

ÁREAS MÁS FUERTES: ${analysis.crossModuleInsights.strongestAreas.join(', ')}
ÁREAS MÁS DÉBILES: ${analysis.crossModuleInsights.weakestAreas.join(', ')}

GENERA UN ANÁLISIS QUE INCLUYA:

1. **RESUMEN EJECUTIVO** (2-3 párrafos):
   - Estado general de la empresa
   - Principales hallazgos
   - Nivel de urgencia

2. **ANÁLISIS DETALLADO** (4-5 párrafos):
   - Patrones identificados entre módulos
   - Correlaciones críticas
   - Impacto en la sostenibilidad del negocio

3. **RECOMENDACIONES ESTRATÉGICAS** (5-7 recomendaciones priorizadas):
   Para cada recomendación incluye:
   - Prioridad (HIGH/MEDIUM/LOW)
   - Área específica
   - Acción concreta
   - Timeline estimado
   - Impacto esperado

4. **BENCHMARKS DE INDUSTRIA** (3-5 comparaciones):
   - Área evaluada
   - Puntuación actual
   - Promedio de industria (estimado)
   - Top performers (estimado)

5. **PRÓXIMOS PASOS INMEDIATOS** (3-5 acciones):
   - Acciones para los próximos 30 días

Usa un tono profesional pero accesible. Sé específico y accionable en tus recomendaciones.
`;
  }

  /**
   * Construye el prompt para chat conversacional
   */
  private static buildChatPrompt(
    userMessage: string,
    analysis: ComprehensiveAnalysis,
    history: any[]
  ): string {
    const recentHistory = history.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    return `
Eres un consultor de negocios experto conversando con un empresario sobre los resultados de su diagnóstico empresarial.

CONTEXTO DEL DIAGNÓSTICO:
- Puntuación General: ${analysis.overallScore.toFixed(1)}%
- Áreas fuertes: ${analysis.crossModuleInsights.strongestAreas.join(', ')}
- Áreas débiles: ${analysis.crossModuleInsights.weakestAreas.join(', ')}
- Riesgo: ${analysis.riskAssessment.level}

CONVERSACIÓN RECIENTE:
${recentHistory}

MENSAJE DEL USUARIO: "${userMessage}"

RESPONDE COMO UN CONSULTOR EXPERTO:
- Sé conversacional pero profesional
- Haz referencia específica a los datos del diagnóstico cuando sea relevante
- Ofrece consejos prácticos y accionables
- Haz preguntas para profundizar cuando sea apropiado
- Mantén el foco en soluciones de negocio

Respuesta (máximo 200 palabras):
`;
  }

  /**
   * Llama a la API de OpenAI
   */
  private static async callOpenAI(prompt: string): Promise<string> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key no configurada');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Eres un consultor de negocios experto especializado en diagnósticos empresariales y optimización operacional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No se pudo generar respuesta';
  }

  /**
   * Parsea la respuesta de IA en formato estructurado
   */
  private static parseAIResponse(aiText: string): AIInsightResponse {
    // Esta función parseará el texto de IA y lo estructurará
    // Por ahora, retornamos una estructura básica
    return {
      executiveSummary: this.extractSection(aiText, 'RESUMEN EJECUTIVO'),
      detailedAnalysis: this.extractSection(aiText, 'ANÁLISIS DETALLADO'),
      strategicRecommendations: this.parseRecommendations(aiText),
      industryBenchmarks: this.parseBenchmarks(aiText),
      nextSteps: this.parseNextSteps(aiText)
    };
  }

  /**
   * Extrae secciones específicas del texto de IA
   */
  private static extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(`**${sectionName}**`, '').trim() : '';
  }

  /**
   * Parsea recomendaciones del texto de IA
   */
  private static parseRecommendations(text: string): any[] {
    // Implementar parsing de recomendaciones
    return [
      {
        priority: 'HIGH' as const,
        area: 'Organización',
        action: 'Definir estructura organizacional clara',
        timeline: '30 días',
        expectedImpact: 'Alto'
      }
    ];
  }

  /**
   * Parsea benchmarks del texto de IA
   */
  private static parseBenchmarks(text: string): any[] {
    return [
      {
        area: 'Organización',
        yourScore: 2.5,
        industryAverage: 3.2,
        topPerformers: 3.8
      }
    ];
  }

  /**
   * Parsea próximos pasos del texto de IA
   */
  private static parseNextSteps(text: string): string[] {
    return [
      'Revisar estructura organizacional actual',
      'Documentar procesos críticos',
      'Establecer KPIs de seguimiento'
    ];
  }

  /**
   * Genera insights de fallback sin IA
   */
  private static generateFallbackInsights(analysis: ComprehensiveAnalysis): AIInsightResponse {
    return {
      executiveSummary: `Su empresa presenta una puntuación general de ${analysis.overallScore.toFixed(1)}% con un nivel de riesgo ${analysis.riskAssessment.level}. Las áreas más fuertes son ${analysis.crossModuleInsights.strongestAreas.join(', ')} mientras que requiere atención en ${analysis.crossModuleInsights.weakestAreas.join(', ')}.`,
      detailedAnalysis: 'Análisis detallado generado heurísticamente basado en las puntuaciones y patrones identificados.',
      strategicRecommendations: [
        {
          priority: 'HIGH' as const,
          area: 'Mejora Inmediata',
          action: 'Abordar áreas críticas identificadas',
          timeline: '30 días',
          expectedImpact: 'Alto'
        }
      ],
      industryBenchmarks: [],
      nextSteps: analysis.strategicRecommendations.immediate
    };
  }

  /**
   * Extrae módulos relacionados del mensaje del usuario
   */
  private static extractRelatedModules(message: string, analysis: ComprehensiveAnalysis): string[] {
    const moduleKeywords: Record<string, string[]> = {
      'MOD1': ['organización', 'roles', 'estructura', 'organigrama'],
      'MOD2': ['procesos', 'sistemas', 'operaciones'],
      'MOD3': ['ventas', 'marketing', 'clientes'],
      'MOD4': ['finanzas', 'métricas', 'dinero', 'presupuesto'],
      'MOD5': ['liderazgo', 'cultura', 'equipo', 'personas']
    };

    const relatedModules: string[] = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(moduleKeywords).forEach(([moduleCode, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        relatedModules.push(moduleCode);
      }
    });

    return relatedModules;
  }

  /**
   * Genera attachments relevantes para el chat
   */
  private static async generateRelevantAttachments(
    message: string, 
    analysis: ComprehensiveAnalysis
  ): Promise<any[]> {
    // Generar gráficos, recomendaciones, etc. basados en el mensaje
    return [];
  }
}
