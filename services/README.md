# Services

Los services contienen la lógica de negocio y las llamadas a APIs externas. Actúan como capa intermedia entre los componentes y los endpoints del backend.

## Services Disponibles

### Autenticación
- **`user-service.ts`** - Login, registro y gestión de sesiones. Maneja tokens JWT y normaliza datos del usuario.

### OpenAI
- **`openai-service.ts`** - Interacción con la API de OpenAI (GPT-4). Análisis de diagnósticos, generación de recomendaciones, etc.

### Diagnóstico
- **`diagnostic-service.ts`** - CRUD de preguntas, opciones, módulos y progreso del diagnóstico. Cálculo de scores.

## Estructura de un Service

Los services generalmente exportan funciones asíncronas que:
1. Hacen fetch a un endpoint
2. Validan la respuesta
3. Retornan datos tipados o null/error

Ejemplo:

```typescript
export async function obtenerDatos(id: string): Promise<Datos | null> {
  try {
    const response = await fetch(`/api/datos/${id}`);
    const data = await response.json();
    
    if (data.success) {
      return data.datos;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    return null;
  }
}
```

## Convenciones

- Funciones en camelCase
- Siempre manejar errors con try/catch
- Retornar tipos específicos (no `any`)
- Loggear errors importantes
- No manejar UI directamente (eso va en componentes)

## Services vs Hooks

**Usa un Service cuando:**
- Necesitas hacer llamadas HTTP
- La lógica no depende de estado de React
- Quieres reutilizar la función en diferentes partes

**Usa un Hook cuando:**
- Necesitas estado (useState, useEffect)
- Quieres gestionar loading/error states
- Necesitas contexto de React (useAuth, useRouter, etc.)

A veces un hook llama a un service:

```tsx
function useDatos() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    obtenerDatos('123')
      .then(setDatos)
      .finally(() => setLoading(false));
  }, []);
  
  return { datos, loading };
}
```

## Testing

Los services son fáciles de testear porque son funciones puras sin dependencias de React. Puedes mockear el fetch y validar las respuestas.
