"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { demoFinancialData } from "@/lib/salud-data"
import type { Transaction } from "@/lib/salud-data"
import { ArrowUpRight, ArrowDownRight, Upload, Lightbulb, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)

export function SaludDashboard() {
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
        // Fallback values
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

    fetchAnalysis()
  }, [])

  const chartData = useMemo(() => {
    return demoFinancialData.map((month) => ({
      name: month.month.substring(0, 3),
      Ingresos: month.income,
      Gastos: month.expenses,
    }))
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen Mensual</CardTitle>
            <CardDescription>Ingresos vs. Gastos de los últimos 3 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#d92121" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salud Financiera</CardTitle>
            <CardDescription>Puntaje general.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full pb-16">
            {isLoading ? (
              <Loader2 className="h-12 w-12 animate-spin text-kalabasboom-red" />
            ) : (
              <div className="relative">
                <svg className="transform -rotate-90" width="160" height="160" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle
                    className={cn("transition-all duration-1000 ease-out", getScoreColor(healthScore))}
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - healthScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-4xl font-bold", getScoreColor(healthScore))}>{healthScore}</span>
                </div>
              </div>
            )}
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
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error de Análisis</p>
                  <p>{error}</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3 text-sm text-muted-foreground">
                {aiInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-kalabasboom-red font-bold">›</span>
                    {insight}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.category}</Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          tx.type === "income" ? "text-green-600" : "text-gray-800",
                        )}
                      >
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro Rápido</CardTitle>
              <CardDescription>Añade ingresos o gastos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Descripción" />
              <Input type="number" placeholder="Monto" />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Ingreso
              </Button>
              <Button variant="secondary" className="w-full">
                <ArrowDownRight className="mr-2 h-4 w-4" /> Gasto
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estados Financieros</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                <Upload className="mr-2 h-4 w-4" />
                Subir documento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
