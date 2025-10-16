"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  Target,
  Zap,
  Award,
  Star,
  Crown,
  Gem,
  Users
} from "lucide-react"

interface Reward {
  id: string
  title: string
  description: string
  cost: number
  category: string
  rarity: string
  icon: string
  stock_limit: number | null
  claimed_count: number
  is_available: boolean
  created_at: string
  updated_at: string
}

const categories = [
  { value: 'tiempo', label: 'Tiempo' },
  { value: 'experiencia', label: 'Experiencias' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'beneficios', label: 'Beneficios' }
]

const rarities = [
  { value: 'common', label: 'Común', color: 'bg-gray-100 text-gray-800' },
  { value: 'rare', label: 'Raro', color: 'bg-blue-100 text-blue-800' },
  { value: 'epic', label: 'Épico', color: 'bg-red-100 text-red-800' },
  { value: 'legendary', label: 'Legendario', color: 'bg-yellow-100 text-yellow-800' }
]

const icons = [
  { value: 'Gift', label: 'Regalo', icon: Gift },
  { value: 'Clock', label: 'Tiempo', icon: Clock },
  { value: 'Target', label: 'Objetivo', icon: Target },
  { value: 'Zap', label: 'Energía', icon: Zap },
  { value: 'Award', label: 'Premio', icon: Award },
  { value: 'Star', label: 'Estrella', icon: Star },
  { value: 'Crown', label: 'Corona', icon: Crown },
  { value: 'Gem', label: 'Gema', icon: Gem },
  { value: 'Users', label: 'Equipo', icon: Users }
]

export default function AdminRecompensasPage() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 0,
    category: 'experiencia',
    rarity: 'common',
    icon: 'Gift',
    stock_limit: null as number | null,
    is_available: true
  })

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/admin/rewards')
      const data = await response.json()
      
      if (data.success) {
        setRewards(data.data)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReward = async () => {
    setSaving(true)
    try {
      const method = editingReward ? 'PUT' : 'POST'
      const url = editingReward 
        ? `/api/admin/rewards/${editingReward.id}` 
        : '/api/admin/rewards'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowModal(false)
        setEditingReward(null)
        resetForm()
        fetchRewards()
      } else {
        alert(data.error || 'Error al guardar recompensa')
      }
    } catch (error) {
      console.error('Error saving reward:', error)
      alert('Error al procesar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) return
    
    try {
      const response = await fetch(`/api/admin/rewards/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchRewards()
      } else {
        alert(data.error || 'Error al eliminar recompensa')
      }
    } catch (error) {
      console.error('Error deleting reward:', error)
      alert('Error al procesar la solicitud')
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/rewards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchRewards()
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const openEditModal = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
      category: reward.category,
      rarity: reward.rarity,
      icon: reward.icon,
      stock_limit: reward.stock_limit,
      is_available: reward.is_available
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cost: 0,
      category: 'experiencia',
      rarity: 'common',
      icon: 'Gift',
      stock_limit: null,
      is_available: true
    })
  }

  const getRarityColor = (rarity: string) => {
    const rarityConfig = rarities.find(r => r.value === rarity)
    return rarityConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getIconComponent = (iconName: string) => {
    const iconConfig = icons.find(i => i.value === iconName)
    const IconComponent = iconConfig?.icon || Gift
    return <IconComponent className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Recompensas</h1>
          <p className="text-gray-600 mt-2">Administra las recompensas disponibles para los empleados</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-red-500 hover:bg-red-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Recompensa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nombre de la recompensa"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Costo (Gemas)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    placeholder="Costo en gemas"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada de la recompensa"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="rarity">Rareza</Label>
                  <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rarities.map(rarity => (
                        <SelectItem key={rarity.value} value={rarity.value}>
                          {rarity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="icon">Icono</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {icons.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <icon.icon className="w-4 h-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="stock_limit">Stock Disponible (opcional)</Label>
                <Input
                  id="stock_limit"
                  type="number"
                  value={formData.stock_limit || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stock_limit: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Dejar vacío para stock ilimitado"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  Disponible para canje
                </Label>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveReward} disabled={saving}>
                    {saving ? 'Guardando...' : editingReward ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recompensas</p>
                <p className="text-3xl font-bold text-gray-900">{rewards.length}</p>
              </div>
              <Gift className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">
                  {rewards.filter(r => r.is_available).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Canjeadas</p>
                <p className="text-3xl font-bold text-blue-600">
                  {rewards.reduce((sum, r) => sum + r.claimed_count, 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-3xl font-bold text-red-600">
                  {new Set(rewards.map(r => r.category)).size}
                </p>
              </div>
              <Target className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Recompensas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.map(reward => (
              <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getIconComponent(reward.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRarityColor(reward.rarity)}>
                        {rarities.find(r => r.value === reward.rarity)?.label}
                      </Badge>
                      <Badge variant="outline">{reward.category}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg">{reward.cost} gemas</p>
                    <p className="text-sm text-gray-600">
                      {reward.claimed_count} canjeadas
                      {reward.stock_limit && ` / ${reward.stock_limit} disponibles`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAvailability(reward.id, reward.is_available)}
                    >
                      {reward.is_available ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(reward)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {rewards.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay recompensas</h3>
                <p className="text-gray-500">Crea la primera recompensa para empezar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
