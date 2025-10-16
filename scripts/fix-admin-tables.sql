-- Fix admin tables creation
-- Drop and recreate achievements table with correct structure

DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- Create achievements table with correct structure
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    max_progress INT NOT NULL DEFAULT 1,
    icon VARCHAR(100) DEFAULT 'Target',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create user_achievements table
CREATE TABLE user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    progress INT DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Insert achievements with correct structure
INSERT INTO achievements (id, name, description, category, points, rarity, max_progress, icon) VALUES
('first_task', 'Primera Misión', 'Completa tu primera tarea', 'Inicio', 50, 'common', 1, 'Target'),
('task_master_bronze', 'Maestro de Tareas - Bronce', 'Completa 10 tareas', 'Productividad', 100, 'uncommon', 10, 'Medal'),
('task_master_silver', 'Maestro de Tareas - Plata', 'Completa 25 tareas', 'Productividad', 250, 'rare', 25, 'Medal'),
('task_master_gold', 'Maestro de Tareas - Oro', 'Completa 50 tareas', 'Productividad', 500, 'epic', 50, 'Medal'),
('streak_master', 'Racha Perfecta', 'Mantén una racha de 7 días completando tareas', 'Consistencia', 200, 'rare', 7, 'Flame'),
('team_player', 'Jugador de Equipo', 'Colabora en 5 proyectos de equipo', 'Colaboración', 150, 'uncommon', 5, 'Users'),
('productivity_master', 'Maestro de Productividad', 'Completa 100 tareas en total', 'Productividad', 1000, 'legendary', 100, 'Award'),
('early_bird', 'Madrugador', 'Completa 10 tareas antes de las 9 AM', 'Hábitos', 300, 'rare', 10, 'Star'),
('empire_builder', 'Constructor de Imperio', 'Alcanza el nivel Empire Master', 'Progresión', 2000, 'legendary', 1, 'Crown');

-- Update user role to admin for admin user
UPDATE users SET role = 'admin' WHERE email = 'admin@boomlearnos.com';