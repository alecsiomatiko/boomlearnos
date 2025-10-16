# 👥 Sistema de Gestión de Usuarios y Permisos

## 📋 Descripción General

Sistema completo para administrar colaboradores con permisos granulares, creación directa de usuarios (sin invitaciones por email), compartir credenciales por WhatsApp y cambio obligatorio de contraseña **SOLO para usuarios invitados** (no para admins que se registran normalmente).

---

## 🗄️ Estructura de Base de Datos

### Tabla `users` - Campos Agregados

```sql
ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT true AFTER password;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER email;
ALTER TABLE users ADD COLUMN permissions JSON DEFAULT NULL AFTER role;
```

### Estructura JSON de Permisos

```json
{
  "tasks_view_team": false,        // Ver todas las tareas de la organización
  "tasks_assign_others": false,    // Crear tareas y asignarlas a otros
  "messages": true,                // Acceso al sistema de mensajería
  "achievements": true,            // Ver logros personales
  "checkin": false,                // Registro de asistencia
  "team": false                    // Ver miembros y departamentos
}
```

---

## 🎯 Sistema de Permisos

### **Acceso por Defecto (Siempre Activo)**
✅ Dashboard personal (widgets y métricas propias)  
✅ Mis Tareas (solo las asignadas/creadas por el usuario)  
✅ Mi Perfil (editar información personal)

### **Bloqueado para Colaboradores (Solo Admin)**
🔒 Onboarding  
🔒 Mega Diagnóstico  
🔒 Selector Dashboard/Salud  
🔒 Panel de Salud Empresarial  
🔒 Todos los paneles `/admin/*`

### **Permisos Granulares Configurables**

| Permiso | Clave | Descripción |
|---------|-------|-------------|
| 👁️ Ver tareas del equipo | `tasks_view_team` | Permite ver todas las tareas de la organización, filtrar por colaborador/departamento |
| 👥 Asignar tareas a otros | `tasks_assign_others` | Permite crear tareas y delegarlas a cualquier colaborador |
| 💬 Mensajes | `messages` | Acceso completo al sistema de mensajería interna |
| 🏆 Logros | `achievements` | Ver sus logros personales y progreso |
| ✅ Check-in | `checkin` | Registro de asistencia y estado diario |
| 👨‍💼 Equipo | `team` | Ver lista de miembros del equipo y departamentos |

---

## 🚀 API Endpoints

### **GET `/api/admin/users`**
Listar todos los usuarios de la organización (excepto admins).

**Query Params:**
```
organization_id: UUID de la organización
```

**Response:**
```json
[
  {
    "id": "user-123",
    "name": "Juan Pérez",
    "email": "juan@empresa.com",
    "phone": "524444702105",
    "role": "user",
    "first_login": true,
    "permissions": {
      "tasks_view_team": false,
      "tasks_assign_others": false,
      "messages": true,
      "achievements": true,
      "checkin": false,
      "team": false
    },
    "department_id": 5,
    "department_name": "Marketing",
    "department_color": "#EC4899",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

### **POST `/api/admin/users`**
Crear nuevo usuario colaborador.

**Body:**
```json
{
  "name": "María González",
  "email": "maria@empresa.com",
  "phone": "524445551234",
  "password": "BoomTempPass2025!",
  "department_id": 3,
  "organization_id": "9a913edd-1f70-49af-91da-9ffb12bfef2b",
  "permissions": {
    "tasks_view_team": true,
    "tasks_assign_others": false,
    "messages": true,
    "achievements": true,
    "checkin": true,
    "team": true
  }
}
```

**Response:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": { ...userData },
  "password_plain": "BoomTempPass2025!"
}
```

**Nota:** `password_plain` se devuelve para mostrar en el modal de WhatsApp.

---

### **PUT `/api/admin/users/:id`**
Actualizar información de usuario.

