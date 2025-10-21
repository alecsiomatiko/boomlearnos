"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"

interface AccessCodeInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export function AccessCodeInput({ value, onChange, onValidationChange }: AccessCodeInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [validationMessage, setValidationMessage] = useState('')

  useEffect(() => {
    if (value.length === 9) {
      validateCode(value)
    } else {
      setValidationStatus('idle')
      setValidationMessage('')
      onValidationChange?.(false)
    }
  }, [value])

  const validateCode = async (code: string) => {
    setIsValidating(true)
    try {
      const response = await fetch("/api/access-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        setValidationStatus('valid')
        setValidationMessage('✅ Código válido')
        onValidationChange?.(true)
      } else {
        const error = await response.json()
        setValidationStatus('invalid')
        setValidationMessage(error.error || 'Código inválido')
        onValidationChange?.(false)
      }
    } catch (error) {
      setValidationStatus('invalid')
      setValidationMessage('Error al validar código')
      onValidationChange?.(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (inputValue.length <= 9) {
      onChange(inputValue)
    }
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (validationStatus === 'valid') {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (validationStatus === 'invalid') {
      return <X className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getStatusColor = () => {
    if (validationStatus === 'valid') return 'border-green-500'
    if (validationStatus === 'invalid') return 'border-red-500'
    return 'border-gray-300 focus:border-red-500'
  }

  return (
    <div className="space-y-2">
      <label htmlFor="accessCode" className="block text-gray-800 text-sm font-medium">
        Código de Acceso <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id="accessCode"
          name="accessCode"
          type="text"
          placeholder="ALPHA1234"
          required
          value={value}
          onChange={handleChange}
          className={`w-full bg-transparent border-0 border-b rounded-none px-0 py-3 pr-8 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 text-base font-mono tracking-wider ${getStatusColor()}`}
        />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      {validationMessage && (
        <p className={`text-xs ${validationStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
          {validationMessage}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Formato: 5 letras + 4 números (ej: ALPHA1234)
      </p>
    </div>
  )
}