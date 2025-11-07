# API Routes

Endpoints del backend construidos con Next.js 14 App Router.

## Estructura

```
app/api/
├── auth/              # Autenticación (login, register, logout)
├── user/              # Gestión de usuarios y perfiles
├── diagnostic/        # Diagnóstico (guardar/cargar respuestas)
├── diagnostics/       # Overview y análisis completos
├── onboarding/        # Flujo de onboarding
├── messages/          # Sistema de mensajería
├── metrics/           # KPIs y métricas del dashboard
├── team/              # Gestión de equipos
├── admin/             # Endpoints administrativos
└── [otros]/           # Otros endpoints
```

## Principales Endpoints

### Autenticación

**POST /api/auth/login**
- Autenticar usuario con email/password
- Retorna: usuario + JWT token
- Ver: `app/api/auth/login/route.ts`

**POST /api/auth/register**
- Registrar nuevo usuario (requiere código de acceso)
- Retorna: usuario + JWT token para auto-login
- Ver: `app/api/auth/register/route.ts`

### Diagnóstico

**POST /api/diagnostic/save-responses**
- Guardar respuestas del diagnóstico (individual o por lotes)
- Multi-tenant (requiere organizationId)
- Retorna: estadísticas de guardado y progreso
- Ver: `app/api/diagnostic/save-responses/route.ts`

**GET /api/diagnostic/user-responses**
- Obtener todas las respuestas del usuario
- Query params: `userId`, `organizationId`
- Ver: `app/api/diagnostic/user-responses/route.ts`

### Mensajería

**GET /api/messages**
- Listar conversaciones del usuario
- Multi-tenant

**POST /api/messages**
- Enviar mensaje o crear conversación
- Ver: `app/api/messages/route.ts`

### Métricas

**GET /api/metrics**
- Obtener KPIs y métricas del dashboard
- Query params: `userId`, `period` (week|month|year)
- Ver: `app/api/metrics/route.ts`

## Convenciones de Archivos

Next.js 14 App Router usa una estructura de carpetas específica:

```
app/api/recurso/
├── route.ts           # GET, POST, PUT, DELETE, PATCH
└── [id]/
    └── route.ts       # Rutas dinámicas
```

### Ejemplo de route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

// GET /api/ejemplo
export async function GET(request: NextRequest) {
  return NextResponse.json({ data: 'ejemplo' });
}

// POST /api/ejemplo
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ success: true, body });
}
```

## Patterns Comunes

### Multi-Tenancy
Todos los endpoints que manejan datos de usuarios deben filtrar por `organization_id`:

```typescript
const { searchParams } = new URL(request.url);
const organizationId = searchParams.get('organizationId');

const data = await executeQuery(
  'SELECT * FROM tabla WHERE organization_id = ?',
  [organizationId]
);
```

### Autenticación JWT
Endpoints protegidos deben validar el token:

```typescript
import { getCurrentUser } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  // continuar...
}
```

### Validación de Datos
Valida siempre los datos de entrada:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const requiredFields = ['userId', 'data'];
  const missing = requiredFields.filter(f => !body[f]);
  
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Campos faltantes: ${missing.join(', ')}` },
      { status: 400 }
    );
  }
  
  // continuar...
}
```

### Manejo de Errores
Usa try/catch y retorna errores con status apropiados:

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## HTTP Status Codes

Usa los códigos correctos:

- **200 OK** - Éxito general
- **201 Created** - Recurso creado
- **400 Bad Request** - Validación fallida
- **401 Unauthorized** - Sin autenticación
- **403 Forbidden** - Sin permisos
- **404 Not Found** - Recurso no existe
- **500 Internal Server Error** - Error del servidor

## Base de Datos

Las queries a MySQL se hacen con `executeQuery` de `@/lib/server/mysql`:

```typescript
import { executeQuery } from '@/lib/server/mysql';

const users = await executeQuery(
  'SELECT * FROM users WHERE id = ?',
  [userId]
) as any[];
```

## Testing

Para testear endpoints:

```bash
# Usando curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"pass123"}'

# Usando Postman o Thunder Client (VS Code extension)
```

## Documentar Nuevos Endpoints

Cuando crees un endpoint nuevo, documenta al inicio del archivo:

```typescript
/**
 * POST /api/mi-endpoint
 * 
 * Descripción de qué hace el endpoint
 * 
 * Request Body:
 * {
 *   "campo": "valor"
 * }
 * 
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": {}
 * }
 */
export async function POST(request: NextRequest) {
  // ...
}
```
