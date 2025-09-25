"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  BarChart3, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AnalysisDashboard } from '@/components/analysis/analysis-dashboard';
import { AIAnalysisChat } from '@/components/analysis/ai-analysis-chat';
import { 
  ComprehensiveAnalysis, 
  MegaDiagnosticAnalyzer 
} from '@/lib/analysis/mega-diagnostic-analyzer';
import { 
  AIInsightResponse, 
  AIAnalysisService 
} from '@/lib/analysis/ai-analysis-service';

interface AnalysisPageComponentProps {
  userId: string;
}

export default function AnalysisPageComponent({ userId }: AnalysisPageComponentProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [userId]);

  const loadAnalysis = async () => {
    try {
      setIsLoadingAnalysis(true);
      setError(null);

      const response = await fetch(`/api/diagnostic/user-responses?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error al cargar las respuestas del diagnóstico');
      }

      const { userResponses } = await response.json();
      
      if (!userResponses || userResponses.length === 0) {
        throw new Error('No se encontraron respuestas del diagnóstico para este usuario');
      }

      // Convertir los datos de la API al formato esperado por el analizador
      const moduleResponses = userResponses.map((response: any) => ({
        questionId: response.questionId.toString(),
        questionText: response.questionText,
        selectedOptionId: response.selectedOptionId.toString(),
        selectedOptionText: response.optionText,
        weight: response.optionValue,
        moduleCode: response.moduleCode,
        moduleTitle: response.moduleTitle
      }));

      // Procesar el análisis
      const comprehensiveAnalysis = MegaDiagnosticAnalyzer.generateComprehensiveAnalysis(userId, moduleResponses);
      
      setAnalysis(comprehensiveAnalysis);
      
      // Auto-generar insights de IA si están disponibles
      if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        await generateAIInsights(comprehensiveAnalysis);
      }

    } catch (error) {
      console.error('Error cargando análisis:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const generateAIInsights = async (analysisData: ComprehensiveAnalysis) => {
    try {
      setIsLoadingAI(true);
      
      const insights = await AIAnalysisService.generateDeepInsights({
        analysis: analysisData,
        businessContext: {
          industry: 'General', // Esto podría venir de los datos del usuario
          size: 'PYME',
          stage: 'Crecimiento'
        }
      });

      setAiInsights(insights);
    } catch (error) {
      console.error('Error generando insights de IA:', error);
      // No mostrar error para IA, es opcional
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleRefreshAnalysis = () => {
    loadAnalysis();
  };

  const handleStartChat = () => {
    if (analysis) {
      setShowChat(true);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  if (isLoadingAnalysis) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Procesando tu diagnóstico</h3>
              <p className="text-muted-foreground">
                Analizando tus respuestas y generando insights personalizados...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={handleRefreshAnalysis} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay datos para analizar</h3>
              <p className="text-muted-foreground mb-4">
                Parece que no has completado ningún módulo del diagnóstico.
              </p>
              <Button onClick={() => router.push('/dashboard/mega-diagnostico')}>
                Ir al Diagnóstico
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Análisis de Diagnóstico Empresarial
              </h1>
              <p className="text-muted-foreground">
                Insights completos y recomendaciones personalizadas para tu empresa
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshAnalysis}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              {analysis && (
                <Button size="sm" onClick={handleStartChat}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Consultar con IA
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Estado del diagnóstico */}
        <div className="mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Diagnóstico Completado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Última actualización: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{analysis.moduleAnalyses.length}</div>
                    <div className="text-muted-foreground">Módulos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{analysis.overallScore.toFixed(1)}%</div>
                    <div className="text-muted-foreground">Puntuación</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{analysis.completionPercentage.toFixed(0)}%</div>
                    <div className="text-muted-foreground">Completo</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat overlay */}
        {showChat && analysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl">
              <AIAnalysisChat 
                analysis={analysis} 
                onClose={handleCloseChat}
              />
            </div>
          </div>
        )}

        {/* Dashboard principal */}
        {analysis && (
          <AnalysisDashboard
            analysis={analysis}
            aiInsights={aiInsights || {
              executiveSummary: 'Análisis en proceso...',
              detailedAnalysis: '',
              strategicRecommendations: [],
              industryBenchmarks: [],
              nextSteps: []
            }}
            onStartChat={handleStartChat}
            isLoadingAI={isLoadingAI}
          />
        )}
      </div>
    </div>
  );
}
