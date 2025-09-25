"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Sparkles, Building, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface PendingOrganization {
  id: string
  name: string
  business_type: string
  description: string
  target_audience: string
  unique_value: string
  current_goals: string
  main_challenges: string
  identity_status: string
  ai_generation_failed: boolean
  ai_error_message: string | null
  created_at: string
}

export default function PendingIdentityCard() {
  const [pendingOrgs, setPendingOrgs] = useState<PendingOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingOrganizations()
  }, [])

  const fetchPendingOrganizations = async () => {
    try {
      // Usar la misma estrategia que el perfil - obtener datos del usuario más reciente
      const response = await fetch('/api/dashboard/pending-organizations')
      const result = await response.json()
      
      if (result.success) {
        setPendingOrgs(result.pendingOrganizations)
      }
    } catch (error) {
      console.error('Error fetching pending organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateIdentity = async (orgId: string) => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/dashboard/generate-pending-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId: orgId }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "¡Identidad Generada!",
          description: "La identidad organizacional ha sido creada exitosamente con IA.",
        })
        
        // Actualizar la lista
        await fetchPendingOrganizations()
      } else {
        if (result.canGenerateManually) {
          toast({
            title: "IA No Disponible",
            description: "Puedes crear la identidad manualmente desde el panel de control.",
            variant: "default",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "No se pudo generar la identidad",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al generar la identidad",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full bg-orange-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-orange-700">Verificando identidades pendientes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pendingOrgs.length === 0) {
    return null // No mostrar nada si no hay organizaciones pendientes
  }

  return (
    <div className="space-y-4">
      {pendingOrgs.map((org) => (
        <Card key={org.id} className="w-full bg-orange-50 border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-800">Identidad Pendiente</CardTitle>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
              </Badge>
            </div>
            <CardDescription className="text-orange-700">
              La identidad organizacional de <strong>{org.name}</strong> está esperando ser generada con IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-orange-700">
                <Building className="h-4 w-4" />
                <span><strong>Tipo:</strong> {org.business_type}</span>
              </div>
              
              <div className="text-sm text-orange-700">
                <strong>Descripción:</strong> {org.description}
              </div>

              {org.ai_generation_failed && org.ai_error_message && (
                <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Último error:</strong> {org.ai_error_message}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => handleGenerateIdentity(org.id)}
                  disabled={generating}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar con IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
