# Hooks Personalizados

Esta carpeta contiene los custom hooks de React para reutilizar lógica en diferentes componentes.

## Hooks Disponibles

### Autenticación y Usuario
- **`use-response-manager.ts`** - Maneja guardado y carga de respuestas del diagnóstico. Incluye auto-guardado individual y guardado por lotes de módulos completos.

### Diagnóstico
- **`use-diagnostic.ts`** - Lógica completa para un módulo del diagnóstico (preguntas, navegación, guardado de respuestas, progreso).
- **`use-module-ai-analysis.ts`** - Genera y obtiene análisis con IA (GPT-4) para módulos específicos del diagnóstico.

### API y Data Fetching
- **`useOrgApi.ts`** - Helper para hacer requests multi-tenant. Agrega automáticamente el organization_id del usuario logueado a todas las peticiones.

### UI y Animaciones
- **`use-badge-physics.tsx`** - Animaciones físicas para badges/medallas (rebote, gravedad, etc.).
- **`use-elastic-box-physics.tsx`** - Animaciones elásticas para cajas/cards.
- **`use-mobile.ts`** - Detecta si el usuario está en mobile o desktop.
- **`use-toast.ts`** - Sistema de notificaciones toast (ya viene de shadcn/ui).

## Cómo Usar un Hook

```tsx
import { useResponseManager } from '@/hooks/use-response-manager';

function MiComponente() {
  const { saveModuleResponses, isSaving } = useResponseManager();
  
  const handleSave = async () => {
    const result = await saveModuleResponses('MOD2', respuestas);
    if (result.success) {
      console.log('Guardado exitoso');
    }
  };
  
  return (
    <button onClick={handleSave} disabled={isSaving}>
      {isSaving ? 'Guardando...' : 'Guardar'}
    </button>
  );
}
```

## Convenciones

- Los hooks siempre empiezan con `use` (regla de React)
- Hooks de UI terminan en `.tsx`, hooks de lógica en `.ts`
- Cada hook debe estar bien documentado con JSDoc
- Los hooks deben ser genéricos y reutilizables

## Cuándo Crear un Nuevo Hook

Crea un hook personalizado cuando:
- La misma lógica se repite en múltiples componentes
- Necesitas manejar estado complejo relacionado con un feature
- Quieres separar lógica de negocio de UI
- Necesitas side effects (useEffect) que se reutilizan

No crees un hook si:
- Solo lo vas a usar en un componente
- Es muy simple (mejor usa useState directamente)
- Ya existe un hook de terceros que hace lo mismo
