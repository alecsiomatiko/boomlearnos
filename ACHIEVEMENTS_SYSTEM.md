# 🏆 Sistema de Logros Automáticos - BoomLearnOS

## 📋 Resumen

El sistema de logros permite crear achievements que se **desbloquean automáticamente** cuando los usuarios cumplen ciertas condiciones. Los administradores pueden crear, editar y eliminar logros desde el panel de administración.

---

## 🎯 Características Principales

### ✅ Desbloqueo Automático
Los logros se verifican y desbloquean automáticamente cuando:
- Un usuario completa una tarea
- Un usuario hace check-in diario
- El usuario acumula gemas
- El usuario envía mensajes

### 🎮 Tipos de Triggers (Condiciones)

1. **`tasks_completed`** - Tareas completadas
   - Ejemplo: "Completa 10 tareas"
   
2. **`checkin_streak`** - Racha de check-ins consecutivos
   - Ejemplo: "Mantén una racha de 7 días"
   
3. **`gems_earned`** - Gemas totales acumuladas
   - Ejemplo: "Acumula 500 gemas"
   
4. **`messages_sent`** - Mensajes enviados
   - Ejemplo: "Envía 25 mensajes"
   
5. **`manual`** - Desbloqueo manual por administrador
   - No se verifica automáticamente

### 🎨 Rarezas Disponibles
- **Common** (Común) - Gris
- **Uncommon** (Poco Común) - Verde
- **Rare** (Raro) - Azul
- **Epic** (Épico) - Púrpura
- **Legendary** (Legendario) - Dorado

---

## 🗄️ Estructura de Base de Datos

### Tabla: `achievements`
```sql
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  points INT DEFAULT 0,                    -- Gemas que otorga
  rarity ENUM(...) DEFAULT 'common',
  max_progress INT DEFAULT 1,
  icon VARCHAR(50) DEFAULT 'Target',
  active BOOLEAN DEFAULT true,
  
  -- 🆕 Campos de auto-desbloqueo
  trigger_type ENUM('manual', 'tasks_completed', 'checkin_streak', 'gems_earned', 'messages_sent') DEFAULT 'manual',
  trigger_value INT DEFAULT 0,             -- Valor necesario para desbloquear
  auto_unlock BOOLEAN DEFAULT false,       -- Si se verifica automáticamente
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_organization (organization_id),
  INDEX idx_auto_unlock (auto_unlock, active)
);
```

### Tabla: `user_achievements`
```sql
CREATE TABLE user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  progress INT DEFAULT 0,
  max_progress INT DEFAULT 1,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_achievement (achievement_id),
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
```

---

## 🚀 Instalación y Configuración

### 1. Migrar la Base de Datos
```bash
node scripts/add-achievements-auto-unlock.js
```
Este script:
- ✅ Crea la tabla `achievements` si no existe
- ✅ Agrega las columnas `trigger_type`, `trigger_value`, `auto_unlock`
- ✅ Crea la tabla `user_achievements`
- ✅ Crea índices necesarios

### 2. Insertar Logros de Ejemplo
```bash
node scripts/seed-achievements.js
```
Este script inserta 10 logros de ejemplo:
- 3 de tareas completadas
- 3 de rachas de check-in
- 3 de gemas acumuladas
- 1 de mensajes enviados

---

## 🎛️ Panel de Administración

### Acceso
`/admin/achievements`

### Funcionalidades

#### ➕ Crear Logro
1. Click en "Nuevo Logro"
2. Llenar el formulario:
   - **ID**: Identificador único (ej: `first_task`)
   - **Nombre**: Título del logro
   - **Descripción**: Texto descriptivo
   - **Categoría**: Clasificación (ej: Productividad)
   - **Gemas**: Puntos que otorga
   - **Rareza**: common, uncommon, rare, epic, legendary
   - **Progreso Máximo**: Valor máximo (generalmente igual a trigger_value)
   - **Icono**: Target, Medal, Trophy, etc.
   
