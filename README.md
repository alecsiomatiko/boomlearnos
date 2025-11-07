# BoomLearnOS

Plataforma de gestión organizacional con diagnósticos inteligentes, gamificación y análisis con IA.

> **TL;DR**: Es como un CRM pero para gestionar tu equipo completo, con diagnósticos que te dicen qué onda con tu negocio y un sistema de recompensas para mantener al equipo motivado.

## ¿Qué hace esto?

BoomLearnOS es una plataforma web que te ayuda a:

- **Diagnosticar tu negocio**: 14 módulos diferentes (finanzas, marketing, operaciones, etc.) con preguntas que revelan en qué estás bien y en qué necesitas mejorar
- **Análisis con IA**: GPT-4 analiza todas las respuestas y te genera un plan estratégico personalizado
- **Gamificación**: Sistema de gemas, medallas y logros para que tu equipo se motive haciendo tareas
- **Gestión de equipo**: Departamentos, roles, permisos y todo lo que necesitas para organizar gente
- **Mensajería interna**: Chat entre usuarios de la misma organización
- **Dashboard**: Métricas, gráficas y KPIs en tiempo real
- **Sistema de tareas**: Asigna tareas, da seguimiento y recompensa al completarlas
- **Multi-organización**: Cada empresa tiene su propio espacio con sus datos

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de datos**: MySQL 8.0
- **Auth**: JWT (JSON Web Tokens)
- **IA**: OpenAI GPT-4
- **Charts**: Chart.js + react-chartjs-2
- **Package Manager**: pnpm

## Requisitos

Antes de empezar, asegúrate de tener:

