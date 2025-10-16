"use client"

import { useState, useEffect } from "react"
import { useOrgApi } from "@/hooks/useOrgApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Gift, Clock, Target, Zap, Star, Package, Trophy, Sparkles, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Reward {
  id: string
  title: string
  description: string
  cost: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
  is_available: boolean
  stock_limit: number | null
  claimed_count: number
  created_at: string
}

const iconMap = {
  Gift: Gift,
  Clock: Clock,
  Target: Target,
  Zap: Zap,
  Star: Star,
  Package: Package,
  Trophy: Trophy,
  Sparkles: Sparkles,
  Crown: Crown,
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-red-100 text-red-800 border-red-300',
  legendary: 'bg-amber-100 text-amber-800 border-amber-300',
}

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
}

export default function RewardsAdmin() {
  const orgApi = useOrgApi();
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 0,
    category: '',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    icon: 'Gift',
    is_available: true,
    stock_limit: null as number | null
  })

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await orgApi('/api/admin/rewards', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setRewards(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar recompensas');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar las recompensas", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.cost < 0) {
      toast({ 
        title: "Error", 
        description: "Por favor completa todos los campos requeridos", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const url = editingReward 
        ? `/api/admin/rewards/${editingReward.id}`
        : '/api/admin/rewards';
      const method = editingReward ? 'PUT' : 'POST';
      
      const response = await orgApi(url, { method, body: formData });
      
      if (response.ok) {
        toast({ 
          title: "✅ Éxito", 
          description: editingReward 
            ? "Recompensa actualizada correctamente" 
            : "Recompensa creada correctamente" 
        });
        fetchRewards();
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }
    } catch (error: any) {
      console.error('Error saving reward:', error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo guardar la recompensa", 
        variant: "destructive" 
      });
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta recompensa? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await orgApi(`/api/admin/rewards/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast({ 
          title: "✅ Éxito", 
          description: "Recompensa eliminada correctamente" 
        });
        fetchRewards();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error deleting reward:', error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar la recompensa", 
        variant: "destructive" 
      });
    }
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      title: reward.title,
      description: reward.description,
      cost: reward.cost,
      category: reward.category,
      rarity: reward.rarity,
      icon: reward.icon,
      is_available: reward.is_available,
      stock_limit: reward.stock_limit
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingReward(null)
    setFormData({
      title: '',
      description: '',
      cost: 0,
      category: '',
      rarity: 'common',
      icon: 'Gift',
      is_available: true,
      stock_limit: null
    })
  }

  const getStockStatus = (reward: Reward) => {
    if (!reward.stock_limit || reward.stock_limit < 0) return '∞';
    const remaining = reward.stock_limit - (reward.claimed_count || 0);
    return `${remaining}/${reward.stock_limit}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💎 Gestión de Recompensas</h1>
          <p className="text-gray-600 mt-2">
            Administra el marketplace de recompensas para tus usuarios
          </p>
        </div>
        
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Recompensa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingReward ? '✏️ Editar Recompensa' : '✨ Crear Nueva Recompensa'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: 30 Minutos Extra"
                  className="rounded-xl"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-semibold">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe la recompensa y sus beneficios..."
                  className="rounded-xl min-h-[80px]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost" className="text-sm font-semibold">
                    Costo (Gemas) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value) || 0})}
                    className="rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Ej: Tiempo, Premios"
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rarity" className="text-sm font-semibold">
                    Rareza
                  </Label>
                  <Select 
                    value={formData.rarity} 
                    onValueChange={(value: any) => setFormData({...formData, rarity: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">⚪ Común</SelectItem>
                      <SelectItem value="rare">🔵 Raro</SelectItem>
                      <SelectItem value="epic">🟣 Épico</SelectItem>
                      <SelectItem value="legendary">🟡 Legendario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="icon" className="text-sm font-semibold">
                    Icono
                  </Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({...formData, icon: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gift">🎁 Gift</SelectItem>
                      <SelectItem value="Clock">⏰ Clock</SelectItem>
                      <SelectItem value="Target">🎯 Target</SelectItem>
                      <SelectItem value="Zap">⚡ Zap</SelectItem>
                      <SelectItem value="Star">⭐ Star</SelectItem>
                      <SelectItem value="Package">📦 Package</SelectItem>
                      <SelectItem value="Trophy">🏆 Trophy</SelectItem>
                      <SelectItem value="Sparkles">✨ Sparkles</SelectItem>
                      <SelectItem value="Crown">👑 Crown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="stock_limit" className="text-sm font-semibold">
                  Límite de Stock
                </Label>
                <Input
                  id="stock_limit"
                  type="number"
                  min="-1"
                  value={formData.stock_limit ?? ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    stock_limit: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="Dejar vacío o -1 para ilimitado"
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">
                  -1 o vacío = ilimitado
                </p>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                />
                <div>
                  <Label htmlFor="is_available" className="text-sm font-semibold cursor-pointer">
                    Recompensa Disponible
                  </Label>
                  <p className="text-xs text-gray-500">
                    Los usuarios podrán canjear esta recompensa
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
                >
                  {editingReward ? '💾 Actualizar' : '✨ Crear'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{rewards.length}</p>
                <p className="text-sm text-red-100 mt-1">Total Recompensas</p>
              </div>
              <Gift className="h-12 w-12 text-red-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {rewards.filter(r => r.is_available).length}
                </p>
                <p className="text-sm text-green-100 mt-1">Disponibles</p>
              </div>
              <Star className="h-12 w-12 text-green-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {rewards.reduce((sum, r) => sum + (r.claimed_count || 0), 0)}
                </p>
                <p className="text-sm text-amber-100 mt-1">Canjeadas</p>
              </div>
              <Trophy className="h-12 w-12 text-amber-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {rewards.length > 0 ? Math.round(rewards.reduce((sum, r) => sum + r.cost, 0) / rewards.length) : 0}
                </p>
                <p className="text-sm text-pink-100 mt-1">Costo Promedio</p>
              </div>
              <Sparkles className="h-12 w-12 text-pink-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards List */}
      <Card className="bg-white border-0 rounded-3xl shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-red-500" />
            Recompensas Configuradas ({rewards.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {rewards.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Gift className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay recompensas configuradas
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primera recompensa para comenzar a premiar a tus usuarios
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Recompensa
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {rewards.map((reward) => {
                const IconComponent = iconMap[reward.icon as keyof typeof iconMap] || Gift
                const stockStatus = getStockStatus(reward);
                const isLowStock = reward.stock_limit && reward.stock_limit > 0 && 
                  (reward.stock_limit - (reward.claimed_count || 0)) <= 3;
                
                return (
                  <div 
                    key={reward.id}
                    className={`relative flex items-center justify-between p-5 border-2 rounded-2xl hover:shadow-lg transition-all ${
                      reward.is_available 
                        ? 'border-gray-200 bg-white' 
                        : 'border-gray-300 bg-gray-50 opacity-75'
                    }`}
                  >
                    {/* Status Badge */}
                    {!reward.is_available && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                          No Disponible
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        reward.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        reward.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                        reward.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        'bg-gradient-to-br from-gray-300 to-gray-500'
                      }`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {reward.title}
                          </h3>
                          <Badge className={`${rarityColors[reward.rarity]} text-xs`}>
                            {rarityLabels[reward.rarity]}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {reward.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 font-semibold text-red-600">
                            <Sparkles className="h-4 w-4" />
                            {reward.cost} gemas
                          </span>
                          
                          <span className="text-gray-500">
                            📁 {reward.category}
                          </span>
                          
                          <span className={`flex items-center gap-1 ${isLowStock ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                            <Package className="h-4 w-4" />
                            Stock: {stockStatus}
                          </span>
                          
                          <span className="text-gray-500">
                            🎯 {reward.claimed_count || 0} canjeadas
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(reward)}
                        className="rounded-xl hover:bg-blue-50 border-blue-200"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(reward.id)}
                        className="rounded-xl hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