3. **Configurar Auto-Desbloqueo**:
   - ☑️ Activar "Desbloqueo Automático"
   - Seleccionar **Tipo de Condición**
   - Ingresar **Valor Requerido**
   
4. Click en "Crear"

#### ✏️ Editar Logro
- Click en el botón de editar (lápiz)
- Modificar campos necesarios
- Click en "Actualizar"

#### 🗑️ Eliminar Logro
- Click en el botón de eliminar (papelera)
- Confirmar eliminación
- Se eliminan también los desbloqueos de usuarios

---

## 🔄 Flujo de Verificación Automática

### 1. Usuario realiza una acción
Ejemplo: Completa una tarea

### 2. Sistema verifica logros
```typescript
// En app/api/tasks/route.ts (línea ~260)
if (status === 'completed') {
  const achievementResponse = await fetch('/api/achievements/check');
  // ...
}
```

### 3. Endpoint `/api/achievements/check`
```typescript
// app/api/achievements/check/route.ts
POST /api/achievements/check
```

**Proceso:**
1. Obtiene todos los logros con `auto_unlock = true`
2. Para cada logro:
   - Verifica si el usuario ya lo tiene
   - Calcula el progreso actual según `trigger_type`
   - Si `currentValue >= trigger_value`:
     - Inserta en `user_achievements`
     - Otorga gemas al usuario
     - Registra en `gems_history`
3. Retorna lista de logros desbloqueados

### 4. Respuesta al frontend
```json
{
  "success": true,
  "data": {
    "checked": true,
    "unlockedCount": 2,
    "unlockedAchievements": [
      {
        "id": "first_task",
        "name": "Primera Tarea Completada",
        "points": 50,
        "trigger_type": "tasks_completed"
      }
    ]
  }
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Logro de Tareas
```javascript
{
  id: 'task_master',
  name: 'Maestro de Tareas',
  description: 'Completa 10 tareas',
  category: 'Productividad',
  points: 150,
  rarity: 'uncommon',
  max_progress: 10,
  icon: 'Trophy',
  trigger_type: 'tasks_completed',
  trigger_value: 10,
  auto_unlock: true
}
```

**¿Cómo se desbloquea?**
- El usuario completa su 10ª tarea
- El sistema cuenta: `SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'completed'`
- Si count >= 10 → Desbloquea el logro

### Ejemplo 2: Logro de Racha
```javascript
{
  id: 'streak_7',
  name: 'Una Semana Dedicado',
  description: 'Mantén una racha de 7 días consecutivos',
  category: 'Consistencia',
  points: 200,
  rarity: 'uncommon',
  max_progress: 7,
  icon: 'Flame',
  trigger_type: 'checkin_streak',
  trigger_value: 7,
  auto_unlock: true
}
```

**¿Cómo se desbloquea?**
- El usuario hace check-in por 7 días seguidos
- El sistema lee: `SELECT current_streak FROM users WHERE id = ?`
- Si current_streak >= 7 → Desbloquea el logro

---

## 🔗 Integración en el Sistema

### Puntos de Verificación Actuales

1. **Completar Tarea**
   - `app/api/tasks/route.ts` (PUT)
   - Verifica: `tasks_completed`

2. **Check-in Diario**
   - `app/dashboard/control/page.tsx`
   - Verifica: `checkin_streak`, `gems_earned`

3. **Manual (opcional)**
   - Puedes agregar más llamadas a `/api/achievements/check`

### Agregar Nuevos Puntos de Verificación

```typescript
// Después de cualquier acción importante
try {
  const response = await authFetch('/api/achievements/check', {
    method: 'POST'
  });
  const data = await response.json();
  
  if (data.success && data.data.unlockedCount > 0) {
    // Mostrar notificaciones de logros
    data.data.unlockedAchievements.forEach(achievement => {
      toast.success(`🏆 Logro desbloqueado: ${achievement.name}`);
    });
  }
} catch (error) {
  console.error('Error checking achievements:', error);
}
```

---

## 🧪 Testing

### Probar Logros Manualmente

1. **Primera Tarea**
   ```bash
   # Completa 1 tarea
   # Debería desbloquear: "Primera Tarea Completada" (+50 gemas)
   ```

2. **Racha de 3 Días**
   ```bash
   # Haz check-in 3 días seguidos
   # Debería desbloquear: "Racha Inicial" (+75 gemas)
   ```

3. **100 Gemas**
   ```bash
   # Acumula 100 gemas totales
   # Debería desbloquear: "Coleccionista Novato" (+100 gemas)
   ```

### Verificar en Base de Datos

```sql
-- Ver logros de un usuario
SELECT 
  a.name,
  a.description,
  ua.unlocked_at,
  a.points
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = 'TU_USER_ID';

