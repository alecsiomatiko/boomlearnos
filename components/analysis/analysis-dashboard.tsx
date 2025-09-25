"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Download,
  Share2,
  Lightbulb
} from 'lucide-react';
import { ComprehensiveAnalysis } from '@/lib/analysis/mega-diagnostic-analyzer';
import { AIInsightResponse } from '@/lib/analysis/ai-analysis-service';

interface AnalysisDashboardProps {
  analysis: ComprehensiveAnalysis;
  aiInsights: AIInsightResponse;
  onStartChat: () => void;
  isLoadingAI?: boolean;
}

export function AnalysisDashboard({ 
  analysis, 
  aiInsights, 
  onStartChat, 
  isLoadingAI = false 
}: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'recommendations' | 'benchmarks'>('overview');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  // Preparar datos para gráficos
  const moduleChartData = analysis.moduleAnalyses.map(module => ({
    name: module.moduleTitle.substring(0, 15) + '...',
    score: Math.round((module.averageScore / 4) * 100),
    completion: module.completionPercentage
  }));

  const radarData = analysis.moduleAnalyses.map(module => ({
    module: module.moduleCode,
    score: Math.round((module.averageScore / 4) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.overallScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analysis.overallScore >= 75 ? 'Excelente' : 
               analysis.overallScore >= 50 ? 'Bueno' : 'Necesita mejora'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completitud</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.completionPercentage.toFixed(1)}%</div>
            <Progress value={analysis.completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Riesgo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getRiskColor(analysis.riskAssessment.level)}>
              {analysis.riskAssessment.level}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {analysis.riskAssessment.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos Analizados</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.moduleAnalyses.length}</div>
            <p className="text-xs text-muted-foreground">
              {analysis.moduleAnalyses.filter(m => m.completionPercentage === 100).length} completos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegación por tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { key: 'overview', label: 'Resumen' },
          { key: 'modules', label: 'Por Módulos' },
          { key: 'recommendations', label: 'Recomendaciones' },
          { key: 'benchmarks', label: 'Comparativas' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de puntuaciones por módulo */}
          <Card>
            <CardHeader>
              <CardTitle>Puntuaciones por Módulo</CardTitle>
              <CardDescription>Rendimiento de cada área evaluada</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico radar */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Radar</CardTitle>
              <CardDescription>Comparativa visual de todas las áreas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="module" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resumen ejecutivo de IA */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Resumen Ejecutivo - Análisis IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAI ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">{aiInsights.executiveSummary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-4">
          {analysis.moduleAnalyses.map((module) => (
            <Card key={module.moduleCode}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{module.moduleTitle}</CardTitle>
                    <CardDescription>Código: {module.moduleCode}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {((module.averageScore / 4) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.completionPercentage.toFixed(1)}% completo
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(module.averageScore / 4) * 100} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Fortalezas</h4>
                    {module.strengthAreas.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {module.strengthAreas.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No identificadas</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Áreas de Mejora</h4>
                    {module.improvementAreas.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {module.improvementAreas.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No identificadas</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Problemas Críticos</h4>
                    {module.criticalIssues.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {module.criticalIssues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No identificados</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {aiInsights.strategicRecommendations.map((rec, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <h3 className="font-semibold">{rec.area}</h3>
                    </div>
                    <p className="text-muted-foreground mb-2">{rec.action}</p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>Timeline:</strong> {rec.timeline}</span>
                      <span><strong>Impacto:</strong> {rec.expectedImpact}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          {aiInsights.industryBenchmarks.length > 0 ? (
            aiInsights.industryBenchmarks.map((benchmark, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{benchmark.area}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tu puntuación</span>
                      <span className="font-bold">{benchmark.yourScore.toFixed(1)}</span>
                    </div>
                    <Progress value={(benchmark.yourScore / 4) * 100} />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">Tu empresa</div>
                        <div className="text-lg font-bold">{benchmark.yourScore.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Promedio industria</div>
                        <div className="text-lg font-bold text-blue-600">{benchmark.industryAverage.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Top performers</div>
                        <div className="text-lg font-bold text-green-600">{benchmark.topPerformers.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Los benchmarks de industria estarán disponibles una vez que se complete el análisis con IA.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Footer con acciones */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
        
        <Button onClick={onStartChat} size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Discutir con IA
        </Button>
      </div>
    </div>
  );
}
