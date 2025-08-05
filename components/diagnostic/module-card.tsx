"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, CheckCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiagnosticModule } from "@/types/diagnostic"

interface ModuleCardProps {
  module: DiagnosticModule
  onClick: (moduleId: string) => void
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const completedSubmodules = module.submódulos.filter((s) => s.completed).length
  const totalSubmodules = module.submódulos.length
  const progress = totalSubmodules > 0 ? (completedSubmodules / totalSubmodules) * 100 : 0

  const getIcon = () => {
    switch (module.icon) {
      case "users":
        return <Users className="h-5 w-5" />
      case "settings":
        return <Settings className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        module.unlocked
          ? "hover:border-kalabasboom-red/50 hover:shadow-md cursor-pointer"
          : "opacity-70 cursor-not-allowed",
      )}
      onClick={() => module.unlocked && onClick(module.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-kalabasboom-red/10 p-2 rounded-full text-kalabasboom-red">{getIcon()}</div>
            <CardTitle>{module.title}</CardTitle>
          </div>
          {!module.unlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
          {module.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>
              {completedSubmodules}/{totalSubmodules} submódulos
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {module.level && (
          <div className="mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Nivel: {module.level}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">{module.levelDescription}</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className={cn(
            "w-full",
            module.unlocked ? "bg-kalabasboom-red hover:bg-kalabasboom-red/90" : "bg-muted text-muted-foreground",
          )}
          disabled={!module.unlocked}
        >
          {module.completed ? "Ver resultados" : "Comenzar diagnóstico"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function Users(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Settings(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function FileText(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
