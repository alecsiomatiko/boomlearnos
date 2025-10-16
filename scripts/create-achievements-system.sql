-- Script para crear tabla de achievements y datos iniciales
-- Ejecutar este script para inicializar el sistema de logros

-- Crear tabla de achievements si no existe
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  achievement_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  points INT NOT NULL DEFAULT 0,
  rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL DEFAULT 1,
  icon VARCHAR(50) DEFAULT 'Target',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de user_achievements si no existe
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Insertar achievements iniciales
INSERT INTO achievements (achievement_key, name, description, category, points, rarity, requirement_type, requirement_value, icon) VALUES
('first_task', 'Primera Misión', 'Completa tu primera tarea', 'Inicio', 50, 'common', 'tasks_completed', 1, 'Target'),
('task_master_bronze', 'Maestro de Tareas - Bronce', 'Completa 10 tareas', 'Productividad', 100, 'uncommon', 'tasks_completed', 10, 'Medal'),
('task_master_silver', 'Maestro de Tareas - Plata', 'Completa 25 tareas', 'Productividad', 250, 'rare', 'tasks_completed', 25, 'Medal'),
('task_master_gold', 'Maestro de Tareas - Oro', 'Completa 50 tareas', 'Productividad', 500, 'epic', 'tasks_completed', 50, 'Medal'),
('productivity_master', 'Maestro de Productividad', 'Completa 100 tareas en total', 'Productividad', 1000, 'legendary', 'tasks_completed', 100, 'Award'),
('streak_master', 'Racha Perfecta', 'Mantén una racha de 7 días completando tareas', 'Consistencia', 200, 'rare', 'daily_streak', 7, 'Flame'),
('team_player', 'Jugador de Equipo', 'Colabora en 5 proyectos de equipo', 'Colaboración', 150, 'uncommon', 'team_tasks', 5, 'Users'),
('early_bird', 'Madrugador', 'Completa 10 tareas antes de las 9 AM', 'Hábitos', 300, 'rare', 'early_tasks', 10, 'Star'),
('empire_builder', 'Constructor de Imperio', 'Alcanza el nivel Empire Master', 'Progresión', 2000, 'legendary', 'level_reached', 1, 'Crown'),
('gem_collector', 'Coleccionista de Gemas', 'Acumula 1000 gemas', 'Recompensas', 500, 'epic', 'gems_earned', 1000, 'Star')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  category = VALUES(category),
  points = VALUES(points),
  rarity = VALUES(rarity),
  requirement_type = VALUES(requirement_type),
  requirement_value = VALUES(requirement_value),
  icon = VALUES(icon);