# 🏢 Sistema de Departamentos - BoomlearnOS

## 📋 Descripción General

El sistema de departamentos permite a los administradores crear, gestionar y organizar la estructura departamental de su organización, facilitando la asignación de empleados a diferentes áreas funcionales.

## 🗄️ Estructura de Base de Datos

### Tabla: `organization_departments`

```sql
CREATE TABLE organization_departments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(16),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_departments (organization_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

### Relación con Usuarios

```sql
-- Tabla users tiene:
department_id VARCHAR(36),
INDEX idx_users_department (department_id),
FOREIGN KEY (department_id) REFERENCES organization_departments(id) ON DELETE SET NULL
```

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

- Paleta de 8 colores predefinidos
- Selector de color personalizado (cualquier hex)
- Input manual de código hexadecimal
- Vista previa en tiempo real

## 📊 Panel de Administración

### Ruta: `/admin/departments`

#### Características:

1. **✨ Crear Departamentos**
   - Nombre descriptivo
   - Descripción detallada
   - Color identificativo (predefinido o custom)
   - Estado activo/inactivo

2. **✏️ Editar Departamentos**
   - Modificar información
   - Cambiar color
   - Activar/desactivar
   - Actualización en tiempo real

3. **🗑️ Eliminar Departamentos**
   - Confirmación obligatoria
   - Los usuarios asignados se desvinculan (department_id = NULL)
   - Las invitaciones pendientes se eliminan
   - Scoped por organización

4. **📈 Estadísticas**
   - Total de departamentos
   - Departamentos activos
   - Empleados asignados (total)
   - Departamentos inactivos

5. **👥 Conteo de Empleados**
   - Muestra empleados asignados por departamento
   - Actualización automática con JOIN a tabla users
   - Vista en tiempo real

## 🔌 API Endpoints

### GET `/api/admin/departments`

Obtiene todos los departamentos de la organización con conteo de empleados.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Params:**
```
organization_id: string (automático vía useOrgApi)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "organization_id": "org-uuid",
    "name": "Marketing y Comunicación",
    "description": "Estrategias de marketing...",
    "color": "#EC4899",
    "active": true,
    "user_count": 5,
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
]
```

### POST `/api/admin/departments`

Crea un nuevo departamento.

**Body:**
```json
{
  "name": "Recursos Humanos",
  "description": "Gestión del talento y bienestar del personal",
  "color": "#10B981",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Departamento creado exitosamente",
  "data": {
    "id": "new-uuid"
  }
}
```

### PUT `/api/admin/departments/:id`

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
