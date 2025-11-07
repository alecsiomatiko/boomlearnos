# Sistema de Recompensas - Documentacion Tecnica

## Descripcion General

Sistema de marketplace donde usuarios pueden canjear gemas por beneficios tangibles. Los administradores crean y gestionan recompensas con control de stock, rarezas y categorias.

## Arquitectura del Sistema

### Diagrama de Flujo

```
[Admin Crea Recompensa] → [BD: rewards] → [Usuario Ve Marketplace]
                                                    |
                                                    v
                                    [Usuario Selecciona Recompensa]
                                                    |
                                                    v
                                         [Verifica Gemas y Stock]
                                                    |
                                   +----------------+----------------+
                                   |                                 |
                                   v                                 v
                          [Suficientes Gemas]              [Gemas Insuficientes]
                                   |                                 |
                                   v                                 v
                    [Descuenta Gemas]                    [Muestra Error]
                           |
                           v
              [BD: user_rewards + user_gems]
                           |
                           v
                [Notifica Admin del Canje]
```

## Estructura de Base de Datos

### Tabla: rewards

Almacena todas las recompensas disponibles para canje.

```sql
CREATE TABLE rewards (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  organization_id VARCHAR(36) NOT NULL,           -- Multi-tenancy
  title VARCHAR(255) NOT NULL,                    -- Nombre de la recompensa
  description TEXT NOT NULL,                      -- Descripcion detallada
  cost INT NOT NULL,                              -- Gemas necesarias
  category VARCHAR(50) NOT NULL,                  -- Tiempo, Beneficios, etc.
  rarity ENUM('common','rare','epic','legendary') DEFAULT 'common',
  icon VARCHAR(100) DEFAULT 'gift',               -- Icono UI
  stock_limit INT DEFAULT -1,                     -- -1 = ilimitado
  claimed_count INT DEFAULT 0,                    -- Veces canjeada
  is_available TINYINT(1) DEFAULT 1,              -- Activa/Inactiva
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_rewards_org_available (organization_id, is_available)
);
```

**Campos clave:**
- `stock_limit = -1`: Stock ilimitado
- `claimed_count`: Incrementa con cada canje
- `is_available`: Admin puede desactivar temporalmente

### Tabla: user_rewards

Registra cada canje de recompensa por usuario.

```sql
CREATE TABLE user_rewards (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  user_id VARCHAR(36) NOT NULL,
  reward_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,           -- Multi-tenancy
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Cuando se canjeo
  status ENUM('claimed', 'used', 'expired') DEFAULT 'claimed',
  notes TEXT,                                      -- Admin puede agregar notas
  
  INDEX idx_user_rewards_user (user_id),
  INDEX idx_user_rewards_reward (reward_id),
  INDEX idx_user_rewards_org (organization_id)
);
```

**Estados posibles:**
- `claimed`: Canjeada pero no usada
- `used`: Confirmada por admin como utilizada
- `expired`: Venció sin usar (si aplica tiempo limite)

## Sistema de Rarezas

Las rarezas determinan el valor y frecuencia de las recompensas:

| Rareza | Color | Uso Recomendado | Costo Sugerido | Ejemplo |
|--------|-------|-----------------|----------------|---------|
| **common** | Gris | Beneficios diarios | 25-75 gemas | Cafe gratis, 30min extra |
| **rare** | Azul | Beneficios semanales | 80-150 gemas | Dia home office, almuerzo premium |
| **epic** | Morado | Beneficios mensuales | 160-300 gemas | Medio dia libre, gift card 50 USD |
| **legendary** | Dorado | Beneficios trimestrales | 350-500 gemas | Dia completo libre, curso profesional |

### Implementacion en UI

```typescript
const rarityConfig = {
  common: { color: 'text-gray-500', bg: 'bg-gray-100' },
  rare: { color: 'text-blue-500', bg: 'bg-blue-100' },
  epic: { color: 'text-purple-500', bg: 'bg-purple-100' },
  legendary: { color: 'text-yellow-500', bg: 'bg-yellow-100' }
};
```

## Categorias de Recompensas

Sugerencias para organizar las recompensas:

- **Tiempo**: Horas libres, dias flexibles, home office, salida temprano
- **Beneficios**: Snacks, comidas, bebidas premium, estacionamiento VIP
- **Premios**: Gift cards, productos fisicos, gadgets
- **Desarrollo**: Cursos online, libros, certificaciones, conferencias
- **Entretenimiento**: Entradas cine, eventos deportivos, conciertos
- **Oficina**: Equipamiento ergonomico, accesorios tech, upgrades workspace

