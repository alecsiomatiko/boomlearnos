import { Trophy } from "lucide-react"

export const allBadges = [
  {
    id: "starter",
    name: "Iniciador Boom",
    description: "Completaste tus primeras 3 tareas.",
    icon: Trophy,
    color: "text-yellow-400",
    unlocksAt: 3,
    level: "starter",
  },
  {
    id: "task_master_bronze",
    name: "Maestro de Tareas - Bronce",
    description: "Completaste 5 tareas.",
    icon: Trophy,
    color: "text-amber-600",
    unlocksAt: 5,
    level: "bronze",
  },
  {
    id: "task_master_silver",
    name: "Maestro de Tareas - Plata",
    description: "Completaste 15 tareas.",
    icon: Trophy,
    color: "text-slate-400",
    unlocksAt: 15,
    level: "silver",
  },
] as const

export type Badge = (typeof allBadges)[number]
