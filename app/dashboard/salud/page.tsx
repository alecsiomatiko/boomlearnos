"use client"

import { useState, useEffect, useMemo } from "react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { demoFinancialData } from "@/lib/salud-data"
import type { Transaction } from "@/lib/salud-data"
import { Lightbulb, AlertCircle } from "lucide-react"
import { EKGChart } from "@/components/salud/ekg-chart"
import { DepartmentScoreCard } from "@/components/salud/department-score-card" // Import the new component

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)

// Dummy data for the new department score cards
const departmentScores = [
  { id: "mkt", title: "Marketing", score: 60, description: "Estrategia Digital" },
  { id: "fin", title: "Finanzas", score: 90, description: "Gestión de Capital" },
  { id: "rh", title: "Recursos Humanos", score: 80, description: "Desarrollo de Talento" },
  { id: "legal", title: "Legal", score: 100, description: "Cumplimiento Normativo" },
  { id: "dev", title: "Desarrollo", score: 10, description: "Innovación Tecnológica" },
  { id: "ventas", title: "Ventas", score: 20, description: "Expansión de Mercado" },
]

export default function SaludPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    demoFinancialData.flatMap((month) => month.transactions),
  )
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [healthScore, setHealthScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const apiKey = localStorage.getItem("openai_api_key")
        if (!apiKey) {
          throw new Error("No se encontró la API Key de OpenAI en el almacenamiento local.")
        }

        const response = await fetch("/api/analyze-financials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al analizar los datos")
        }

        const data = await response.json()
        setAiInsights(data.insights)
        setHealthScore(data.score)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido"
        setError(errorMessage)
        setHealthScore(68)
        setAiInsights([
          "Tus ingresos muestran una tendencia positiva, ¡buen trabajo!",
          "Considera revisar los gastos de 'Nómina', que han aumentado recientemente.",
          "El margen de beneficio es saludable, pero busca formas de optimizar costos para mejorarlo aún más.",
        ])
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(fetchAnalysis, 1000)
  }, [])

  const chartData = useMemo(() => {
    return demoFinancialData.map((month) => ({
      name: month.month.substring(0, 3),
      Ingresos: month.income,
      Gastos: month.expenses,
      Beneficio: month.profit,
    }))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Resumen de Salud Financiera</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pulso Financiero</CardTitle>
            <CardDescription>Visualización en tiempo real de tu salud financiera.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <EKGChart healthScore={healthScore} isLoading={isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-400" />
              Análisis con IA
            </CardTitle>
            <CardDescription>Insights para tu negocio.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-red-500 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error de Análisis</p>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3 text-sm text-gray-300">
                {aiInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                    {insight}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New section for Department Score Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departmentScores.map((dept) => (
          <DepartmentScoreCard key={dept.id} title={dept.title} score={dept.score} description={dept.description} />
        ))}
      </div>

      {/* The "Tendencia de Beneficios" chart is kept as it provides valuable info,
          even if not explicitly in the sketch, it fits the "informative dashboard" goal. */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Beneficios</CardTitle>
          <CardDescription>Evolución del beneficio neto mensual.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d92121" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d92121" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <Tooltip
                cursor={{ stroke: "#d92121", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="Beneficio"
                stroke="#d92121"
                fillOpacity={1}
                fill="url(#colorProfit)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
