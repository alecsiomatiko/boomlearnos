# 💎 Sistema de Recompensas - BoomlearnOS

## 📋 Descripción General

El sistema de recompensas permite a los administradores crear, gestionar y controlar un marketplace donde los usuarios pueden canjear sus gemas por beneficios tangibles.

## 🗄️ Estructura de Base de Datos

### Tabla: `rewards`

```sql
CREATE TABLE rewards (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  organization_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cost INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  rarity ENUM('common','rare','epic','legendary') DEFAULT 'common',
  icon VARCHAR(100) DEFAULT 'gift',
  stock_limit INT DEFAULT -1,
  claimed_count INT DEFAULT 0,
  is_available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rewards_org_available (organization_id, is_available)
);
```

### Tabla: `user_rewards`

```sql
CREATE TABLE user_rewards (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  user_id VARCHAR(36) NOT NULL,
  reward_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('claimed', 'used', 'expired') DEFAULT 'claimed',
  notes TEXT,
  INDEX idx_user_rewards_user (user_id),
  INDEX idx_user_rewards_reward (reward_id),
  INDEX idx_user_rewards_org (organization_id)
);
```

## 🎨 Rarezas de Recompensas

| Rareza | Color | Uso Recomendado | Costo Típico |
|--------|-------|-----------------|--------------|
| **⚪ Común** | Gris | Beneficios pequeños, alta frecuencia | 25-75 gemas |
| **🔵 Rara** | Azul | Beneficios medios, frecuencia moderada | 80-150 gemas |
| **🟣 Épica** | Morado | Beneficios significativos, baja frecuencia | 160-300 gemas |
| **🟡 Legendaria** | Dorado | Beneficios premium, muy baja frecuencia | 350-500 gemas |

## 🎯 Categorías Sugeridas

- **⏰ Tiempo**: Horas libres, días flexibles, home office
- **🎁 Beneficios**: Snacks, comidas, bebidas premium
- **🏆 Premios**: Gift cards, productos físicos
- **📚 Desarrollo**: Cursos, libros, certificaciones
- **🎬 Entretenimiento**: Entradas cine, eventos, experiencias
- **🏢 Oficina**: Equipamiento, accesorios, upgrades

## 📊 Panel de Administración

### Ruta: `/admin/rewards`

#### Características:

1. **✨ Crear Recompensas**
   - Formulario completo con validaciones
   - Selección de rareza e icono
   - Control de stock (ilimitado o limitado)
   - Toggle de disponibilidad

2. **✏️ Editar Recompensas**
   - Modificar cualquier campo
   - Actualización en tiempo real
   - Historial de cambios

3. **🗑️ Eliminar Recompensas**
   - Confirmación obligatoria
   - Eliminación en cascada de user_rewards
   - Scoped por organización

4. **📈 Estadísticas**
   - Total de recompensas
   - Recompensas disponibles
   - Total canjeadas
   - Costo promedio

## 🔌 API Endpoints

### GET `/api/admin/rewards`

Obtiene todas las recompensas de la organización.

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
    "title": "30 Minutos Extra",
    "description": "Obtén 30 minutos adicionales...",
    "cost": 50,
    "category": "Tiempo",
    "rarity": "common",
    "icon": "Clock",
    "stock_limit": -1,
    "claimed_count": 5,
    "is_available": true,
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
]
```

### POST `/api/admin/rewards`

Crea una nueva recompensa.

**Body:**
```json
{
  "title": "Café Premium Gratis",
  "description": "Un café premium de tu elección",
  "cost": 25,
  "category": "Beneficios",
  "rarity": "common",
  "icon": "Gift",
  "stock_limit": null,
  "is_available": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recompensa creada exitosamente",
  "data": {
    "id": "new-uuid"
  }
}
```

### PUT `/api/admin/rewards/:id`

Actualiza una recompensa existente.

**Body:** (campos opcionales)
```json
{
  "title": "Nuevo Título",
  "cost": 100,
  "is_available": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recompensa actualizada exitosamente"
}
```

### DELETE `/api/admin/rewards/:id`

Elimina una recompensa.

**Response:**
```json
{
  "success": true,
  "message": "Recompensa eliminada exitosamente"
}
```

## 🎮 Uso en Frontend (Cliente)

### Hook: `useOrgApi`

Todas las peticiones usan este hook que automáticamente:
- Añade `organization_id` como query param (GET)
- Añade `organization_id` al body (POST/PUT)
- Maneja autenticación JWT

**Ejemplo:**
```typescript
const orgApi = useOrgApi();

// GET
const response = await orgApi('/api/admin/rewards', { method: 'GET' });

// POST
const response = await orgApi('/api/admin/rewards', { 
  method: 'POST', 
  body: { title: '...', cost: 50 } 
});

// PUT
const response = await orgApi(`/api/admin/rewards/${id}`, { 
  method: 'PUT', 
  body: { cost: 75 } 
});

