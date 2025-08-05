"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronRight } from "lucide-react"
import type { DiagnosticSubmodule } from "@/types/diagnostic"

interface SubmoduleCardProps {
  submodule: DiagnosticSubmodule
  onClick: (submoduleId: string) => void
}

export function SubmoduleCard({ submodule, onClick }: SubmoduleCardProps) {
  return (
    <Card
      className="transition-all duration-300 hover:border-kalabasboom-red/50 hover:shadow-md cursor-pointer"
      onClick={() => onClick(submodule.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{submodule.title}</CardTitle>
          {submodule.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
        <CardDescription>{submodule.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-sm">
          <span>{submodule.questions.length} preguntas</span>
        </div>

        {submodule.result && (
          <div className="mt-4 space-y-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Nivel: {submodule.result.level}
            </Badge>
            <p className="text-sm text-muted-foreground">{submodule.result.description}</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full bg-kalabasboom-red hover:bg-kalabasboom-red/90">
          {submodule.completed ? "Ver resultados" : "Comenzar"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
