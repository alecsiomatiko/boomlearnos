# 🔐 Lógica de First Login - Sistema de Cambio Obligatorio de Contraseña

## 📋 Resumen

El sistema implementa un cambio obligatorio de contraseña **SOLO para usuarios invitados**, no para administradores que se registran normalmente.

---

## 🎯 Tipos de Usuario

### 1️⃣ Administradores (Registro Normal)

**Ruta:** `/register`  
**API:** `/api/auth/register`

#### Características:
- ✅ Usuario se registra por sí mismo
- ✅ Elige su propia contraseña durante el registro
- ✅ `role: 'admin'`
- ✅ `first_login: FALSE`
- ✅ **NO se le fuerza a cambiar contraseña**
- ✅ Acceso directo al dashboard después del onboarding

#### Flujo:
```
Usuario → /register 
       → Completa formulario 
       → Crea su contraseña 
       → first_login = FALSE (automático)
       → Login 
       → Onboarding 
       → Dashboard (sin cambio de contraseña)
```

---

### 2️⃣ Colaboradores (Invitados por Admin)

**Ruta:** `/admin/users`  
**API:** `/api/admin/users` (POST)

#### Características:
- ✅ Admin crea el usuario desde panel
- ✅ Admin genera contraseña temporal
- ✅ `role: 'user'` (colaborador)
- ✅ `first_login: TRUE`
- ✅ **SE le fuerza a cambiar contraseña**
- ✅ Recibe credenciales por WhatsApp
- ✅ No puede acceder al dashboard hasta cambiar contraseña

#### Flujo:
```
Admin → /admin/users 
      → Crea usuario 
      → Genera password temporal 
      → first_login = TRUE (automático)
      → Comparte credenciales por WhatsApp

Usuario → /login 
        → Ingresa con credenciales temporales
        → Sistema detecta first_login = TRUE
        → Redirige a /change-password (OBLIGATORIO)
        → PasswordChangeGuard bloquea todas las rutas
        → Usuario cambia contraseña
        → first_login = FALSE (automático)
        → Acceso completo al dashboard
```

---

## 🔧 Implementación Técnica

### Endpoints

#### `/api/auth/register` (POST)
```typescript
INSERT INTO users (..., first_login) VALUES (..., false)
// Admins NO necesitan cambiar contraseña
```

#### `/api/admin/users` (POST)
```typescript
INSERT INTO users (..., first_login) VALUES (..., true)
// Colaboradores SÍ necesitan cambiar contraseña
```

#### `/api/auth/login` (POST)
```typescript
// Retorna first_login en la respuesta
{
  user: {
    first_login: boolean,
    // ... otros campos
  }
}
```

#### `/api/auth/change-password` (POST)
```typescript
// Actualiza contraseña y desactiva first_login
UPDATE users 
SET password = ?, first_login = false 
WHERE id = ?
```

---

### Componentes

#### `PasswordChangeGuard`
**Ubicación:** `components/auth/password-change-guard.tsx`

```typescript
// Verifica first_login en cada navegación
useEffect(() => {
  if (user && user.first_login === true) {
    // Permite acceso a /change-password
    if (pathname !== '/change-password') {
      // Bloquea todas las demás rutas
      router.push('/change-password');
    }
  }
}, [user, pathname]);
```

**Integrado en:** `app/dashboard/layout.tsx`
```typescript
<ProtectedRoute>
  <OnboardingGuard>
    <PasswordChangeGuard>
      {children}
    </PasswordChangeGuard>
  </OnboardingGuard>
</ProtectedRoute>
```

---

### Páginas

#### `/login`
- Detecta `first_login === true` después del login exitoso
- Redirige automáticamente a `/change-password`
- Muestra toast: "Cambio de contraseña requerido"

#### `/change-password`
- Validación en tiempo real de requisitos de contraseña
- Requisitos:
  - ✅ Mínimo 8 caracteres
  - ✅ 1 letra mayúscula
  - ✅ 1 letra minúscula
  - ✅ 1 número
  - ✅ 1 carácter especial