**Body:**
```json
{
  "name": "María González Ruiz",
  "phone": "524445556789",
  "department_id": 5,
  "organization_id": "9a913edd-1f70-49af-91da-9ffb12bfef2b",
  "permissions": {
    "tasks_view_team": true,
    "tasks_assign_others": true,
    "messages": true,
    "achievements": true,
    "checkin": true,
    "team": true
  },
  "new_password": "NuevoPass123!" // Opcional
}
```

**Comportamiento:**
- Si se proporciona `new_password`, se hashea y actualiza
- Se resetea `first_login = true` cuando admin cambia el password
- Campos opcionales se actualizan solo si están presentes

---

### **DELETE `/api/admin/users/:id`**
Eliminar usuario colaborador.

**Query Params:**
```
organization_id: UUID de la organización
```

**Validaciones:**
- No se puede eliminar usuarios admin
- Solo se eliminan usuarios de la misma organización

---

## 💻 Panel de Administración

### **Ubicación:** `/admin/users`

### **Características:**

#### 📊 Dashboard de Usuarios
- Total de usuarios
- Usuarios activos (first_login = false)
- Usuarios pendientes de primer login (first_login = true)

#### 📋 Lista de Usuarios
Tabla con columnas:
- **Usuario:** Avatar (inicial del nombre), nombre completo, email
- **Contacto:** Número de teléfono/WhatsApp
- **Departamento:** Nombre con badge de color
- **Estado:** 
  - 🔑 "Primer Login" (amber) si first_login = true
  - ✅ "Activo" (green) si first_login = false
- **Permisos:** Badges resumen (Ver Equipo, Asignar, etc.)
- **Acciones:** Editar, Eliminar

#### ➕ Crear Usuario

**Formulario:**
1. **Información Personal:**
   - Nombre completo *
   - Email * (usado para login)
   - Teléfono/WhatsApp * (formato: 52XXXXXXXXXX)
   - Departamento (select con los 10 departamentos)
   - Password inicial * (con botón "Generar" automático)
     - Muestra/oculta password con ícono de ojo
     - Nota: "El usuario deberá cambiar esta contraseña en su primer login"

2. **Permisos de Acceso:**
   - Card informativo: Acceso por defecto (Dashboard, Mis tareas, Mi perfil)
   - 6 checkboxes para permisos granulares:
     - ☐ Ver tareas del equipo
     - ☐ Asignar tareas a otros
     - ☐ Mensajes (checked por defecto)
     - ☐ Logros (checked por defecto)
     - ☐ Check-in
     - ☐ Equipo

**Al crear usuario:**
1. Se inserta en BD con `first_login = true`
2. Password se hashea con bcrypt
3. Aparece modal de WhatsApp con credenciales

#### 📱 Modal de WhatsApp

**Diseño:**
- Header verde con ícono de WhatsApp
- Card con credenciales:
  - 📧 Email: `juan@empresa.com`
  - 🔑 Password: `BoomTempPass2025!`
  - 📱 WhatsApp: `524444702105`

**Botón "Enviar por WhatsApp":**
- Abre WhatsApp Web con mensaje pre-formateado:

```
¡Bienvenido a BoomlearnOS! 🚀

Tus credenciales de acceso son:
📧 Email: juan@empresa.com
🔑 Password: BoomTempPass2025!

🔗 Ingresa aquí: https://app.boomlearnos.com/login

⚠️ Por seguridad, deberás cambiar tu contraseña en el primer inicio de sesión.
```

- URL: `https://wa.me/524444702105?text={mensaje_codificado}`

#### ✏️ Editar Usuario

- Mismos campos que crear
- Password es opcional (dejar vacío para no cambiar)
- Si admin cambia password → se resetea `first_login = true`
- Actualiza permisos dinámicamente

---

## 🔐 Flujo de Cambio Obligatorio de Contraseña

> ⚠️ **IMPORTANTE:** Solo aplica a usuarios **invitados** (colaboradores). Los administradores que se registran normalmente NO son forzados a cambiar su contraseña.

### **Lógica de `first_login`**