Las categorias son strings libres, permitiendo personalizacion por organizacion.

## Panel de Administracion

### Ruta: /admin/rewards

Interfaz completa para gestion de recompensas.

**Funcionalidades:**

1. **Crear Recompensas**
   - Formulario con todos los campos (title, description, cost, etc.)
   - Selector de rareza con preview de colores
   - Selector de icono con galeria visual
   - Toggle stock ilimitado vs limitado
   - Toggle disponibilidad inmediata

2. **Listar Recompensas**
   - Vista en grid con cards por rareza
   - Filtros por categoria y rareza
   - Busqueda por titulo
   - Indicador de stock bajo (<=3 unidades)

3. **Editar Recompensas**
   - Modal con formulario pre-poblado
   - Actualizacion en tiempo real
   - Validacion de campos

4. **Eliminar Recompensas**
   - Dialog de confirmacion obligatorio
   - Eliminacion en cascada de user_rewards relacionados
   - Scoped por organization_id

5. **Estadisticas en Tiempo Real**
   - Total de recompensas creadas
   - Recompensas actualmente disponibles
   - Total de canjes realizados
   - Costo promedio de recompensas

## API Endpoints

Todos los endpoints requieren autenticacion JWT y rol de admin.

### GET /api/admin/rewards

Obtiene todas las recompensas de la organizacion.

**Autenticacion:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Params:**
```
organization_id: string (automatico via useOrgApi)
```

**Response 200:**
```json
[
  {
    "id": "uuid-v4",
    "organization_id": "org-uuid",
    "title": "30 Minutos Extra de Descanso",
    "description": "Obtén 30 minutos adicionales en tu hora de almuerzo",
    "cost": 50,
    "category": "Tiempo",
    "rarity": "common",
    "icon": "Clock",
    "stock_limit": -1,
    "claimed_count": 12,
    "is_available": true,
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-20T14:30:00.000Z"
  }
]
```

**Response 401:** Token invalido o expirado
**Response 403:** Usuario no es admin

---

### POST /api/admin/rewards

Crea una nueva recompensa.

**Body:**
```json
{
  "title": "Café Premium Gratis",
  "description": "Un café premium de tu elección en la cafetería",
  "cost": 25,
  "category": "Beneficios",
  "rarity": "common",
  "icon": "Gift",
  "stock_limit": null,
  "is_available": true
}
```

**Validaciones:**
- `title`: required, max 255 chars
- `description`: required
- `cost`: required, >= 0
- `category`: required, max 50 chars
- `rarity`: enum ['common', 'rare', 'epic', 'legendary']
- `stock_limit`: number o null (null = ilimitado)

**Response 201:**
```json
{
  "success": true,
  "message": "Recompensa creada exitosamente",
  "data": {
    "id": "new-reward-uuid"
  }
}
```

**Response 400:** Validacion fallida
**Response 401:** No autenticado
**Response 403:** No es admin

---

### PUT /api/admin/rewards/:id

Actualiza una recompensa existente.

**Body (campos opcionales):**
```json
{
  "title": "Nuevo Titulo",
  "cost": 100,
  "is_available": false,
  "stock_limit": 10
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Recompensa actualizada exitosamente"
}
```

**Response 404:** Recompensa no encontrada o no pertenece a la org
**Response 401/403:** Autenticacion/autorizacion fallida

---

### DELETE /api/admin/rewards/:id

Elimina una recompensa de forma permanente.

**Proceso:**
1. Verifica que pertenece a la organizacion del admin
2. Elimina registros relacionados en `user_rewards` (CASCADE)
3. Elimina la recompensa

**Response 200:**
```json
{
  "success": true,
  "message": "Recompensa eliminada exitosamente"
}
```

**Response 404:** No encontrada
**Response 401/403:** Sin permisos

## Uso en Frontend

### Hook useOrgApi

Todas las peticiones a la API de recompensas usan este hook que automaticamente:
- Agrega `organization_id` como query param en GET requests
- Agrega `organization_id` al body en POST/PUT requests
- Incluye JWT token en headers
- Maneja errores de autenticacion

**Ejemplo completo:**