- Botón submit deshabilitado hasta cumplir todos los requisitos
- Después del cambio exitoso: `first_login = false`
- Redirección automática a `/dashboard`

---

## 📊 Estado Actual del Sistema

### Base de Datos
```sql
-- Administradores (first_login = FALSE)
admin@supernova.com    | first_login: false | role: admin
admin@gorditas.com     | first_login: false | role: admin

-- Colaboradores (first_login = TRUE)
maria.gonzalez@supernova.com     | first_login: true | role: user
carlos.ramirez@supernova.com     | first_login: true | role: user
ana.lopez@supernova.com          | first_login: true | role: user
roberto.martinez@supernova.com   | first_login: true | role: user
laura.sanchez@supernova.com      | first_login: true | role: user
```

---

## 🧪 Testing

### Test 1: Registro Normal (Admin)
```bash
1. Ir a /register
2. Completar formulario con nueva contraseña
3. Registrarse
4. Verificar: first_login = false en DB
5. Login con las credenciales
6. Verificar: NO redirige a /change-password
7. Verificar: Acceso directo a dashboard (después de onboarding)
```

### Test 2: Usuario Invitado (Colaborador)
```bash
1. Login como admin
2. Ir a /admin/users
3. Crear nuevo usuario con contraseña temporal
4. Verificar: first_login = true en DB
5. Logout
6. Login con credenciales del colaborador
7. Verificar: Redirige automáticamente a /change-password
8. Intentar navegar a /dashboard/equipo
9. Verificar: PasswordChangeGuard bloquea y redirige a /change-password
10. Cambiar contraseña cumpliendo requisitos
11. Verificar: first_login = false en DB
12. Verificar: Acceso completo al dashboard
```

### Script de Verificación
```bash
# Verificar estado de first_login por tipo de usuario
node scripts/verify-first-login-logic.js

# Verificar flujo completo
node scripts/test-first-login-flow.js
```

---

## 🔒 Seguridad

### Requisitos de Contraseña
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 letra minúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&*(),.?":{}|<>)

### Validación de Contraseña Actual
- Se verifica con `bcrypt.compare()` antes de permitir el cambio
- Previene cambios no autorizados

### Hash de Contraseñas
- `bcrypt` con 10 salt rounds
- Todas las contraseñas hasheadas en base de datos

---

## 🚀 Credenciales de Prueba

### Colaboradores (Cambio Obligatorio)
```
Email: ana.lopez@supernova.com
Password: BoomTest2025!
Estado: Requiere cambio de contraseña

Email: maria.gonzalez@supernova.com
Password: BoomTest2025!
Estado: Requiere cambio de contraseña
```

---

## ✅ Ventajas de Esta Implementación

1. **Seguridad**: Solo usuarios con contraseñas temporales deben cambiarlas
2. **UX Mejorado**: Admins no son molestados con cambios innecesarios
3. **Flexibilidad**: Sistema diferencia claramente entre tipos de usuario
4. **Transparente**: Lógica clara basada en `role` y `first_login`
5. **Escalable**: Fácil agregar más tipos de usuario en el futuro

---

## 📝 Notas Importantes

- ⚠️ **NUNCA** cambiar manualmente `first_login` en DB sin razón
- ⚠️ Los admins **siempre** deben tener `first_login = false`
- ⚠️ Los colaboradores **siempre** deben empezar con `first_login = true`
- ✅ El sistema actualiza `first_login = false` automáticamente después del cambio
- ✅ `PasswordChangeGuard` solo actúa cuando `first_login = true`

---

## 🔄 Cambios Futuros

### Si se necesita forzar cambio a un admin:
```sql
-- Opción 1: Cambiar first_login manualmente
UPDATE users SET first_login = true WHERE id = 'admin-id';

-- Opción 2: Agregar campo "password_expired"
ALTER TABLE users ADD COLUMN password_expired BOOLEAN DEFAULT false;
```

### Si se necesita reset de contraseña:
- Crear endpoint `/api/auth/reset-password`
- Enviar email con token único
- Permitir cambio sin autenticación previa