// DELETE
const response = await orgApi(`/api/admin/rewards/${id}`, { 
  method: 'DELETE' 
});
```

## 🛡️ Seguridad

1. **Autenticación**: JWT token requerido
2. **Autorización**: Solo usuarios con rol `admin`
3. **Multi-tenancy**: Todas las operaciones scoped por `organization_id`
4. **Validaciones**: 
   - Campos requeridos
   - Tipos de datos
   - Valores mínimos (cost >= 0)

## 📦 Control de Stock

### Stock Ilimitado
```javascript
stock_limit: null  // o -1
```

### Stock Limitado
```javascript
stock_limit: 10  // Solo 10 usuarios pueden canjear
```

### Cálculo de Stock Disponible
```javascript
const remaining = stock_limit - claimed_count;
```

### Estado de Stock Bajo
```javascript
const isLowStock = stock_limit > 0 && (stock_limit - claimed_count) <= 3;
```

## 🎨 Iconos Disponibles

- 🎁 **Gift**: Regalos generales
- ⏰ **Clock**: Tiempo, descansos
- 🎯 **Target**: Objetivos, metas
- ⚡ **Zap**: Velocidad, eficiencia
- ⭐ **Star**: Destacados, premium
- 📦 **Package**: Productos físicos
- 🏆 **Trophy**: Premios, logros
- ✨ **Sparkles**: Especiales, mágico
- 👑 **Crown**: Exclusivos, VIP

## 🔄 Flujo de Canje (Para Implementar)

1. Usuario ve recompensas disponibles en `/dashboard/rewards`
2. Usuario selecciona recompensa
3. Sistema verifica:
   - Usuario tiene suficientes gemas
   - Recompensa está disponible
   - Stock disponible (si aplica)
4. Sistema:
   - Descuenta gemas del usuario
   - Crea registro en `user_rewards`
   - Incrementa `claimed_count`
   - Si `claimed_count >= stock_limit`, marca `is_available = false`
5. Notifica al administrador del canje

## 📈 Métricas Sugeridas

```sql
-- Recompensas más populares
SELECT title, claimed_count 
FROM rewards 
WHERE organization_id = ? 
ORDER BY claimed_count DESC 
LIMIT 10;

-- Gemas invertidas por categoría
SELECT r.category, SUM(r.cost * r.claimed_count) as total_gems
FROM rewards r
WHERE r.organization_id = ?
GROUP BY r.category
ORDER BY total_gems DESC;

-- Tasa de conversión
SELECT 
  COUNT(DISTINCT ur.user_id) / (SELECT COUNT(*) FROM users WHERE organization_id = ?) * 100 as conversion_rate
FROM user_rewards ur
JOIN rewards r ON ur.reward_id = r.id
WHERE r.organization_id = ?;
```

## 🚀 Próximas Mejoras

- [ ] Sistema de notificaciones para canjes
- [ ] Dashboard de analytics de recompensas
- [ ] Recompensas temporales (fechas de inicio/fin)
- [ ] Recompensas por nivel de usuario
- [ ] Historial de canjes por usuario
- [ ] Exportación de reportes
- [ ] Códigos de canje únicos
- [ ] Integración con sistemas externos (gift cards APIs)

## 🐛 Troubleshooting

### Error: "No se pudieron cargar las recompensas"
- Verificar que `organization_id` está en localStorage
- Verificar JWT token válido
- Verificar permisos de admin

### Error: "No autorizado: falta organization_id"
- Llamar a `refreshUserProfile()` en auth-context
- Verificar que user.organization.id existe

### Recompensas no aparecen
- Verificar que `is_available = true`
- Verificar que pertenecen a la organización correcta
- Verificar que no hay filtros activos

## 📝 Notas de Migración

Si vienes de una versión anterior donde `organization_id` era INT:

```bash
node scripts/migrate-rewards-system.js
```

Este script:
- Convierte `organization_id` de INT a VARCHAR(36)
- Actualiza todas las recompensas a la organización principal
- Crea índices optimizados
- Verifica tabla `user_rewards`

## 👨‍💻 Mantenimiento

### Seed de Recompensas de Ejemplo
```bash
node scripts/seed-rewards.js
```

### Verificar Estructura
```bash
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({ host: '151.106.99.1', user: 'u191251575_BoomlearnOS', password: 'Cerounocero.com20182417', database: 'u191251575_BoomlearnOS' }); const [cols] = await conn.execute('DESCRIBE rewards'); console.table(cols); await conn.end(); })();"
```

## 📞 Soporte

Para soporte o preguntas sobre el sistema de recompensas:
- Revisar esta documentación
- Verificar logs en la consola del navegador
- Verificar logs del servidor Next.js
- Revisar estructura de base de datos

---

**Última actualización**: Octubre 2025  
**Versión del sistema**: 2.0  
**Mantenedor**: BoomlearnOS Team
