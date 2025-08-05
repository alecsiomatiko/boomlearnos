import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" />
            Página en Construcción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            La sección de "Configuración" te permitirá personalizar tu experiencia en el dashboard de salud financiera.
            ¡Estará lista pronto!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
