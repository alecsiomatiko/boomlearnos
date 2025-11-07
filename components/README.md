# Componentes

Esta carpeta contiene todos los componentes de React reutilizables del proyecto, organizados por funcionalidad.

## Estructura

```
components/
├── ui/                    # Componentes base de shadcn/ui (botones, inputs, cards, etc.)
├── admin/                 # Componentes del panel de administración
├── auth/                  # Formularios de login y registro
├── badges/                # Sistema de medallas y logros
├── dashboard/             # Componentes del dashboard principal
├── diagnostic/            # Componentes del diagnóstico básico
├── mega-diagnostic/       # Componentes del mega-diagnóstico (14 módulos)
├── onboarding/            # Pasos del wizard de onboarding
├── analysis/              # Visualización de análisis y reportes
├── animations/            # Componentes con animaciones
├── layout/                # Headers, sidebars, footers
└── [otros]/               # Componentes standalone
```

## Tipos de Componentes

### Componentes UI (ui/)
Componentes base de la librería shadcn/ui. **No los modifiques directamente** a menos que sea necesario. Si necesitas personalizarlos, créalos en otra carpeta.

Ejemplos: Button, Card, Dialog, Input, Select, etc.

### Componentes de Funcionalidad
Componentes específicos del negocio que usan los componentes UI como base.

Ejemplo:
```tsx
// components/badges/badge-card.tsx
import { Card } from '@/components/ui/card';

export function BadgeCard({ badge }) {
  return (
    <Card>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
    </Card>
  );
}
```

### Componentes de Layout
Wrappers para estructurar páginas: headers, sidebars, footers.

### Componentes de Página
Componentes grandes que componen una página completa. Generalmente no son reutilizables.

## Convenciones

### Naming
- Archivos en kebab-case: `badge-card.tsx`
- Componentes en PascalCase: `BadgeCard`
- Props interface con el mismo nombre + Props: `BadgeCardProps`

### Estructura de Archivo
```tsx
/**
 * Descripción del componente
 * 
 * @param badge - Datos de la medalla
 */

interface BadgeCardProps {
  badge: Badge;
  onClaim?: () => void;
}

export function BadgeCard({ badge, onClaim }: BadgeCardProps) {
  return (
    // JSX aquí
  );
}
```

### Props
- Usa interfaces para tipar props
- Props opcionales con `?`
- Callbacks con prefijo `on`: `onClick`, `onSubmit`, `onClaim`
- Datos con nombres descriptivos: `badge`, `user`, `questions`

### Client vs Server Components
- Por defecto, Next.js 14 usa Server Components
- Si usas hooks (useState, useEffect, etc.), agrega `"use client"` arriba
- Componentes de UI generalmente son client components

## Dónde Va Cada Componente

| Tipo | Carpeta |
|------|---------|
| Botón custom | `ui/` o crear `common/` |
| Panel del dashboard | `dashboard/` |
| Formulario de login | `auth/` |
| Card de medalla | `badges/` |
| Pregunta del diagnóstico | `diagnostic/` o `mega-diagnostic/` |
| Paso de onboarding | `onboarding/` |
| Header global | `layout/` |
| Animación de confetti | `animations/` |

## Testing

Para testear componentes usa React Testing Library o Vitest. Los componentes simples (presentacionales) son fáciles de testear. Los que tienen mucha lógica deberían extraer esa lógica a hooks o services.

## Performance

- Usa `React.memo()` solo si hay re-renders innecesarios
- `useMemo` para cálculos pesados
- `useCallback` para funciones que se pasan como props
- Lazy loading con `next/dynamic` para componentes pesados
