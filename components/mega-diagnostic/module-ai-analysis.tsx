"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Star,
  Clock
} from "lucide-react"
import { useModuleAIAnalysis } from "@/hooks/use-module-ai-analysis"

interface ModuleAIAnalysisProps {
  userId: string;
  moduleCode: string;
  moduleTitle: string;
  isCompleted: boolean;
  onAnalysisComplete?: (analysis: any) => void;
}

export function ModuleAIAnalysis({ 
  userId, 
  moduleCode, 
  moduleTitle, 
  isCompleted,
  onAnalysisComplete 
}: ModuleAIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);
  const { analyzeModule, getModuleAnalysis, loading, error } = useModuleAIAnalysis();

  useEffect(() => {
    if (isCompleted && userId && moduleCode) {
      loadExistingAnalysis();
    }
  }, [userId, moduleCode, isCompleted]);

  const loadExistingAnalysis = async () => {
    const existingAnalysis = await getModuleAnalysis(userId, moduleCode);
    if (existingAnalysis) {
      setAnalysis(existingAnalysis);
      setHasExistingAnalysis(true);
    }
  };

  const handleAnalyze = async () => {
    const result = await analyzeModule(userId, moduleCode);
    if (result) {
      setAnalysis(result);
      setHasExistingAnalysis(true);
      onAnalysisComplete?.(result);
    }
  };

  const handleRefresh = async () => {
    // Forzar nuevo análisis
    await handleAnalyze();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isCompleted) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Completa este módulo para generar el análisis IA personalizado.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al generar análisis: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de análisis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-brand-red" />
              <div>
                <CardTitle className="text-lg">
                  Análisis IA - {moduleTitle}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Análisis personalizado con inteligencia artificial
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {hasExistingAnalysis && (
                <Button 
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              )}
              {!hasExistingAnalysis && (
                <Button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-brand-red hover:bg-red-700"
                >
                  <Brain className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                  {loading ? 'Analizando...' : 'Generar Análisis IA'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resultados del análisis */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Score y Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-5 w-5" />
                Puntuación General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  <span className={getScoreColor(analysis.analysis.score)}>
                    {analysis.analysis.score}
                  </span>
                  <span className="text-gray-400">/100</span>
                </div>
                <Badge 
                  className={getPriorityColor(analysis.analysis.priority)}
                  variant="outline"
                >
                  Prioridad: {analysis.analysis.priority.toUpperCase()}
                </Badge>
              </div>
              {analysis.analysis.insights && (
                <p className="mt-4 text-gray-700">
                  {analysis.analysis.insights}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Fortalezas */}
          {analysis.analysis.strengths?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Fortalezas Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Áreas de Mejora */}
          {analysis.analysis.weaknesses?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Áreas de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.weaknesses.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recomendaciones */}
          {analysis.analysis.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-brand-red">
                  <Lightbulb className="h-5 w-5" />
                  Recomendaciones Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.analysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Próximos Pasos */}
          {analysis.analysis.nextSteps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-brand-red">
                  <ArrowRight className="h-5 w-5" />
                  Próximos Pasos Sugeridos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.analysis.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-brand-red rounded-full text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Timestamp */}
          <div className="text-center text-sm text-gray-500">
            Análisis generado el {new Date(analysis.generatedAt).toLocaleString('es-ES')}
          </div>
        </motion.div>
      )}
    </div>
  );
}