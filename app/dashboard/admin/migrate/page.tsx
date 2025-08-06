'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/diagnostic/migrate', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || 'Migration failed' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Migración de Datos de Diagnóstico
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Migrar Datos Demo a MySQL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Este proceso migrará todos los datos de demostración del mega-diagnóstico 
              desde los archivos TypeScript a la base de datos MySQL.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">Advertencia</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Esta operación eliminará todos los datos existentes en las tablas 
                    de diagnóstico y los reemplazará con los datos demo.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleMigration} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrando datos...
                </>
              ) : (
                'Ejecutar Migración'
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={`ml-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Migración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Módulos a migrar:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Módulo 0: Propósito de Vida y BHAG</li>
                  <li>Etapa 1: Mapeo Total del Negocio</li>
                  <li>Módulos 1-13: Diagnósticos especializados</li>
                </ul>
              </div>
              <div>
                <strong>Datos incluidos:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Módulos de diagnóstico</li>
                  <li>Submódulos</li>
                  <li>Preguntas con ponderaciones</li>
                  <li>Opciones de respuesta</li>
                  <li>Textos de retroalimentación</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}