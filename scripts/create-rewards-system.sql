-- Script para crear sistema de recompensas
-- Ejecutar este script para inicializar el sistema de recompensas

-- Crear tabla de rewards si no existe
CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cost INT NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
  icon VARCHAR(50) DEFAULT 'Gift',
  stock INT NULL, -- NULL significa ilimitado
  max_claims_per_user INT NULL, -- NULL significa sin límite
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de user_rewards si no existe
CREATE TABLE IF NOT EXISTS user_rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reward_id INT NOT NULL,
  quantity_claimed INT DEFAULT 1,
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
  INDEX idx_user_reward (user_id, reward_id)
);

-- Insertar recompensas de ejemplo
INSERT INTO rewards (title, description, cost, category, rarity, icon, stock, max_claims_per_user) VALUES
('Día Libre Extra', 'Un día libre adicional para disfrutar', 500, 'tiempo', 'common', 'Clock', NULL, 2),
('Almuerzo Premium', 'Almuerzo en restaurante de lujo para 2 personas', 300, 'experiencia', 'rare', 'Gift', 50, 3),
('Curso Online Premium', 'Acceso a cualquier curso de desarrollo profesional', 800, 'desarrollo', 'epic', 'Target', NULL, 1),
('Gadget Tecnológico', 'Auriculares inalámbricos de alta gama', 1200, 'tecnologia', 'legendary', 'Zap', 10, 1),
('Trabajo Remoto Semanal', 'Una semana completa de trabajo desde casa', 400, 'tiempo', 'rare', 'Clock', NULL, 2),
('Certificación Profesional', 'Pago completo de certificación en tu área', 1500, 'desarrollo', 'legendary', 'Award', NULL, 1),
('Café Premium', 'Café gourmet por un mes', 150, 'experiencia', 'common', 'Gift', 100, 4),
('Tablet para Trabajo', 'Tablet de última generación para productividad', 2000, 'tecnologia', 'legendary', 'Zap', 5, 1),
('Membresía Gimnasio', 'Membresía de gimnasio por 3 meses', 600, 'experiencia', 'epic', 'Star', 20, 2),
('Kit de Oficina Premium', 'Set completo de accesorios para oficina', 350, 'tecnologia', 'uncommon', 'Gift', 30, 2)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  cost = VALUES(cost),
  category = VALUES(category),
  rarity = VALUES(rarity),
  icon = VALUES(icon);