| Tipo de Usuario | Endpoint | Role | first_login | Cambio Obligatorio |
|-----------------|----------|------|-------------|-------------------|
| Admin (Registro) | `/api/auth/register` | `admin` | `false` | ❌ NO |
| Colaborador (Invitado) | `/api/admin/users` | `user` | `true` | ✅ SÍ |

📖 **Ver documentación completa:** [FIRST_LOGIN_LOGIC.md](./FIRST_LOGIN_LOGIC.md)

### **1. Login Normal**
Usuario ingresa con email + password inicial que recibió por WhatsApp.

### **2. Verificación Post-Login**
Después de autenticación exitosa, sistema verifica:
```javascript
if (user.first_login === true && user.role === 'user') {
  // Redirigir a /change-password (forzado)
  // No puede acceder a ninguna otra ruta
}
```

### **3. Página `/change-password`** ✅ IMPLEMENTADA
- Formulario con:
  - Password actual (el que recibió)
  - Nuevo password
  - Confirmar nuevo password
- Validaciones en tiempo real:
  - ✅ Mínimo 8 caracteres
  - ✅ Al menos 1 mayúscula
  - ✅ Al menos 1 minúscula
  - ✅ Al menos 1 número
  - ✅ Al menos 1 carácter especial
- Indicadores visuales (CheckCircle/XCircle)
- Botón deshabilitado hasta cumplir todos los requisitos

### **4. Actualización**
```sql
UPDATE users 
SET password = ?, first_login = false 
WHERE id = ?
```

### **5. Redirección**
- Mensaje de éxito: "✅ Contraseña actualizada correctamente"
- Redirección automática a `/dashboard`
- Acceso completo al sistema

### **Protección de Rutas: `PasswordChangeGuard`**
```typescript
// Ubicación: components/auth/password-change-guard.tsx
// Integrado en: app/dashboard/layout.tsx

useEffect(() => {
  if (user && user.first_login === true) {
    if (pathname !== '/change-password') {
      router.push('/change-password'); // Bloquea todas las demás rutas
    }
  }
}, [user, pathname]);
```

---

## 🎨 Diseño UI/UX

### **Paleta de Colores**
- **Primary:** Purple (`from-purple-600 to-purple-700`)
- **Success:** Green (`from-green-600 to-green-700`)
- **Warning:** Amber (`bg-amber-100 text-amber-700`)
- **Danger:** Red (`text-red-600`)

### **Componentes Modernos**
- Gradientes en headers y botones
- Sombras suaves (`shadow-lg`, `shadow-xl`)
- Bordes redondeados (`rounded-xl`, `rounded-2xl`)
- Transiciones suaves (`transition-all`, `hover:`)
- Backdrop blur en modals (`backdrop-blur-sm`)

### **Iconos (lucide-react)**
- `Users` - Gestión de usuarios
- `Plus` - Crear nuevo
- `Edit2` - Editar
- `Trash2` - Eliminar
- `Shield` - Permisos
- `Key` - Password
- `Phone` - Teléfono
- `Mail` - Email
- `MessageCircle` - WhatsApp
- `Building2` - Departamento
- `CheckCircle` - Activo
- `Eye/EyeOff` - Mostrar/ocultar password

---

## 🔒 Seguridad

### **1. Autenticación**
- Middleware `requireAdmin()` en todos los endpoints
- JWT token en header `Authorization: Bearer {token}`
- Validación de rol admin antes de cualquier operación

### **2. Hashing de Passwords**
```javascript
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
```

### **3. Multi-tenancy**
- Todos los queries incluyen `WHERE organization_id = ?`
- Validación de pertenencia antes de UPDATE/DELETE
- Solo admins pueden gestionar usuarios de su organización

### **4. Validaciones**
- Emails únicos en toda la BD
- Campos requeridos: name, email, phone, password, organization_id
- No se pueden eliminar usuarios admin
- Department_id debe existir o ser NULL

---

## 📊 Queries Útiles

### Ver todos los usuarios con sus permisos:
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.first_login,
  u.permissions,
  d.name as department_name
