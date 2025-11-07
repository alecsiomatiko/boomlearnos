# Flujo de Onboarding Obligatorio - Documentacion Tecnica

## Resumen General

Sistema de onboarding obligatorio que garantiza que todos los usuarios nuevos completen la configuracion inicial antes de acceder al dashboard principal. Incluye generacion de identidad organizacional con IA y megadiagnostico empresarial.

## Arquitectura del Sistema

### Diagrama de Flujo Completo

```
[Registro] → [Paso 1: Identidad] → [Paso 2: Diagnostico] → [Dashboard]
    |              |                      |                      |
    v              v                      v                      v
  step=1       step=2              completed=true         Acceso completo
  access=NO    access=NO            access=YES            Gamificacion activa
```

### Base de Datos

Tablas principales del sistema de onboarding:

**users**
- `onboarding_step` (1-2): Paso actual en el proceso
- `onboarding_completed` (boolean): Estado de completitud
- `can_access_dashboard` (boolean): Permiso de acceso
- `current_organization_id`: FK a organizations

**organizations**
- Informacion de la empresa (nombre, industria, tamano, etc.)
- Identidad generada por IA (mision, vision, valores)
- Timestamp de creacion

**user_organizations**
- Relacion many-to-many entre users y organizations
- `role`: rol del usuario en la organizacion
- `is_primary`: organizacion principal del usuario

**diagnostic_answers**
- Respuestas del megadiagnostico por modulo
- `module_id`, `question_id`, `answer_value`
- Timestamp de cada respuesta

**user_gems & user_medals**
- Sistema de recompensas integrado
- 50 gemas por completar onboarding
- Medalla "Bienvenido a BoomLearnOS"

### API Endpoints

**POST /api/auth/register**
- Crea nuevo usuario con campos obligatorios
- Inicializa: `onboarding_step = 1`, `onboarding_completed = false`, `can_access_dashboard = false`
- Request: firstName, lastName, email, password, phone, city, businessType, position
- Response: user object + JWT token

**POST /api/auth/login**
- Autentica usuario y retorna estado de onboarding
- Response incluye: user, organization (si existe), token
- Frontend usa esta info para redirigir al paso correcto

**POST /api/onboarding/identity**
- Captura informacion de la empresa (nombre, industria, tamano, etc.)
- Llama a OpenAI para generar mision, vision y valores personalizados
- Crea organizacion en BD y la vincula al usuario
- Actualiza: `onboarding_step = 2`
- Response: organization object con identidad generada

**POST /api/onboarding/complete**
- Marca onboarding como completo tras terminar diagnostico
- Actualiza: `onboarding_completed = true`, `can_access_dashboard = true`
- Otorga recompensas: 50 gemas + medalla de bienvenida
- Response: user actualizado + recompensas

**GET /api/onboarding/status**
- Consulta estado actual del onboarding
- Response: onboarding_step, completed, organization info

### Proteccion de Rutas

**OnboardingGuard Component**
- Ubicacion: `components/auth/onboarding-guard.tsx`
- Funcion: HOC que envuelve todo el dashboard layout
- Logica de redireccion:
  ```typescript
  if (!user.onboarding_completed) {
    if (user.onboarding_step === 1) {
      redirect('/onboarding/identidad');
    } else if (user.onboarding_step === 2) {
      redirect('/onboarding/diagnostico');
    }
  }
  ```
- Implementado en: `app/dashboard/layout.tsx`

### Integracion con IA

**Generacion de Identidad Organizacional**

El sistema usa OpenAI GPT-4 para crear una identidad empresarial personalizada:

```typescript
// Prompt personalizado basado en la empresa
const prompt = `
  Empresa: ${companyName}
  Industria: ${industry}
  Tamano: ${size}
  Valores clave: ${coreValues}
  
  Genera:
  1. Mision (2-3 frases)
  2. Vision (1-2 frases)
  3. 3-5 valores corporativos con descripcion
`;

// OpenAI retorna JSON estructurado
const aiResponse = await openai.createCompletion({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7
});
```

Resultado guardado en tabla `organizations` para uso posterior en toda la plataforma.

## Flujo Detallado del Usuario

### Paso 1: Registro

```
Usuario accede a /register
         |
         v
Completa formulario (email, password, firstName, lastName, phone, city, businessType, position)
         |
         v
POST /api/auth/register
         |
         v
BD: INSERT INTO users (onboarding_step=1, onboarding_completed=false, can_access_dashboard=false)
         |
         v
Response: { user, token }
         |
         v
Frontend guarda token en localStorage
         |
         v
AuthContext actualiza estado global
         |
         v
Redirect automatico a /onboarding/identidad
```

### Paso 2: Identidad Organizacional

```
Usuario en /onboarding/identidad
         |
         v
Completa formulario empresa (nombre, industria, tamano, valores, etc.)
         |
         v
POST /api/onboarding/identity
         |
         v
OpenAI genera mision, vision y valores personalizados (5-10 segundos)
         |
         v
BD: INSERT INTO organizations + UPDATE users (onboarding_step=2)
         |
         v
BD: INSERT INTO user_organizations (vincula user con org)
         |
         v
Response: { organization con identidad generada }
         |
         v
Redirect automatico a /onboarding/diagnostico
```

