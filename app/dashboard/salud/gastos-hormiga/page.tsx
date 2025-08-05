import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { demoFinancialData } from "@/lib/salud-data"
import { AlertCircle, Coffee, DollarSign, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)

export default function GastosHormigaPage() {
  const microExpenses = demoFinancialData
    .flatMap((m) => m.transactions)
    .filter((tx) => tx.category === "Gastos Hormiga")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalMicroExpenses = microExpenses.reduce((acc, tx) => acc + Math.abs(tx.amount), 0)
  const averageMicroExpense = totalMicroExpenses / microExpenses.length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Coffee className="h-8 w-8 text-kalabasboom-red" />
          Análisis de Gastos Hormiga
        </h1>
        <p className="text-gray-400 mt-1">Identifica y controla esos pequeños gastos que se suman con el tiempo.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMicroExpenses)}</div>
            <p className="text-xs text-gray-400">En los últimos 3 meses</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Gasto Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageMicroExpense)}</div>
            <p className="text-xs text-gray-400">Por transacción</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Transacciones</CardTitle>
            <Coffee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{microExpenses.length}</div>
            <p className="text-xs text-gray-400">Pequeños gastos identificados</p>
          </CardContent>
        </Card>
        <Card className="bg-kalabasboom-red/20 border-kalabasboom-red/50 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-200">Alerta de Impacto</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMicroExpenses * 4)}</div>
            <p className="text-xs text-red-200">Proyección de gasto anual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Registro de Gastos Hormiga</CardTitle>
            <CardDescription className="text-gray-400">
              Lista detallada de todos los micro-gastos registrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {microExpenses.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.date).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-base">
                    {formatCurrency(Math.abs(tx.amount))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-400" />
              Plan de Acción
            </CardTitle>
            <CardDescription className="text-gray-400">
              Estrategias para reducir estos gastos y aumentar tus ahorros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Presupuesto para café:</span> Asigna un monto semanal para
                  café y snacks para evitar gastos impulsivos.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Revisar suscripciones:</span> Cancela los servicios
                  digitales que no utilices regularmente. ¡Cada peso cuenta!
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Planificar comidas:</span> Coordinar pedidos de comida en
                  grupo o planificar con antelación puede reducir significativamente los costos de entrega.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