FROM users u
LEFT JOIN organization_departments d ON u.department_id = d.id
WHERE u.organization_id = '9a913edd-1f70-49af-91da-9ffb12bfef2b'
AND u.role = 'user';
```

### Usuarios pendientes de primer login:
```sql
SELECT name, email, phone, created_at
FROM users
WHERE first_login = true
AND organization_id = '9a913edd-1f70-49af-91da-9ffb12bfef2b'
ORDER BY created_at DESC;
```

### Contar usuarios por departamento:
```sql
SELECT 
  d.name as department,
  COUNT(u.id) as total_users,
  SUM(CASE WHEN u.first_login = false THEN 1 ELSE 0 END) as active_users
FROM organization_departments d
LEFT JOIN users u ON d.id = u.department_id AND u.role = 'user'
WHERE d.organization_id = '9a913edd-1f70-49af-91da-9ffb12bfef2b'
GROUP BY d.id;
```

### Usuarios con permiso para asignar tareas:
```sql
SELECT name, email, JSON_EXTRACT(permissions, '$.tasks_assign_others') as can_assign
FROM users
WHERE organization_id = '9a913edd-1f70-49af-91da-9ffb12bfef2b'
AND JSON_EXTRACT(permissions, '$.tasks_assign_others') = true;
```

---

## 🐛 Troubleshooting

### Error: "Request with GET/HEAD method cannot have body"
**Solución:** `useOrgApi` ya está configurado para enviar `organization_id` como query param en GET.

### Error: "Property 'error' does not exist on type 'true'"
**Solución:** `requireAdmin()` retorna `true | NextResponse`. Verificar con `if (authResult !== true) return authResult;`

### Error: "El email ya está registrado"
**Causa:** El email ya existe en la BD (emails son únicos globalmente).  
**Solución:** Usar otro email o buscar el usuario existente.

### Usuario no puede cambiar password después de reseteo por admin
**Causa:** Campo `first_login` no se actualizó a `true`.  
**Solución:** Al cambiar password desde admin, ejecutar:
```sql
UPDATE users SET first_login = true WHERE id = ?
```

---

## 📝 Próximos Pasos (TODO)

### 1. **Crear página `/change-password`**
- Formulario para cambio obligatorio de contraseña
- Validaciones de seguridad
- Actualizar `first_login = false`

### 2. **Middleware de permisos en rutas**
- Verificar permisos antes de renderizar componentes
- Ejemplo: Si no tiene `tasks_view_team`, ocultar botón "Ver todas las tareas"

### 3. **Implementar lógica de permisos en frontend**
- En `/dashboard/tareas`: Filtrar solo tareas propias si no tiene `tasks_view_team`
- En creación de tareas: Auto-asignar a sí mismo si no tiene `tasks_assign_others`
- Ocultar navegación de paneles según permisos

### 4. **Notificaciones de bienvenida**
- Enviar notificación in-app al usuario cuando es creado
- Email de bienvenida (opcional, si se configura SMTP)

### 5. **Auditoría de cambios**
- Log de quién creó/editó/eliminó usuarios
- Historial de cambios de permisos

---

## 🎉 Resumen de Implementación

✅ Migración de BD (first_login, phone, permissions)  
✅ API endpoints (GET, POST, PUT, DELETE)  
✅ Panel admin `/admin/users` con UI profesional  
✅ Formulario de creación con permisos granulares  
✅ Modal de WhatsApp para compartir credenciales  
✅ Sistema de permisos JSON flexible  
✅ Integración con departamentos  
✅ Seguridad y multi-tenancy  
✅ Documentación completa  

🔄 **Pendiente:**  
- Página `/change-password` para primer login  
- Middleware de verificación de permisos en rutas  
- Implementación de lógica de permisos en tareas

---

## 📞 Soporte

Para cualquier duda o problema, contactar al equipo de desarrollo de BoomlearnOS.

**Última actualización:** Octubre 15, 2025
