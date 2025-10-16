-- Admin system tables for BoomlearnOS
-- Add admin role to users table and create admin management tables

-- Add admin role column to users table
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER email;

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
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
CREATE TABLE IF NOT EXISTS user_achievements (
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

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cost INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    icon VARCHAR(100) DEFAULT 'Gift',
    available BOOLEAN DEFAULT TRUE,
    stock_limit INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_rewards table (for claimed rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reward_id INT NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'delivered', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Insert sample admin user (password will be hashed in application)
INSERT INTO users (name, email, role, created_at) 
VALUES ('Admin User', 'admin@boomlearnos.com', 'admin', NOW())
ON DUPLICATE KEY UPDATE role = 'admin';

-- Insert some sample achievements structure (empty for admin to populate)
INSERT INTO achievements (id, name, description, category, points, rarity, max_progress, icon) VALUES
('first_task', 'Primera Misión', 'Completa tu primera tarea', 'Inicio', 50, 'common', 1, 'Target'),
('task_master_bronze', 'Maestro de Tareas - Bronce', 'Completa 10 tareas', 'Productividad', 100, 'uncommon', 10, 'Medal'),
('task_master_silver', 'Maestro de Tareas - Plata', 'Completa 25 tareas', 'Productividad', 250, 'rare', 25, 'Medal'),
('task_master_gold', 'Maestro de Tareas - Oro', 'Completa 50 tareas', 'Productividad', 500, 'epic', 50, 'Medal'),
('streak_master', 'Racha Perfecta', 'Mantén una racha de 7 días completando tareas', 'Consistencia', 200, 'rare', 7, 'Flame'),
('team_player', 'Jugador de Equipo', 'Colabora en 5 proyectos de equipo', 'Colaboración', 150, 'uncommon', 5, 'Users'),
('productivity_master', 'Maestro de Productividad', 'Completa 100 tareas en total', 'Productividad', 1000, 'legendary', 100, 'Award'),
('early_bird', 'Madrugador', 'Completa 10 tareas antes de las 9 AM', 'Hábitos', 300, 'rare', 10, 'Star'),
('empire_builder', 'Constructor de Imperio', 'Alcanza el nivel Empire Master', 'Progresión', 2000, 'legendary', 1, 'Crown')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert some sample rewards structure (empty for admin to populate)
INSERT INTO rewards (title, description, cost, category, rarity, icon, stock_limit) VALUES
('Día Libre Extra', 'Un día libre adicional para disfrutar', 500, 'tiempo', 'common', 'Clock', 10),
('Almuerzo Premium', 'Almuerzo en restaurante de lujo para 2 personas', 300, 'experiencia', 'rare', 'Gift', 20),
('Curso Online Premium', 'Acceso a cualquier curso de desarrollo profesional', 800, 'desarrollo', 'epic', 'Target', 5),
('Gadget Tecnológico', 'Auriculares inalámbricos de alta gama', 1200, 'tecnologia', 'legendary', 'Zap', 3),
('Trabajo Remoto Semanal', 'Una semana completa de trabajo desde casa', 400, 'tiempo', 'rare', 'Clock', 8),
('Certificación Profesional', 'Pago completo de certificación en tu área', 1500, 'desarrollo', 'legendary', 'Award', 2);