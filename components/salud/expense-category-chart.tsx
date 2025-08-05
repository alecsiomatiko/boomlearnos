"use client"

import { useMemo, useState } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { demoFinancialData } from "@/lib/salud-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#d92121", "#b91c1c", "#991b1b", "#7f1d1d", "#f87171", "#ef4444"]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)

export function ExpenseCategoryChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const expenseData = useMemo(() => {
    const expenseMap = new Map<string, number>()
    demoFinancialData.forEach((month) => {
      month.transactions.forEach((tx) => {
        if (tx.type === "expense") {
          const currentAmount = expenseMap.get(tx.category) || 0
          expenseMap.set(tx.category, currentAmount + Math.abs(tx.amount))
        }
      })
    })
    return Array.from(expenseMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [])

  const totalExpenses = useMemo(() => expenseData.reduce((acc, curr) => acc + curr.value, 0), [expenseData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalExpenses) * 100).toFixed(2)
      return (
        <div className="p-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-md text-white text-sm">
          <p className="font-bold">{data.name}</p>
          <p>{formatCurrency(data.value)}</p>
          <p className="text-gray-400">{percentage}% del total</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 text-white">
      <CardHeader>
        <CardTitle>Desglose de Gastos por Categoría</CardTitle>
        <CardDescription className="text-gray-400">Distribución de tus gastos en los últimos 3 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-opacity duration-300"
                    style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-2 text-sm">
            {expenseData.map((entry, index) => (
              <div
                key={`legend-${index}`}
                className="flex items-center justify-between transition-opacity duration-300"
                style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-semibold">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
