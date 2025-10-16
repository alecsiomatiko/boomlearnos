"use client"

import { useState, useEffect } from "react"
import { useOrgApi } from "@/hooks/useOrgApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Building2, Users, MapPin, Briefcase, TrendingUp, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Department {
  id: string
  organization_id: string
  name: string
  description: string
  color: string
  active: boolean
  created_at: string
  updated_at: string
  user_count?: number
}

const predefinedColors = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Púrpura', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Índigo', value: '#6366F1' },
]

export default function DepartmentsAdmin() {
  const orgApi = useOrgApi();
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    active: true
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await orgApi('/api/admin/departments', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar departamentos');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar los departamentos", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({ 
        title: "Error", 
        description: "Por favor completa todos los campos requeridos", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const url = editingDepartment 
        ? `/api/admin/departments/${editingDepartment.id}`
        : '/api/admin/departments';
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const response = await orgApi(url, { method, body: formData });
      
      if (response.ok) {
        toast({ 
          title: "✅ Éxito", 
          description: editingDepartment 
            ? "Departamento actualizado correctamente" 
            : "Departamento creado correctamente" 
        });
        fetchDepartments();
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }
    } catch (error: any) {
      console.error('Error saving department:', error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo guardar el departamento", 
        variant: "destructive" 
      });
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este departamento? Los usuarios asignados quedarán sin departamento.')) {
      return;
    }
    
    try {
      const response = await orgApi(`/api/admin/departments/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast({ 
          title: "✅ Éxito", 
          description: "Departamento eliminado correctamente" 
        });
        fetchDepartments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo eliminar el departamento", 
        variant: "destructive" 
      });
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description,
      color: department.color,
      active: department.active
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingDepartment(null)
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      active: true
    })
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
          <h1 className="text-3xl font-bold text-gray-900">🏢 Gestión de Departamentos</h1>
          <p className="text-gray-600 mt-2">
            Organiza tu equipo en departamentos y áreas funcionales
          </p>
        </div>
        
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Departamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingDepartment ? '✏️ Editar Departamento' : '✨ Crear Nuevo Departamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold">
                  Nombre del Departamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Marketing, Ventas, Desarrollo, RRHH"
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
                  placeholder="Describe las responsabilidades y funciones del departamento..."
                  className="rounded-xl min-h-[100px]"
                  required
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Color Identificativo
                </Label>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {predefinedColors.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: colorOption.value})}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        formData.color === colorOption.value 
                          ? 'border-gray-900 ring-2 ring-gray-300' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded-lg"
                        style={{ backgroundColor: colorOption.value }}
                      />
                      <p className="text-xs text-center mt-2 font-medium">{colorOption.name}</p>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-20 h-12 border border-gray-300 rounded-xl cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#3B82F6"
                      className="rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
                <div>
                  <Label htmlFor="active" className="text-sm font-semibold cursor-pointer">
                    Departamento Activo
                  </Label>
                  <p className="text-xs text-gray-500">
                    Los departamentos inactivos no aparecerán en los formularios
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl"
                >
                  {editingDepartment ? '💾 Actualizar' : '✨ Crear'}
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
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{departments.length}</p>
                <p className="text-sm text-blue-100 mt-1">Total Departamentos</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {departments.filter(d => d.active).length}
                </p>
                <p className="text-sm text-green-100 mt-1">Activos</p>
              </div>
              <MapPin className="h-12 w-12 text-green-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {departments.reduce((sum, d) => sum + (d.user_count || 0), 0)}
                </p>
                <p className="text-sm text-red-100 mt-1">Empleados Asignados</p>
              </div>
              <Users className="h-12 w-12 text-red-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 rounded-3xl shadow-lg text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {departments.filter(d => !d.active).length}
                </p>
                <p className="text-sm text-amber-100 mt-1">Inactivos</p>
              </div>
              <Briefcase className="h-12 w-12 text-amber-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments List */}
      <Card className="bg-white border-0 rounded-3xl shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Departamentos Configurados ({departments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {departments.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay departamentos configurados
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primer departamento para comenzar a organizar tu equipo
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Departamento
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {departments.map((department) => {
                const userCount = department.user_count || 0;
                
                return (
                  <div 
                    key={department.id}
                    className={`relative flex items-center justify-between p-5 border-2 rounded-2xl hover:shadow-lg transition-all ${
                      department.active 
                        ? 'border-gray-200 bg-white' 
                        : 'border-gray-300 bg-gray-50 opacity-75'
                    }`}
                  >
                    {/* Status Badge */}
                    {!department.active && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                          Inactivo
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon with color */}
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{ 
                          backgroundColor: `${department.color}15`,
                          border: `2px solid ${department.color}30`
                        }}
                      >
                        <Building2 
                          className="h-8 w-8" 
                          style={{ color: department.color }} 
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {department.name}
                          </h3>
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: department.color }}
                            title={department.color}
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {department.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {department.active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              ✓ Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                              ○ Inactivo
                            </Badge>
                          )}
                          
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            {userCount} {userCount === 1 ? 'empleado' : 'empleados'}
                          </span>
                          
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(department.created_at).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(department)}
                        className="rounded-xl hover:bg-blue-50 border-blue-200"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(department.id)}
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