-- Ver progreso del usuario
SELECT 
  name,
  email,
  total_gems,
  current_streak,
  (SELECT COUNT(*) FROM tasks WHERE user_id = users.id AND status = 'completed') as tasks_completed
FROM users
WHERE id = 'TU_USER_ID';
```

---

## 🐛 Troubleshooting

### Logro no se desbloquea

1. **Verificar que `auto_unlock = true`**
   ```sql
   SELECT id, name, auto_unlock, trigger_type, trigger_value 
   FROM achievements 
   WHERE id = 'logro_id';
   ```

2. **Verificar progreso del usuario**
   ```sql
   -- Para tasks_completed
   SELECT COUNT(*) FROM tasks 
   WHERE user_id = 'user_id' AND status = 'completed';
   
   -- Para checkin_streak
   SELECT current_streak FROM users WHERE id = 'user_id';
   
   -- Para gems_earned
   SELECT total_gems FROM users WHERE id = 'user_id';
   ```

3. **Verificar si ya está desbloqueado**
   ```sql
   SELECT * FROM user_achievements 
   WHERE user_id = 'user_id' AND achievement_id = 'logro_id';
   ```

4. **Ver logs del servidor**
   ```bash
   # Buscar en la consola:
   🏆 Verificando X logros automáticos
   📋 Tareas completadas: X/Y
   ✅ Desbloqueando logro: NOMBRE
   ```

---

## 📚 API Reference

### `POST /api/achievements/check`
**Descripción:** Verifica y desbloquea logros automáticos para el usuario actual

**Auth:** Requiere JWT token

**Request:**
```typescript
POST /api/achievements/check
Headers: {
  Authorization: Bearer <token>
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    checked: true,
    unlockedCount: number,
    unlockedAchievements: Array<{
      id: string,
      name: string,
      points: number,
      trigger_type: string
    }>
  }
}
```

### `GET /api/admin/achievements`
**Descripción:** Lista todos los logros de la organización

**Auth:** Requiere admin

### `POST /api/admin/achievements`
**Descripción:** Crea un nuevo logro

**Auth:** Requiere admin

**Body:**
```typescript
{
  id: string,
  name: string,
  description: string,
  category: string,
  points: number,
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
  max_progress: number,
  icon: string,
  trigger_type?: 'tasks_completed' | 'checkin_streak' | 'gems_earned' | 'messages_sent' | 'manual',
  trigger_value?: number,
  auto_unlock?: boolean
}
```

### `PUT /api/admin/achievements/:id`
**Descripción:** Actualiza un logro existente

**Auth:** Requiere admin

### `DELETE /api/admin/achievements/:id`
**Descripción:** Elimina un logro

**Auth:** Requiere admin

---

## 🎯 Roadmap

### Próximas Mejoras
- [ ] Logros con múltiples condiciones (AND/OR)
- [ ] Progreso parcial visible en UI
- [ ] Notificaciones push de logros
- [ ] Badges visuales en perfil
- [ ] Leaderboard de logros
- [ ] Exportar/Importar logros entre organizaciones

---

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de Troubleshooting
2. Verifica los logs del servidor
3. Ejecuta `node scripts/check-achievements-table.js` para diagnóstico

---

**Desarrollado para BoomLearnOS** 🚀
