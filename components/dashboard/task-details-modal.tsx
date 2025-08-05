"use client"

import { useState } from "react"
import { Calendar, Clock, User, Flag, BarChart3, CheckCircle2, Trash2, Send } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types"
import { RewardAnimation } from "../animations/reward-animation"

interface TaskDetailsModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
  onProgressUpdate?: (id: string, progress: number) => void
  onAddComment?: (id: string, comment: string) => void
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onDelete,
  onComplete,
  onProgressUpdate,
  onAddComment,
}: TaskDetailsModalProps) {
  const [progress, setProgress] = useState<number>(task?.progress || 0)
  const [comment, setComment] = useState("")
  const [showReward, setShowReward] = useState(false)

  if (!task) return null

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  const handleProgressUpdate = () => {
    if (onProgressUpdate) {
      onProgressUpdate(task.id, progress)
    }
  }

  const handleComplete = () => {
    if (onComplete && task.id) {
      onComplete(task.id)
      setShowReward(true)
    }
  }

  const handleAddComment = () => {
    if (comment.trim() && onAddComment && task.id) {
      onAddComment(task.id, comment)
      setComment("")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "text-red-500 bg-red-100"
      case "media":
        return "text-orange-500 bg-orange-100"
      case "baja":
        return "text-green-500 bg-green-100"
      default:
        return "text-blue-500 bg-blue-100"
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "finanzas":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Finanzas</Badge>
      case "marketing":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Marketing</Badge>
      case "operaciones":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Operaciones</Badge>
      case "rrhh":
        return <Badge className="bg-amber-500 hover:bg-amber-600">RRHH</Badge>
      default:
        return <Badge>{category}</Badge>
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                {task.title}
                {task.progress === 100 && <CheckCircle2 className="h-5 w-5 text-green-300" />}
              </DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {getCategoryBadge(task.category)}
                <Badge variant="outline" className={`${getPriorityColor(task.priority)} border-none`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-none">
                  {task.gems} gemas
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Detalles</h3>

                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Fecha límite: {format(new Date(task.dueDate), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Asignado a: {task.assignedTo || "Sin asignar"}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Creado: {format(new Date(task.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <BarChart3 className="h-4 w-4 mr-2 mt-1 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Progreso: {progress}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Slider
                            value={[progress]}
                            max={100}
                            step={5}
                            onValueChange={handleProgressChange}
                            onValueCommit={handleProgressUpdate}
                            className="w-full"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleProgressUpdate()}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Actualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Descripción</h3>
                <p className="text-gray-600 text-sm mb-6">{task.description}</p>

                <h3 className="text-lg font-medium mb-4">Comentarios</h3>
                <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-red-100 text-red-500">
                              {comment.author?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.author || "Usuario"}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(comment.date), "d MMM, HH:mm", { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No hay comentarios aún</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Añadir un comentario..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none"
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="bg-red-500 hover:bg-red-600 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 flex justify-between">
            <div>
              {onDelete && (
                <Button
                  variant="outline"
                  onClick={() => onDelete(task.id)}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {task.progress < 100 && (
                <Button onClick={handleComplete} className="bg-red-500 hover:bg-red-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como completada
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RewardAnimation
        show={showReward}
        title="Tarea Completada"
        description={`Has completado: ${task.title}`}
        gems={task.gems || 0}
        type="task"
        onComplete={() => {
          setShowReward(false)
          onClose()
        }}
      />
    </>
  )
}