```typescript
import { useOrgApi } from '@/hooks/useOrgApi';

function RewardsAdmin() {
  const orgApi = useOrgApi();
  const [rewards, setRewards] = useState([]);
  
  // GET - Listar recompensas
  const loadRewards = async () => {
    try {
      const data = await orgApi('/api/admin/rewards', {
        method: 'GET'
      });
      setRewards(data);
    } catch (error) {
      console.error('Error cargando recompensas:', error);
    }
  };
  
  // POST - Crear recompensa
  const createReward = async (formData) => {
    try {
      const response = await orgApi('/api/admin/rewards', {
        method: 'POST',
        body: {
          title: formData.title,
          description: formData.description,
          cost: formData.cost,
          category: formData.category,
          rarity: formData.rarity,
          icon: formData.icon,
          stock_limit: formData.unlimited ? null : formData.stock,
          is_available: formData.active
        }
      });
      
      if (response.success) {
        await loadRewards(); // Recargar lista
        toast.success('Recompensa creada');
      }
    } catch (error) {
      toast.error('Error creando recompensa');
    }
  };
  
  // PUT - Actualizar recompensa
  const updateReward = async (id, updates) => {
    try {
      await orgApi(`/api/admin/rewards/${id}`, {
        method: 'PUT',
        body: updates
      });
      await loadRewards();
      toast.success('Recompensa actualizada');
    } catch (error) {
      toast.error('Error actualizando');
    }
  };
  
  // DELETE - Eliminar recompensa
  const deleteReward = async (id) => {
    if (!confirm('¿Eliminar esta recompensa?')) return;
    
    try {
      await orgApi(`/api/admin/rewards/${id}`, {
        method: 'DELETE'
      });
      await loadRewards();
      toast.success('Recompensa eliminada');
    } catch (error) {
      toast.error('Error eliminando');
    }
  };
  
  useEffect(() => {
    loadRewards();
  }, []);
  
  return (
    // UI components...
  );
}
```

## Seguridad y Validaciones

### Autenticacion
- JWT token requerido en header `Authorization: Bearer <token>`
- Token validado en cada request
- Expiracion: 7 dias

### Autorizacion
- Solo usuarios con `role = 'admin'` pueden acceder
- Verificado via middleware en cada endpoint

### Multi-tenancy
- Todas las operaciones filtradas por `organization_id`
- Admin solo puede ver/editar recompensas de su organizacion
- Scope automatico via `useOrgApi` hook

### Validaciones Backend

```typescript
// POST /api/admin/rewards
const schema = {
  title: { required: true, maxLength: 255 },
  description: { required: true },
  cost: { required: true, type: 'number', min: 0 },
  category: { required: true, maxLength: 50 },
  rarity: { enum: ['common', 'rare', 'epic', 'legendary'] },
  icon: { maxLength: 100 },
  stock_limit: { type: 'number', nullable: true },
  is_available: { type: 'boolean' }
};
```

### SQL Injection Prevention
- Prepared statements en todas las queries
- Parametros escapados automaticamente por mysql2/promise

```typescript
// Ejemplo seguro
const [rewards] = await pool.execute(
  'SELECT * FROM rewards WHERE organization_id = ? AND is_available = ?',
  [orgId, true]
);
```

## Control de Stock

### Stock Ilimitado

```typescript
// En formulario
const unlimited = true;

// Se guarda como
{ stock_limit: null }  // o -1 dependiendo de la implementacion
```

Permite canjes infinitos sin restriccion.

### Stock Limitado

```typescript
// En formulario
const unlimited = false;
const stock = 10;

// Se guarda como
{ stock_limit: 10, claimed_count: 0 }
```

### Logica de Disponibilidad

```typescript
// Verificar si hay stock disponible
function hasStock(reward) {
  if (reward.stock_limit === null || reward.stock_limit === -1) {
    return true; // Stock ilimitado
  }
  
  return reward.claimed_count < reward.stock_limit;
}

// Calcular stock restante
function getRemainingStock(reward) {
  if (reward.stock_limit === null || reward.stock_limit === -1) {
    return Infinity;
  }
  
  return Math.max(0, reward.stock_limit - reward.claimed_count);
}

// Detectar stock bajo (alerta para admin)
function isLowStock(reward) {
  const remaining = getRemainingStock(reward);
  return remaining !== Infinity && remaining <= 3 && remaining > 0;
}
```

### Auto-desactivacion

Cuando `claimed_count` alcanza `stock_limit`, el sistema automaticamente:

```sql
UPDATE rewards 
SET is_available = 0 
WHERE id = ? AND claimed_count >= stock_limit;
```

Esto previene canjes adicionales hasta que admin actualice el stock.

## Iconos Disponibles

Iconos de lucide-react usados en el sistema:

