import { ExpenseCategoryChart } from "@/components/salud/expense-category-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export default function AnalisisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Análisis Profundo</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseCategoryChart />
        </div>
        <Card className="bg-gray-800/50 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-400" />
              Recomendaciones Clave
            </CardTitle>
            <CardDescription className="text-gray-400">Oportunidades basadas en tu desglose de gastos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Optimizar Gastos de Equipo:</span> La categoría 'Equipo'
                  representa la mayor parte de tus gastos. Evalúa si hay eficiencias que se puedan lograr sin impactar
                  la productividad.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Revisar Costos de Operaciones:</span> Los gastos operativos
                  son consistentes. Busca negociar mejores tarifas con proveedores o explorar alternativas más
                  económicas para la renta de oficina.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-kalabasboom-red font-bold mt-0.5">›</span>
                <div>
                  <span className="font-semibold text-white">Evaluar ROI de Marketing:</span> Analiza el retorno de
                  inversión de tus campañas de marketing para asegurar que cada peso gastado esté generando valor.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
