"use client"

import { useState, useEffect } from "react"
import { useOrgApi } from "@/hooks/useOrgApi"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Trophy, Medal, Award, Target, Flame, Users, Star, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Achievement {
  id: string
  name: string
  description: string
  category: string
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  max_progress: number
  icon: string
  active: boolean
  trigger_type?: 'tasks_completed' | 'checkin_streak' | 'gems_earned' | 'messages_sent' | 'manual'
  trigger_value?: number
  auto_unlock?: boolean
  created_at: string
}

const iconMap = {
  Target: Target,
  Medal: Medal,
  Award: Award,
  Trophy: Trophy,
  Flame: Flame,
  Users: Users,
  Star: Star,
  Crown: Crown,
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  uncommon: 'bg-green-100 text-green-800 border-green-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-red-100 text-red-800 border-red-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}


export default function AchievementsPage() {
  const orgApi = useOrgApi();
  const { user, isLoading: authLoading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    points: 0,
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    max_progress: 1,
    icon: 'Target',
    active: true,
    trigger_type: 'manual' as 'tasks_completed' | 'checkin_streak' | 'gems_earned' | 'messages_sent' | 'manual',
    trigger_value: 0,
    auto_unlock: false
  })

  const fetchAchievements = async () => {
    try {
      const response = await orgApi('/api/admin/achievements', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAchievements(data);
        } else if (Array.isArray(data?.data)) {
          setAchievements(data.data);
        } else {
          setAchievements([]);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({ title: "Error", description: "No se pudieron cargar los logros", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user && user.organization?.id) {
      fetchAchievements();
    }
  }, [authLoading, user]);

  if (loading || authLoading || !user || !user.organization?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAchievement 
        ? `/api/admin/achievements/${editingAchievement.id}`
        : '/api/admin/achievements';
      const method = editingAchievement ? 'PUT' : 'POST';
      const response = await orgApi(url, { method, body: formData });
      if (response.ok) {
        toast({ 
          title: "Éxito", 
          description: editingAchievement ? "Logro actualizado" : "Logro creado" 
        });
        fetchAchievements();
        resetForm();
        setShowModal(false);
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el logro", variant: "destructive" });
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este logro?')) return
    
    try {
      const response = await fetch(`/api/admin/achievements/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: "Éxito", description: "Logro eliminado" })
        fetchAchievements()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el logro", variant: "destructive" })
    }
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setFormData({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      points: achievement.points,
      rarity: achievement.rarity,
      max_progress: achievement.max_progress,
      icon: achievement.icon,
      active: achievement.active,
      trigger_type: achievement.trigger_type || 'manual',
      trigger_value: achievement.trigger_value || 0,
      auto_unlock: achievement.auto_unlock || false
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingAchievement(null)
    setFormData({
      id: '',
      name: '',
      description: '',
      category: '',
      points: 0,
      rarity: 'common',
      max_progress: 1,
      icon: 'Target',
      active: true,
      trigger_type: 'manual',
      trigger_value: 0,
      auto_unlock: false
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Logros</h1>
          <p className="text-gray-600 mt-2">
            Administra los achievements del sistema BoomlearnOS
          </p>
        </div>
        
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Logro
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? 'Editar Logro' : 'Crear Nuevo Logro'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="id">ID del Logro</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  placeholder="e.g., first_task"
                  disabled={!!editingAchievement}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del logro"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del logro"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Productividad"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="points">Gemas</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rarity">Rareza</Label>
                  <Select value={formData.rarity} onValueChange={(value: any) => setFormData({...formData, rarity: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Común</SelectItem>
                      <SelectItem value="uncommon">Poco Común</SelectItem>
                      <SelectItem value="rare">Raro</SelectItem>
                      <SelectItem value="epic">Épico</SelectItem>
                      <SelectItem value="legendary">Legendario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="max_progress">Progreso Máximo</Label>
                  <Input
                    id="max_progress"
                    type="number"
                    value={formData.max_progress}
                    onChange={(e) => setFormData({...formData, max_progress: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="icon">Icono</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({...formData, icon: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Target">Target</SelectItem>
                    <SelectItem value="Medal">Medal</SelectItem>
                    <SelectItem value="Award">Award</SelectItem>
                    <SelectItem value="Trophy">Trophy</SelectItem>
                    <SelectItem value="Flame">Flame</SelectItem>
                    <SelectItem value="Users">Users</SelectItem>
                    <SelectItem value="Star">Star</SelectItem>
                    <SelectItem value="Crown">Crown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Configuración de Desbloqueo Automático */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">🔓 Desbloqueo Automático</h4>
                
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="auto_unlock"
                    checked={formData.auto_unlock}
                    onChange={(e) => setFormData({...formData, auto_unlock: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_unlock" className="cursor-pointer">
                    Habilitar desbloqueo automático
                  </Label>
                </div>

                {formData.auto_unlock && (
                  <>
                    <div className="mb-3">
                      <Label htmlFor="trigger_type">Tipo de Condición</Label>
                      <Select value={formData.trigger_type} onValueChange={(value: any) => setFormData({...formData, trigger_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual (Sin condición)</SelectItem>
                          <SelectItem value="tasks_completed">Tareas Completadas</SelectItem>
                          <SelectItem value="checkin_streak">Racha de Check-ins</SelectItem>
                          <SelectItem value="gems_earned">Gemas Acumuladas</SelectItem>
                          <SelectItem value="messages_sent">Mensajes Enviados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.trigger_type !== 'manual' && (
                      <div>
                        <Label htmlFor="trigger_value">
                          Valor Requerido
                          {formData.trigger_type === 'tasks_completed' && ' (número de tareas)'}
                          {formData.trigger_type === 'checkin_streak' && ' (días consecutivos)'}
                          {formData.trigger_type === 'gems_earned' && ' (total de gemas)'}
                          {formData.trigger_type === 'messages_sent' && ' (número de mensajes)'}
                        </Label>
                        <Input
                          id="trigger_value"
                          type="number"
                          min="0"
                          value={formData.trigger_value}
                          onChange={(e) => setFormData({...formData, trigger_value: parseInt(e.target.value) || 0})}
                          placeholder="Ej: 5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          El logro se desbloqueará automáticamente al alcanzar este valor
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600">
                  {editingAchievement ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
                <p className="text-sm text-gray-600">Total Logros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.filter(a => a.active).length}
                </p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-0 rounded-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.reduce((sum, a) => sum + a.points, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Gemas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  
      {/* Achievements List */}
      <Card className="bg-white border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle>Logros Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Target
              
              return (
                <div 
                  key={achievement.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-red-500" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {achievement.category} • {achievement.points} gemas • Max: {achievement.max_progress}
                        </span>
                        {achievement.auto_unlock && achievement.trigger_type !== 'manual' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            🔓 Auto: {
                              achievement.trigger_type === 'tasks_completed' ? `${achievement.trigger_value} tareas` :
                              achievement.trigger_type === 'checkin_streak' ? `${achievement.trigger_value} días` :
                              achievement.trigger_type === 'gems_earned' ? `${achievement.trigger_value} gemas` :
                              achievement.trigger_type === 'messages_sent' ? `${achievement.trigger_value} mensajes` :
                              'Configurado'
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(achievement)}
                      className="rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(achievement.id)}
                      className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {achievements.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">No hay logros configurados</p>
                <p className="text-sm">Crea tu primer logro para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