### Paso 3: Megadiagnostico

```
Usuario en /onboarding/diagnostico
         |
         v
Completa modulos del diagnostico (8 modulos, ~120 preguntas)
         |
         v
Cada respuesta se guarda: POST /api/diagnostic/save-responses
         |
         v
Al terminar ultimo modulo: POST /api/onboarding/complete
         |
         v
BD: UPDATE users (onboarding_completed=true, can_access_dashboard=true)
         |
         v
BD: INSERT INTO user_gems (50 gemas)
         |
         v
BD: INSERT INTO user_medals (medalla "Bienvenido a BoomLearnOS")
         |
         v
Response: { user actualizado, rewards }
         |
         v
Animacion de recompensas (confetti + contador gemas)
         |
         v
Redirect a /dashboard
```

### Paso 4: Dashboard Habilitado

```
Usuario accede a /dashboard
         |
         v
OnboardingGuard verifica can_access_dashboard=true
         |
         v
Acceso permitido
         |
         v
Dashboard muestra:
  - Identidad organizacional completa
  - Resultados del diagnostico
  - Sistema de gamificacion activo
  - Todas las funcionalidades desbloqueadas
```

## Verificacion de Estado

El sistema verifica el estado en cada navegacion:

```typescript
// En OnboardingGuard
const user = useAuth();

useEffect(() => {
  if (!user) {
    redirect('/login');
    return;
  }
  
  if (!user.onboarding_completed) {
    if (user.onboarding_step === 1) {
      redirect('/onboarding/identidad');
    } else if (user.onboarding_step === 2) {
      redirect('/onboarding/diagnostico');
    }
  }
}, [user]);
```

## Sistema de Recompensas

### Recompensas al Completar Onboarding

**Gemas**
```sql
INSERT INTO user_gems (user_id, amount, type, description, source)
VALUES (?, 50, 'reward', 'Bienvenida a BoomLearnOS', 'onboarding_complete');
```

**Medalla**
```sql
INSERT INTO user_medals (user_id, medal_type, medal_name, description, icon)
VALUES (?, 'welcome', 'Bienvenido a BoomLearnOS', 'Completaste tu primer paso', 'welcome.png');
```

Estas recompensas se muestran inmediatamente al usuario con animaciones y confetti.

## Stack Tecnologico

- **Next.js 15.2.4**: Framework React con App Router
- **MySQL 8.0**: Base de datos relacional
- **TypeScript**: Tipado estatico en toda la aplicacion
- **OpenAI GPT-4**: Generacion de identidad organizacional
- **bcrypt**: Hash de passwords (10 rounds)
- **JWT**: Autenticacion stateless (7 dias expiracion)
- **TailwindCSS + shadcn/ui**: Componentes UI

## Archivos Clave

```
app/
  api/
    auth/
      register/route.ts          # Registro inicial
      login/route.ts             # Login con estado onboarding
    onboarding/
      identity/route.ts          # Paso 1: Identidad + IA
      complete/route.ts          # Finalizacion onboarding
      status/route.ts            # Consulta estado
  onboarding/
    identidad/page.tsx           # UI Paso 1
    diagnostico/page.tsx         # UI Paso 2
  dashboard/
    layout.tsx                   # OnboardingGuard integrado

components/
  auth/
    onboarding-guard.tsx         # HOC proteccion rutas

database/
  production-schema.sql          # Schema completo con onboarding

scripts/
  migrate-diagnostic-data.ts     # Migracion datos diagnostico
```

## Casos de Uso

### Usuario Nuevo
1. Registra cuenta → onboarding_step = 1
2. Completa identidad → onboarding_step = 2
3. Completa diagnostico → onboarding_completed = true
4. Accede dashboard → todas las funciones disponibles

### Usuario Interrumpe Onboarding
1. Cierra navegador en paso 1 o 2
2. Vuelve a login
3. OnboardingGuard detecta paso incompleto
4. Redirige automaticamente al paso correcto
5. Usuario continua desde donde quedo

### Usuario Intenta Acceso Directo
1. Usuario intenta /dashboard sin completar onboarding
2. OnboardingGuard intercepta
3. Verifica can_access_dashboard = false
4. Redirige a paso pendiente
5. Acceso denegado hasta completar

## Consideraciones de Seguridad

- **Validacion backend**: Todos los endpoints validan estado de onboarding
- **JWT verification**: Token requerido en todas las rutas protegidas
- **SQL injection**: Prepared statements en todas las queries
- **Password hashing**: bcrypt con 10 rounds, nunca se almacena plain text
- **Rate limiting**: Implementado en endpoints de IA para prevenir abuso

## Estado Actual

**Completado y funcional:**
- Build exitoso sin errores TypeScript
- Servidor corriendo en http://localhost:3000
- Todos los endpoints implementados y testeados
- Base de datos creada y configurada
- Flujo end-to-end funcional
- Sistema de recompensas activo

El sistema esta listo para produccion y garantiza que todos los usuarios completen el onboarding antes de acceder al dashboard.