| Nombre | Icono | Uso Recomendado |
|--------|-------|-----------------|
| Gift | 🎁 | Regalos, beneficios generales |
| Clock | ⏰ | Tiempo libre, descansos, flexibilidad |
| Target | 🎯 | Objetivos, metas, logros |
| Zap | ⚡ | Rapidez, eficiencia, bonos especiales |
| Star | ⭐ | Destacados, premium, favoritos |
| Package | 📦 | Productos fisicos, entregas |
| Trophy | 🏆 | Premios, competencias, ganadores |
| Sparkles | ✨ | Especiales, magicos, exclusivos |
| Crown | 👑 | VIP, exclusivos, top tier |
| Coffee | ☕ | Bebidas, snacks, desayunos |
| Book | 📚 | Educacion, cursos, capacitacion |
| Ticket | 🎫 | Eventos, entradas, experiencias |

### Implementacion

```typescript
import { Gift, Clock, Trophy, Crown } from 'lucide-react';

const iconMap = {
  'Gift': Gift,
  'Clock': Clock,
  'Trophy': Trophy,
  'Crown': Crown,
  // ... resto de iconos
};

// Renderizar dinamicamente
function RewardIcon({ name }) {
  const Icon = iconMap[name] || Gift; // Gift es default
  return <Icon className="w-6 h-6" />;
}
```

## Flujo de Canje (Usuario Final)

### Diagrama de Proceso

```
[Usuario en /dashboard/rewards]
         |
         v
[Ve grid de recompensas disponibles]
         |
         v
[Selecciona recompensa y hace click en "Canjear"]
         |
         v
[Modal de confirmacion muestra costo y descripcion]
         |
         v
[Usuario confirma] ---------> [Usuario cancela]
         |                            |
         v                            v
[Verifica gemas]                 [Cierra modal]
         |
    +----+----+
    |         |
    v         v
[Tiene]   [No tiene]
    |         |
    v         v
[Verifica    [Muestra error
 stock]       "Gemas insuficientes"]
    |
    +----+----+
    |         |
    v         v
[Hay]     [No hay]
    |         |
    v         v
[Procesa   [Muestra error
 canje]     "Sin stock"]
    |
    v
[Transaction BEGIN]
    |
    v
[UPDATE users SET gems = gems - cost WHERE id = ?]
    |
    v
[INSERT INTO user_gems (type='spend', amount=-cost)]
    |
    v
[INSERT INTO user_rewards (user_id, reward_id, status='claimed')]
    |
    v
[UPDATE rewards SET claimed_count = claimed_count + 1]
    |
    v
[Si claimed_count >= stock_limit: UPDATE rewards SET is_available=0]
    |
    v
[Transaction COMMIT]
    |
    v
[Notifica admin via email/dashboard]
    |
    v
[Muestra confirmacion al usuario con confetti]
```

### Implementacion del Endpoint

**POST /api/rewards/claim**

```typescript
// Request
{
  "reward_id": "uuid-of-reward"
}

// Proceso backend
async function claimReward(userId, rewardId, organizationId) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Verificar usuario tiene gemas suficientes
    const [users] = await connection.execute(
      'SELECT gems FROM users WHERE id = ?',
      [userId]
    );
    
    // 2. Verificar recompensa existe y esta disponible
    const [rewards] = await connection.execute(
      'SELECT * FROM rewards WHERE id = ? AND organization_id = ? AND is_available = 1',
      [rewardId, organizationId]
    );
    
    const reward = rewards[0];
    const user = users[0];
    
    if (user.gems < reward.cost) {
      throw new Error('Gemas insuficientes');
    }
    
    // 3. Verificar stock
    if (reward.stock_limit !== null && 
        reward.stock_limit !== -1 && 
        reward.claimed_count >= reward.stock_limit) {
      throw new Error('Sin stock disponible');
    }
    
    // 4. Descontar gemas
    await connection.execute(
      'UPDATE users SET gems = gems - ? WHERE id = ?',
      [reward.cost, userId]
    );
    
    // 5. Registrar transaccion de gemas
    await connection.execute(
      `INSERT INTO user_gems (user_id, amount, type, description, source, organization_id)
       VALUES (?, ?, 'spend', ?, 'reward_claim', ?)`,
      [userId, -reward.cost, `Canje: ${reward.title}`, organizationId]
    );
    
    // 6. Crear registro de canje
    await connection.execute(
      `INSERT INTO user_rewards (user_id, reward_id, organization_id, status)
       VALUES (?, ?, ?, 'claimed')`,
      [userId, rewardId, organizationId]
    );
    
    // 7. Incrementar claimed_count
    await connection.execute(
      'UPDATE rewards SET claimed_count = claimed_count + 1 WHERE id = ?',
      [rewardId]
    );
    
    // 8. Si se agoto stock, desactivar
    if (reward.stock_limit !== null && 
        reward.stock_limit !== -1 && 
        (reward.claimed_count + 1) >= reward.stock_limit) {
      await connection.execute(
        'UPDATE rewards SET is_available = 0 WHERE id = ?',
        [rewardId]
      );
    }
    
    await connection.commit();
    
    // 9. Notificar admin (async, no bloquea response)
    notifyAdminOfClaim(userId, reward);
    
    return { success: true, reward, newBalance: user.gems - reward.cost };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

## Metricas y Reportes

### Queries SQL Utiles

**Recompensas mas populares**
```sql
SELECT 
  title, 
  claimed_count,
  cost,
  (claimed_count * cost) as total_gems_spent
