# Sistema de Departamentos - Documentacion Tecnica

## Descripcion General

Sistema para crear y gestionar la estructura departamental de organizaciones.
Permite asignar empleados a areas funcionales, controlar permisos por departamento
y organizar el equipo de trabajo.

## Arquitectura del Sistema

### Diagrama de Relaciones

```
[Organization]
      |
      | 1:N
      v
[Departments] ←──────┐
      |              | N:1
      | 1:N          |
      v              |
  [Users] ───────────┘
      |
      v
[Invitations]
```

### Flujo de Asignacion

```
Admin crea departamento → Departamento activo → Admin asigna usuarios
                                |
                                v
                         Usuarios heredan permisos
                                |
                                v
                    Metricas y reportes agrupados por dept
```

## Estructura de Base de Datos

### Tabla: organization_departments

Almacena todos los departamentos de cada organizacion.

```sql
CREATE TABLE organization_departments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  organization_id VARCHAR(36) NOT NULL,           -- FK a organizations
  name VARCHAR(100) NOT NULL,                     -- Nombre del departamento
  description TEXT,                               -- Descripcion detallada
  color VARCHAR(16),                              -- Color hex (#3B82F6)
  active TINYINT(1) DEFAULT 1,                    -- Activo/Inactivo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_org_departments (organization_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

**Campos clave:**
- `color`: Usado en UI para identificacion visual rapida
- `active`: Permite desactivar sin eliminar (soft delete)
- `CASCADE`: Si se elimina org, se eliminan sus departamentos

### Relacion con Usuarios

Los usuarios tienen una FK opcional a departamentos:

```sql
-- En tabla users:
department_id VARCHAR(36),                        -- FK a organization_departments
INDEX idx_users_department (department_id),
FOREIGN KEY (department_id) REFERENCES organization_departments(id) ON DELETE SET NULL
```

**Comportamiento:**
- `ON DELETE SET NULL`: Si se elimina el departamento, usuarios quedan sin departamento asignado
- Un usuario puede pertenecer a 0 o 1 departamento
- Un departamento puede tener N usuarios

## 🎨 Sistema de Colores

### Colores Predefinidos

| Color | Hex | Uso Recomendado |
|-------|-----|-----------------|
| **Azul** | #3B82F6 | Dirección, Administración |
| **Verde** | #10B981 | RRHH, Recursos, Sostenibilidad |
| **Púrpura** | #8B5CF6 | Tecnología, Innovación |
| **Rosa** | #EC4899 | Marketing, Creatividad |
| **Naranja** | #F59E0B | Ventas, Comercial |
| **Rojo** | #EF4444 | Operaciones, Producción |
| **Cyan** | #06B6D4 | Atención al Cliente, Soporte |
| **Índigo** | #6366F1 | Legal, Cumplimiento |

### Selector de Color

## Sistema de Colores

Los departamentos usan colores para identificacion visual rapida en UI.

### Colores Predefinidos

| Color | Hex | Uso Recomendado |
|-------|-----|-----------------|
| Azul | #3B82F6 | Direccion, Administracion, Gerencia |
| Verde | #10B981 | RRHH, Recursos, Sostenibilidad |
| Purpura | #8B5CF6 | Tecnologia, IT, Innovacion |
| Rosa | #EC4899 | Marketing, Creatividad, Diseno |
| Naranja | #F59E0B | Ventas, Comercial, Business Development |
| Rojo | #EF4444 | Operaciones, Produccion, Logistica |
| Cyan | #06B6D4 | Atencion Cliente, Soporte, CS |
| Indigo | #6366F1 | Legal, Compliance, Auditoria |

### Selector de Color en UI

```typescript
// Componente permite:
- Seleccion de paleta predefinida (8 colores)
- Color picker custom (HTML5 input type="color")
- Input manual de hex (#RRGGBB)
- Vista previa en tiempo real del color seleccionado
```

## Panel de Administracion

### Ruta: /admin/departments

Interfaz completa para CRUD de departamentos.

**Funcionalidades:**

1. **Crear Departamentos**
   - Formulario con nombre (max 100 chars)
   - Descripcion detallada (textarea)
   - Selector de color con preview
   - Toggle activo/inactivo
   - Validaciones en tiempo real

2. **Listar Departamentos**
   - Grid/tabla con todos los departamentos
   - Conteo de empleados asignados (JOIN con users)
   - Filtro por estado (activos/inactivos)
   - Badge de color visual
   - Estadisticas en cards

3. **Editar Departamentos**
   - Modal con formulario pre-poblado
   - Actualizacion instantanea en UI
   - Validacion de unicidad de nombre
   - Cambio de color en tiempo real

4. **Eliminar Departamentos**
   - Dialog de confirmacion obligatorio
   - Advierte si hay usuarios asignados
   - Al eliminar: users.department_id = NULL
   - Invitaciones pendientes tambien se eliminan
   - Scope por organization_id

5. **Estadisticas Dashboard**
   - Total departamentos creados
   - Departamentos activos vs inactivos
   - Total empleados asignados
   - Departamento con mas empleados
   - Departamentos sin empleados (vacios)

## API Endpoints

Todos los endpoints requieren autenticacion JWT y organizationId.

### GET /api/admin/departments

Obtiene todos los departamentos de la organizacion con conteo de empleados.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Params:**
```
organization_id: string (automatico via useOrgApi)
```

**Query SQL:**
```sql
SELECT 
  d.*,
  COUNT(u.id) as user_count
FROM organization_departments d
LEFT JOIN users u ON u.department_id = d.id
WHERE d.organization_id = ?
GROUP BY d.id
ORDER BY d.created_at DESC
```

**Response 200:**
```json
[
  {
    "id": "dept-uuid-1",
    "organization_id": "org-uuid",
    "name": "Marketing y Comunicacion",
    "description": "Estrategias de marketing digital y comunicacion interna/externa",
    "color": "#EC4899",
    "active": true,
    "user_count": 5,
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-20T14:30:00.000Z"
  }
]
```

---

### POST /api/admin/departments

Crea un nuevo departamento en la organizacion.

**Body:**
```json
{
  "name": "Recursos Humanos",
  "description": "Gestion del talento y bienestar del personal",
  "color": "#10B981",
  "active": true
}
```

**Validaciones:**
- `name`: requerido, max 100 chars, unico en la organizacion
- `description`: opcional, tipo TEXT
- `color`: requerido, formato hex (#RRGGBB)
- `active`: boolean, default true

**Response 201:**
```json
{
  "success": true,
  "message": "Departamento creado exitosamente",
  "data": {
    "id": "new-dept-uuid"
  }
}
```

**Response 400:** Validacion fallida
**Response 409:** Nombre duplicado en la organizacion

---

### PUT /api/admin/departments/:id

Actualiza un departamento existente.

**Body:** (campos opcionales)
```json
{
  "name": "Nuevo Nombre",
  "color": "#3B82F6",
  "active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Departamento actualizado exitosamente"
}
```

### DELETE `/api/admin/departments/:id`

Elimina un departamento.

**Acciones:**
1. Elimina invitaciones pendientes del departamento
2. Desvincula usuarios asignados (department_id = NULL)
3. Elimina el departamento

**Response:**
```json
{
  "success": true,
  "message": "Departamento eliminado exitosamente"
}
```

## 🎮 Uso en Frontend

### Hook: `useOrgApi`

Todas las peticiones usan este hook para multi-tenancy automático.

**Ejemplo:**
```typescript
const orgApi = useOrgApi();

// GET - Listar departamentos
const response = await orgApi('/api/admin/departments', { method: 'GET' });
const departments = await response.json();

// POST - Crear departamento
const response = await orgApi('/api/admin/departments', { 
  method: 'POST', 
  body: { 
    name: 'Tecnología',
    description: 'Desarrollo y sistemas',
    color: '#8B5CF6',
    active: true
  } 
});

// PUT - Actualizar
const response = await orgApi(`/api/admin/departments/${id}`, { 
  method: 'PUT', 
  body: { active: false } 
});

// DELETE - Eliminar
const response = await orgApi(`/api/admin/departments/${id}`, { 
  method: 'DELETE' 
});
```

## 🛡️ Seguridad

1. **Autenticación**: JWT token requerido
2. **Autorización**: Solo usuarios con rol `admin`
3. **Multi-tenancy**: Todas las operaciones scoped por `organization_id`
4. **Validaciones**: 
   - Nombre requerido
   - Descripción requerida
   - Color válido (formato hex)
5. **Eliminación Segura**: 
   - No permite eliminar si hay datos críticos
   - Desvincula usuarios automáticamente
   - Limpia invitaciones relacionadas

## 👥 Asignación de Usuarios

### Desde Perfil de Usuario

```typescript
// Actualizar departamento de usuario
await executeQuery(
  'UPDATE users SET department_id = ? WHERE id = ? AND organization_id = ?',
  [departmentId, userId, organizationId]
);
```

### Desde Invitaciones

```typescript
// Al crear invitación
INSERT INTO organization_invitations (
  organization_id, 
  email, 
  department_id,
  ...
) VALUES (?, ?, ?, ...);
```

### Consulta con Departamento

```typescript
// Obtener usuarios con su departamento
SELECT 
  u.*,
  d.name as department_name,
  d.color as department_color
FROM users u
LEFT JOIN organization_departments d ON u.department_id = d.id
WHERE u.organization_id = ?
```

## 🎨 UI/UX Features

### Tarjetas de Departamento

- **Icono con color**: Fondo tintado + borde del color del departamento
- **Badge de estado**: Verde (activo) / Gris (inactivo)
- **Contador de empleados**: Con icono de usuarios
- **Fecha de creación**: Formateada a locale español
- **Dot de color**: Indicador visual del color asignado
- **Hover effects**: Sombra elevada en hover
- **Estados visuales**: Opacidad reducida para inactivos

### Modal de Creación/Edición

- **Paleta de colores**: 8 colores predefinidos en grid
- **Selector custom**: Color picker nativo
- **Input hex**: Campo de texto para código hex
- **Vista previa**: Color seleccionado visible en todo momento
- **Switch de estado**: Toggle para activar/desactivar
- **Validaciones**: Feedback visual de campos requeridos

### Estadísticas

- **4 tarjetas con gradientes**:
  - Azul: Total departamentos
  - Verde: Activos
  - Púrpura: Empleados asignados
  - Ámbar: Inactivos
- **Iconos grandes**: Con opacidad para efecto de fondo
- **Números destacados**: Fuente grande y bold

## 📈 Métricas y Reportes

```sql
-- Departamentos con más empleados
SELECT 
  d.name,
  d.color,
  COUNT(u.id) as employee_count
FROM organization_departments d
LEFT JOIN users u ON d.id = u.department_id
WHERE d.organization_id = ?
GROUP BY d.id
ORDER BY employee_count DESC
LIMIT 10;

-- Distribución de empleados
SELECT 
  d.name,
  COUNT(u.id) as count,
  ROUND(COUNT(u.id) * 100.0 / (
    SELECT COUNT(*) FROM users WHERE organization_id = ?
  ), 2) as percentage
FROM organization_departments d
LEFT JOIN users u ON d.id = u.department_id
WHERE d.organization_id = ?
GROUP BY d.id;

-- Departamentos sin empleados
SELECT 
  d.name,
  d.description,
  d.created_at
FROM organization_departments d
LEFT JOIN users u ON d.id = u.department_id
WHERE d.organization_id = ?
  AND d.active = 1
GROUP BY d.id
HAVING COUNT(u.id) = 0;
```

## 🚀 Próximas Mejoras

- [ ] Jerarquía de departamentos (padre/hijo)
- [ ] Asignación de managers por departamento
- [ ] Organigrama visual interactivo
- [ ] Transferencia masiva de empleados
- [ ] Presupuestos por departamento
- [ ] Metas y KPIs departamentales
- [ ] Dashboard de analytics por departamento
- [ ] Exportación de estructura organizacional
- [ ] Importación desde Excel/CSV
- [ ] Roles y permisos por departamento

## 🐛 Troubleshooting

### Error: "No se pudieron cargar los departamentos"
- Verificar JWT token válido
- Verificar que `organization_id` existe en localStorage
- Verificar permisos de admin

### Los departamentos no aparecen
- Verificar que pertenecen a la organización correcta
- Verificar que hay departamentos creados
- Revisar consola del navegador para errores

### Error al eliminar departamento
- Verificar que tienes permisos de admin
- Verificar que el departamento pertenece a tu organización
- Revisar si hay restricciones de foreign key

### Contador de empleados en 0
- Verificar que los usuarios tienen `department_id` asignado
- Verificar que `department_id` apunta a departamentos existentes
- Ejecutar query manual para validar datos

## 📝 Ejemplos de Uso

### Crear Departamento

```typescript
const newDepartment = {
  name: "Investigación y Desarrollo",
  description: "Innovación y desarrollo de nuevos productos",
  color: "#8B5CF6",
  active: true
};

const response = await orgApi('/api/admin/departments', {
  method: 'POST',
  body: newDepartment
});

if (response.ok) {
  toast({ title: "✅ Departamento creado" });
}
```

### Asignar Usuario a Departamento

```typescript
// En el perfil del usuario o admin panel
await executeQuery(
  `UPDATE users 
   SET department_id = ?, updated_at = NOW() 
   WHERE id = ? AND organization_id = ?`,
  [departmentId, userId, organizationId]
);
```

### Listar Usuarios de un Departamento

```typescript
const users = await executeQuery(
  `SELECT u.*, d.name as department_name, d.color as department_color
   FROM users u
   JOIN organization_departments d ON u.department_id = d.id
   WHERE d.id = ? AND d.organization_id = ?`,
  [departmentId, organizationId]
);
```

## 👨‍💻 Mantenimiento

### Seed de Departamentos de Ejemplo
```bash
node scripts/seed-departments.js
```

### Verificar Estructura
```bash
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({ host: '151.106.99.1', user: 'u191251575_BoomlearnOS', password: 'Cerounocero.com20182417', database: 'u191251575_BoomlearnOS' }); const [cols] = await conn.execute('DESCRIBE organization_departments'); console.table(cols); await conn.end(); })();"
```

### Limpiar Departamentos de Test
```sql
DELETE FROM organization_departments 
WHERE name LIKE '%Test%' 
  AND organization_id = 'your-org-id';
```

## 💡 Mejores Prácticas

1. **Nombres Claros**: Usa nombres descriptivos y profesionales
2. **Colores Consistentes**: Mantén coherencia con el branding
3. **Descripciones Completas**: Ayuda a nuevos empleados a entender cada área
4. **Mantén Activos**: Desactiva departamentos obsoletos en lugar de eliminarlos
5. **Revisa Regularmente**: Actualiza la estructura según crece la organización
6. **Documentación**: Mantén un organigrama actualizado
7. **Comunicación**: Notifica cambios importantes en la estructura

## 📞 Soporte

Para soporte o preguntas sobre el sistema de departamentos:
- Revisar esta documentación
- Verificar logs en la consola del navegador
- Verificar logs del servidor Next.js
- Revisar estructura de base de datos
- Consultar con el equipo de desarrollo

---

**Última actualización**: Octubre 2025  
**Versión del sistema**: 2.0  
**Mantenedor**: BoomlearnOS Team
