-- Agregar campos para condiciones automáticas de logros

USE u191251575_BoomlearnOS;

-- Agregar columnas de condiciones a la tabla achievements si no existen
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS trigger_type ENUM('tasks_completed', 'checkin_streak', 'gems_earned', 'messages_sent', 'manual') DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS trigger_value INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_unlock BOOLEAN DEFAULT false;

-- Ejemplos de logros automáticos
INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT 'first_task_completed', organization_id, 'Primera Tarea Completada', 'Completa tu primera tarea exitosamente', 'Productividad', 50, 'common', 1, 'Target', true, 'tasks_completed', 1, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = 'first_task_completed'
)
LIMIT 1;

INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT '5_tasks_master', organization_id, 'Maestro de Tareas', 'Completa 5 tareas exitosamente', 'Productividad', 100, 'uncommon', 5, 'Award', true, 'tasks_completed', 5, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = '5_tasks_master'
)
LIMIT 1;

INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT '3_day_streak', organization_id, 'Racha de 3 Días', 'Registra check-in 3 días consecutivos', 'Constancia', 75, 'uncommon', 3, 'Flame', true, 'checkin_streak', 3, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = '3_day_streak'
)
LIMIT 1;

INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT '7_day_streak', organization_id, 'Racha de 7 Días', 'Registra check-in 7 días consecutivos', 'Constancia', 150, 'rare', 7, 'Flame', true, 'checkin_streak', 7, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = '7_day_streak'
)
LIMIT 1;

INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT 'gem_collector_100', organization_id, 'Coleccionista de Gemas', 'Acumula 100 gemas', 'Recompensas', 50, 'uncommon', 100, 'Star', true, 'gems_earned', 100, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = 'gem_collector_100'
)
LIMIT 1;

INSERT INTO achievements (id, organization_id, name, description, category, points, rarity, max_progress, icon, active, trigger_type, trigger_value, auto_unlock)
SELECT 'gem_collector_500', organization_id, 'Maestro de Gemas', 'Acumula 500 gemas', 'Recompensas', 200, 'rare', 500, 'Crown', true, 'gems_earned', 500, true
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM achievements WHERE id = 'gem_collector_500'
)
LIMIT 1;

SELECT '✅ Columnas y logros automáticos agregados' as status;