- **Node.js** 18+ (recomendado: 20 o 22) - [Descargar aquí](https://nodejs.org/)
- **pnpm** 8+ - Instalar con: `npm install -g pnpm`
- **MySQL** 8.0+ (puede ser local, Hostinger, PlanetScale, etc.)
- **Git** (obvio)
- **Cuenta de OpenAI** con API key (opcional, pero sin esto no jala el análisis IA)

## Instalación Rápida

### 1. Clona el repo

```bash
git clone https://github.com/alecsiomatiko/boomlearnos.git
cd boomlearnos
```

### 2. Instala las dependencias

```bash
pnpm install
```

Si no tienes `pnpm`, instálalo primero:
```bash
npm install -g pnpm
```

### 3. Configura las variables de entorno

Copia el archivo de ejemplo y llénalo con tus datos:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos MySQL
DB_HOST=srv440.hstgr.io                    # Tu servidor MySQL
DB_USER=u191251575_BoomlearnOS             # Usuario de la BD
DB_PASSWORD=TuPasswordSuperSecreta123      # Contraseña (no la subas a Git!)
DB_NAME=u191251575_BoomlearnOS             # Nombre de la base de datos
DB_PORT=3306                                # Puerto (generalmente 3306)

# OpenAI para el análisis con IA
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx      # Tu API key de OpenAI

# JWT Secret (para autenticación)
JWT_SECRET=un_string_super_random_y_largo_aqui_123456789
NEXT_PUBLIC_JWT_SECRET=el_mismo_string_de_arriba

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000  # URL del API (en producción cambiar)
```

**IMPORTANTE**: Nunca subas el archivo `.env` a Git. Ya está en el `.gitignore` pero por si acaso.

### 4. Configura la base de datos

Tienes dos opciones:

#### Opción A: Usando el schema completo (recomendado)

```bash
mysql -u tu_usuario -p tu_base_datos < database/production-schema.sql
```

#### Opción B: Ejecutar scripts individuales

```bash
# 1. Tablas base (users, organizations, etc.)
mysql -u tu_usuario -p tu_base_datos < database/create-base-tables.sql

# 2. Tablas del diagnóstico
mysql -u tu_usuario -p tu_base_datos < database/create-user-diagnostics-table.sql
mysql -u tu_usuario -p tu_base_datos < database/create-user-responses-table.sql

# 3. Sistema de recompensas
mysql -u tu_usuario -p tu_base_datos < database/create-badges-rewards-tables.sql

# 4. Mensajería
mysql -u tu_usuario -p tu_base_datos < database/create-messages-tables.sql

# 5. Códigos de acceso
mysql -u tu_usuario -p tu_base_datos < database/create-access-codes-table.sql
```

### 5. (Opcional) Carga datos de prueba

Si quieres tener usuarios y datos de ejemplo:

```bash
node scripts/seed-database.js
```

### 6. Arranca el servidor de desarrollo

```bash
pnpm dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

### 7. Crea tu primer usuario admin

1. Ve a `/register`
2. Usa un código de acceso válido (créalo en la BD o genera uno con el script)
3. Llena el onboarding
4. Listo, ya tienes acceso al dashboard

## Estructura del Proyecto

```
boomlearnos/
├── app/                        # Next.js 14 App Router (donde vive todo)
│   ├── api/                   # API Routes (el backend)
│   │   ├── auth/             # Login, registro, logout
│   │   ├── diagnostic/       # Mega diagnóstico (guardar/cargar respuestas)
│   │   ├── diagnostics/      # Overview y análisis IA
│   │   ├── messages/         # Sistema de mensajería
│   │   ├── metrics/          # KPIs y métricas del dashboard
│   │   ├── onboarding/       # Flujo de onboarding de nuevos usuarios
│   │   ├── team/             # Gestión de equipos y departamentos
│   │   └── user/             # Perfil, gemas, badges, etc.
│   ├── admin/                 # Panel de administración
│   ├── dashboard/             # Dashboard principal del usuario
│   ├── onboarding/            # Wizard de onboarding (multi-step)
│   ├── login/                 # Página de login
│   ├── register/              # Registro de nuevos usuarios
│   └── layout.tsx             # Layout principal
│
├── components/                 # Componentes React reutilizables
│   ├── admin/                # Componentes del panel admin
│   ├── auth/                 # Formularios de login/register
│   ├── badges/               # Sistema de medallas y logros
│   ├── dashboard/            # Componentes del dashboard
│   ├── diagnostic/           # Componentes del mega diagnóstico
│   ├── mega-diagnostic/      # Mega diagnostic UI (módulos, preguntas)
│   ├── onboarding/           # Pasos del onboarding
│   ├── ui/                   # shadcn/ui components (botones, cards, etc.)
│   └── ...                   # Otros componentes útiles
│
├── contexts/                   # React Contexts (estado global)
│   └── auth-context.tsx      # Contexto de autenticación
│
├── hooks/                      # Custom hooks
│   ├── use-response-manager.ts    # Guardar/cargar respuestas del diagnóstico
│   ├── use-diagnostic.ts          # Lógica del diagnóstico
│   ├── use-module-ai-analysis.ts  # Análisis IA por módulo
│   ├── use-badge-physics.tsx      # Animaciones de badges
│   └── useOrgApi.ts               # Helper para llamadas API con org_id
│
├── lib/                        # Utilidades y helpers
│   ├── server/               # Código que solo se ejecuta en el servidor
│   │   ├── mysql.ts         # Pool de conexiones MySQL
│   │   ├── auth.ts          # Helpers de autenticación
│   │   └── org-utils.ts     # Utilidades de organizaciones
│   ├── auth-utils.ts         # authFetch y getAuthHeaders
│   ├── openai-client.ts      # Cliente de OpenAI
│   └── utils.ts              # cn() y otras utilidades generales
│
├── services/                   # Services (lógica de negocio)
│   ├── user-service.ts       # Autenticación y registro
│   ├── openai-service.ts     # Llamadas a OpenAI
│   └── ...
│
├── types/                      # TypeScript types/interfaces
│   ├── user.ts               # AuthUser, User, RegisterData
│   ├── mega-diagnostic.ts    # Tipos del diagnóstico
│   ├── mysql.ts              # Tipos seguros para cliente
│   └── ...
│
├── database/                   # Schemas SQL y migraciones
│   ├── production-schema.sql # Schema completo de producción
│   ├── create-*.sql          # Scripts individuales de creación
│   └── ...
│
├── scripts/                    # Scripts de utilidad
│   ├── migrate-*.js          # Migraciones de datos
│   ├── seed-database.js      # Datos de prueba
│   └── ...
│
├── public/                     # Assets estáticos
│   └── images/               # Imágenes, íconos, mascota, etc.
│
├── .env                        # Variables de entorno (NO SUBIR A GIT)
├── .env.example                # Template de variables de entorno
├── package.json                # Dependencias del proyecto
├── pnpm-lock.yaml              # Lock file de pnpm
├── next.config.mjs             # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Este archivo
```

### Carpetas importantes

- **`/app/api/`**: Todos los endpoints del backend. Cada carpeta es una ruta (ejemplo: `/api/auth/login/route.ts` → `POST /api/auth/login`)
- **`/components/`**: Componentes reutilizables. Los de `ui/` son de shadcn, no los toques mucho
- **`/hooks/`**: Custom hooks para lógica compartida. Úsalos en lugar de duplicar código
- **`/lib/server/`**: Código que **solo** se ejecuta en el servidor (importar en API routes, no en componentes cliente)
- **`/types/`**: Todas las interfaces TypeScript. Define aquí antes de usar `any`
- **`/database/`**: Schemas SQL. Si cambias la BD, actualiza `production-schema.sql`

## Scripts Disponibles

```bash
# Desarrollo (con hot reload)
pnpm dev

# Build para producción
pnpm build

# Iniciar en producción (después de build)
pnpm start

# Linter (por ahora no hace nada, pero está configurado)
pnpm lint

# Tests (pendiente configurar)
pnpm test
```

## Funcionalidades Principales

### Mega Diagnóstico

Sistema de evaluación empresarial con **14 módulos** que cubren todas las áreas:

| Módulo | Área | Preguntas |
|--------|------|-----------|
| MOD0 | Visión y Liderazgo | 10 |
| MOD1 | Cultura Organizacional | 10 |
| MOD2 | Comunicación Interna | 10 |
| MOD3 | Gestión del Talento | 10 |
| MOD4 | Planificación Estratégica | 10 |
| MOD5 | Marketing y Ventas | 10 |
| MOD6 | Finanzas | 10 |
| MOD7 | Operaciones | 10 |
| MOD8 | Tecnología e Innovación | 10 |
| MOD9 | Atención al Cliente | 10 |
| MOD10 | Sostenibilidad | 10 |
| MOD11 | Gestión de Riesgos | 10 |
| MOD12 | Responsabilidad Social | 10 |
| MOD13 | Transformación Digital | 10 |

**Total: 140 preguntas** que mapean el estado completo de tu organización.

Cada respuesta se pondera y al final GPT-4 genera:
- Puntuación por módulo (0-100)
- Gráficas de radar con tus fortalezas/debilidades
- Recomendaciones personalizadas
- Plan estratégico de mejora

### Sistema de Recompensas

**Gemas**: Moneda virtual que ganas por:
- Completar módulos del diagnóstico (+50)
- Hacer tareas asignadas (+10-50 según complejidad)
- Check-in diario (+5)
- Logros desbloqueados (variable)

**Medallas**: Se otorgan automáticamente por:
- Primera vez completando un módulo
- Racha de días consecutivos
- Cantidad de gemas acumuladas
- Tareas completadas en tiempo récord

**Logros**: Achievement system tipo Xbox:
- "Primer Paso" - Completar el onboarding
- "Analista" - Terminar todos los módulos
- "Dedicado" - 7 días de racha
- Y muchos más...

### Gestión de Equipos

- **Departamentos**: Crea departamentos con colores personalizados
- **Roles**: Admin, User, Manager (con permisos diferentes)
- **Asignación de tareas**: Delega tareas y da seguimiento
- **Multi-organización**: Cada empresa tiene su espacio aislado

### Mensajería Interna

Chat en tiempo real entre usuarios de la misma organización:
- Conversaciones 1 a 1
- Notificaciones de mensajes no leídos
- Historial completo
- Avatares y perfiles

### Dashboard con Métricas

- Tareas completadas vs pendientes
- Progreso del diagnóstico
- Gemas ganadas
- Racha de días activos
- Gráficas de desempeño del equipo

## Primer Uso

Después de instalar, necesitas crear un código de acceso:

```sql
INSERT INTO access_codes (code, created_by_admin_id, is_used) 
VALUES ('DEMO2024', NULL, FALSE);
```

Luego:
1. Ve a `http://localhost:3000/register`
2. Usa el código `DEMO2024`
3. Llena el formulario de registro
4. Completa el onboarding (3 pasos)
5. Ya tienes acceso al dashboard

## Problemas Comunes

### "Error: connect ETIMEDOUT"

Tu base de datos no responde. Checklist:
- El `DB_HOST` en `.env` es correcto?
- Tu IP está en la whitelist de Hostinger?
- Las credenciales son correctas?
- El puerto es 3306?

**Fix rápido**: Prueba conectarte con MySQL Workbench o CLI primero.

### "Module not found: Can't resolve '@/...'"

Los alias de TypeScript no están siendo reconocidos. 

**Fix**:
```bash
rm -rf node_modules .next
pnpm install
pnpm dev
```

### "Error: Invalid token"

Tu JWT expiró o es inválido.

**Fix**: Logout y vuelve a hacer login. El token se renueva automáticamente.

### "Usuario sin organización activa"

El usuario no tiene una organización asignada (probablemente no completó el onboarding).

**Fix**: Completa el onboarding o asigna manualmente una org en la BD:
```sql
UPDATE users 
SET organization_id = 'tu-org-id' 
WHERE id = 'user-id';
```

### Errores de tipo en TypeScript

**Fix**:
```bash
pnpm build  # Regenera los tipos
```

## Documentación Adicional

Cada feature tiene su propio archivo `.md` en la raíz con documentación detallada:

- `MEGA_DIAGNOSTIC_COMPLETE_REPORT.md` - Toda la info del diagnóstico
- `REWARDS_SYSTEM.md` - Sistema de gemas, medallas y logros
- `DEPARTMENTS_SYSTEM.md` - Cómo funcionan los departamentos  
- `USER_MANAGEMENT_SYSTEM.md` - Gestión de usuarios y roles
- `ACHIEVEMENTS_SYSTEM.md` - Sistema de achievements
- `ONBOARDING_IMPLEMENTATION.md` - Flujo de onboarding
- `MIGRATION-REPORT.md` - Historial de migraciones de BD

## Contribuir

Si quieres agregar features o arreglar bugs:

1. Fork el repo
2. Crea una rama descriptiva: `git checkout -b feature/sistema-de-notificaciones`
3. Haz commits con mensajes claros: `git commit -am 'feat: agregar notificaciones push'`
4. Push a tu fork: `git push origin feature/sistema-de-notificaciones`
5. Abre un Pull Request explicando qué hiciste y por qué

**Convención de commits**:
- `feat:` - Nueva funcionalidad
- `fix:` - Bug fix
- `docs:` - Cambios en documentación
- `style:` - Formato, no afecta código
- `refactor:` - Refactorización de código
- `test:` - Agregar tests
- `chore:` - Mantenimiento general

## Seguridad

- Passwords hasheados con bcrypt (10 rounds)
- Autenticación con JWT
- Validación de roles en cada endpoint
- Multi-tenancy: cada org solo ve sus datos
- Sanitización de inputs (previene SQL injection)

**Importante**: Nunca subas tu `.env` a Git. Las credenciales de producción deben estar en tu servidor.

## Licencia

Este proyecto es **privado** y propiedad de BoomLearnOS. 

No distribuir ni usar sin autorización expresa.

## Necesitas Ayuda?

1. Revisa los archivos `.md` en la raíz del proyecto
2. Busca en los issues cerrados de GitHub
3. Abre un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Screenshots si aplica
   - Logs de la consola

## Roadmap (próximas features)

- Notificaciones push
- Exportar reportes a PDF


- Análisis de sentiment en mensajes
- Integración con calendarios (Google/Outlook)

---

**Hecho con amor en cero uno cero carnal!!!  (y también algo de frustración con TypeScript)**

*Última actualización: Noviembre 2025*
