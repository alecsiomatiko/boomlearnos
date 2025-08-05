"use client"

import { cn } from "@/lib/utils"

import type { MegaModule } from "@/types/mega-diagnostic"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import * as LucideIcons from "lucide-react" // Import all icons

interface ModuleDisplayProps {
  module: MegaModule
  onSubmoduleSelect: (submoduleId: string) => void
  onBack: () => void // Function to go back to Etapa selection
  isCompleted?: boolean
  currentLevel?: string
}

export function ModuleDisplay({ module, onSubmoduleSelect, onBack, isCompleted, currentLevel }: ModuleDisplayProps) {
  // @ts-ignore TODO: fix this type error
  const IconComponent = LucideIcons[module.icon] || LucideIcons.HelpCircle

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-3xl mx-auto">
      <Button onClick={onBack} variant="outline" className="mb-6">
        <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" /> Volver a Etapas
      </Button>
      <div className="flex items-center mb-6">
        <IconComponent className="h-10 w-10 text-kalabasboom-red mr-4" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{module.titulo}</h1>
          {module.descripcion && <p className="text-gray-600">{module.descripcion}</p>}
        </div>
      </div>

      {isCompleted && currentLevel && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 font-semibold">¡Módulo Completado!</p>
          <p className="text-green-600">Nivel alcanzado: {currentLevel}</p>
        </div>
      )}

      <div className="space-y-4">
        {module.submodules.map((submodule) => (
          <Card
            key={submodule.id}
            className={cn("transition-all hover:shadow-md", submodule.completado && "bg-green-50 border-green-200")}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">{submodule.titulo}</CardTitle>
              {submodule.descripcion && <CardDescription>{submodule.descripcion}</CardDescription>}
            </CardHeader>
            <CardContent>
              {submodule.completado && submodule.resultado?.nivel && (
                <p className="text-sm text-green-600 font-medium">Completado - Nivel: {submodule.resultado.nivel}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => onSubmoduleSelect(submodule.id)}
                className="w-full"
                variant={submodule.completado ? "secondary" : "default"}
              >
                {submodule.completado ? "Ver Resultados / Repetir" : "Comenzar Submódulo"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