FROM rewards 
WHERE organization_id = ? 
ORDER BY claimed_count DESC 
LIMIT 10;
```

**Gemas gastadas por categoria**
```sql
SELECT 
  r.category, 
  SUM(r.cost * r.claimed_count) as total_gems,
  COUNT(*) as total_rewards,
  SUM(r.claimed_count) as total_claims
FROM rewards r
WHERE r.organization_id = ?
GROUP BY r.category
ORDER BY total_gems DESC;
```

**Usuarios con mas canjes**
```sql
SELECT 
  u.first_name,
  u.last_name,
  COUNT(ur.id) as total_claims,
  SUM(r.cost) as total_spent
FROM user_rewards ur
JOIN users u ON ur.user_id = u.id
JOIN rewards r ON ur.reward_id = r.id
WHERE ur.organization_id = ?
GROUP BY u.id
ORDER BY total_claims DESC
LIMIT 20;
```

**Recompensas con stock bajo**
```sql
SELECT 
  title,
  stock_limit,
  claimed_count,
  (stock_limit - claimed_count) as remaining
FROM rewards
WHERE organization_id = ?
  AND stock_limit > 0
  AND (stock_limit - claimed_count) <= 3
  AND is_available = 1
ORDER BY remaining ASC;
```

**Historial de canjes recientes**
```sql
SELECT 
  u.first_name,
  u.last_name,
  r.title as reward_title,
  r.cost,
  ur.claimed_at,
  ur.status
FROM user_rewards ur
JOIN users u ON ur.user_id = u.id
JOIN rewards r ON ur.reward_id = r.id
WHERE ur.organization_id = ?
ORDER BY ur.claimed_at DESC
LIMIT 50;
```

### Dashboard de Metricas (Sugerido)

Componente admin que muestra:

1. **KPIs principales**
   - Total gemas en circulacion
   - Total gemas gastadas en recompensas
   - Promedio de gemas por usuario
   - Tasa de canje (usuarios activos canjeando)

2. **Graficos**
   - Canjes por semana/mes (linea)
   - Canjes por categoria (dona)
   - Top 10 recompensas (barra)

3. **Alertas**
   - Recompensas con stock bajo
   - Recompensas sin canjes (revisar precio/atractivo)
   - Usuarios con muchas gemas sin gastar (engagement)

## Archivos del Sistema

```
app/
  admin/
    rewards/
      page.tsx                   # Panel admin de recompensas
  api/
    admin/
      rewards/
        route.ts                 # GET, POST
        [id]/route.ts            # PUT, DELETE
    rewards/
      claim/route.ts             # POST - Canje por usuario
      
components/
  admin/
    rewards/
      reward-form.tsx            # Formulario crear/editar
      rewards-grid.tsx           # Grid de cards
      reward-stats.tsx           # Estadisticas
  dashboard/
    rewards/
      rewards-marketplace.tsx    # Vista usuario
      reward-card.tsx            # Card individual
      claim-modal.tsx            # Modal de confirmacion

database/
  create-rewards-tables.sql      # Schema completo

hooks/
  useRewards.ts                  # Hook para consumir API
```

## Proximos Pasos

**Mejoras sugeridas:**

1. **Sistema de Categorias Dinamicas**
   - Tabla `reward_categories` para definir categorias custom
   - Iconos y colores por categoria

2. **Notificaciones Push**
   - Notificar admin cuando hay canje
   - Notificar usuario cuando hay nueva recompensa

3. **Historial y Estadisticas**
   - Pagina de historial de canjes para usuario
   - Graficos de uso para admin

4. **Recompensas Temporales**
   - Campo `valid_until` para recompensas con expiracion
   - Cron job para marcar como `expired`

5. **Sistema de Aprobacion**
   - Admin debe aprobar ciertos canjes manualmente
   - Estado `pending_approval` en user_rewards

6. **Cupones QR**
   - Generar QR code al canjear
   - Admin escanea para marcar como `used`

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
