'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, User, Camera } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ImageUploaderProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  disabled?: boolean
}

export function ImageUploader({ currentImage, onImageChange, disabled = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('image', file)

      // Subir imagen a la API
      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        const imageUrl = result.imageUrl
        setPreviewUrl(imageUrl)
        onImageChange(imageUrl)
        
        toast({
          title: "Imagen subida",
          description: "Tu foto de perfil se actualizó correctamente",
        })
      } else {
        throw new Error(result.error || 'Error subiendo imagen')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl('')
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>Foto de perfil</Label>
      
      {/* Preview de la imagen */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {previewUrl && !disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {previewUrl ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={disabled || isUploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? 'Subiendo...' : 'Seleccionar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Input oculto para seleccionar archivo */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <p className="text-xs text-gray-500">
        Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
      </p>
    </div>
  )
}
