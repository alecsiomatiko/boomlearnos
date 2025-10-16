'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { User, Building2, Edit, Save, X, Camera, Upload } from "lucide-react"
import { ImageUploader } from "@/components/ui/image-uploader"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  bio?: string
  city?: string
  profileImage?: string
  organization: {
    companyName: string
    businessType: string
    companySize: string
    businessDescription: string
    targetAudience?: string
  }
}

export default function PerfilPage() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile()
    }
  }, [user?.id])

  const fetchUserProfile = async () => {
    try {
      // Usar el ID del usuario autenticado
      const userId = user?.id
      if (!userId) {
        console.error('No se encontró ID de usuario')
        return
      }

      console.log('🔍 [PERFIL] Obteniendo perfil para userId:', userId)
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      // Usar el ID del usuario autenticado
      const userId = user?.id
      if (!userId) {
        throw new Error('No se encontró ID de usuario')
      }

      console.log('💾 [PERFIL] Guardando perfil para userId:', userId)
      const response = await fetch(`/api/user/profile?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, userId })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Perfil actualizado",
          description: "Los cambios se guardaron correctamente",
        })
        setIsEditing(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Perfil no encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              No se pudo cargar la información del perfil
            </p>
            <Button onClick={fetchUserProfile} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
          <p className="text-gray-600">Gestiona tu información personal y empresarial</p>
        </div>
        <div className="flex gap-2">
          {/* Botón Logout */}
          <Button
            variant="outline"
            onClick={logout}
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            Cerrar sesión
          </Button>
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-500 hover:bg-red-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-red-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de Perfil */}
          <div className="flex justify-center pb-6 border-b">
            <ImageUploader
              currentImage={profile.profileImage}
              onImageChange={(imageUrl) => setProfile(prev => prev ? {...prev, profileImage: imageUrl} : null)}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile(prev => prev ? {...prev, firstName: e.target.value} : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile(prev => prev ? {...prev, lastName: e.target.value} : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                placeholder="Ej: +1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Posición en la empresa</Label>
              <Input
                id="position"
                value={profile.position || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, position: e.target.value} : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                placeholder="Ej: CEO, Fundador, Director General"
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={profile.city || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Descripción profesional</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Cuéntanos sobre tu experiencia y rol..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Nombre de la empresa</Label>
              <Input
                id="companyName"
                value={profile.organization.companyName}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  organization: {...prev.organization, companyName: e.target.value}
                } : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="businessType">Tipo de negocio</Label>
              <Input
                id="businessType"
                value={profile.organization.businessType}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  organization: {...prev.organization, businessType: e.target.value}
                } : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companySize">Tamaño de la empresa</Label>
            <Input
              id="companySize"
              value={profile.organization.companySize}
              onChange={(e) => setProfile(prev => prev ? {
                ...prev, 
                organization: {...prev.organization, companySize: e.target.value}
              } : null)}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>

          <div>
            <Label htmlFor="businessDescription">Descripción del negocio</Label>
            <Textarea
              id="businessDescription"
              value={profile.organization.businessDescription}
              onChange={(e) => setProfile(prev => prev ? {
                ...prev, 
                organization: {...prev.organization, businessDescription: e.target.value}
              } : null)}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              rows={3}
            />
          </div>

          {profile.organization.targetAudience && (
            <div>
              <Label htmlFor="targetAudience">Audiencia objetivo</Label>
              <Textarea
                id="targetAudience"
                value={profile.organization.targetAudience}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  organization: {...prev.organization, targetAudience: e.target.value}
                } : null)}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
