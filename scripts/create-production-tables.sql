-- TABLAS PARA PRODUCCIÓN - MÓDULOS PRINCIPALES
-- Ejecutar después de las tablas base existentes

-- ========================================
-- TABLA DE LOGROS/ACHIEVEMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    achievement_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    requirement_type VARCHAR(50) NOT NULL, -- 'tasks_completed', 'streak_days', 'gems_earned', etc.
    requirement_value INT NOT NULL,
    icon VARCHAR(100) DEFAULT 'star',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE LOGROS DE USUARIO
-- ========================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE CONVERSACIONES
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    type ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
    description TEXT,
    created_by VARCHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE PARTICIPANTES EN CONVERSACIONES
-- ========================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE MENSAJES
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'file', 'system') DEFAULT 'text',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_created (conversation_id, created_at),
    INDEX idx_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE RECOMPENSAS DISPONIBLES
-- ========================================
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cost INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    icon VARCHAR(100) DEFAULT 'gift',
    stock_limit INT DEFAULT -1, -- -1 = unlimited
    claimed_count INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE RECOMPENSAS CANJEADAS
-- ========================================
CREATE TABLE IF NOT EXISTS user_rewards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    reward_id VARCHAR(36) NOT NULL,
    gems_spent INT NOT NULL,
    status ENUM('pending', 'approved', 'delivered', 'cancelled') DEFAULT 'pending',
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA DE MÉTRICAS DIARIAS
-- ========================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    metric_date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_created INT DEFAULT 0,
    gems_earned INT DEFAULT 0,
    energy_level DECIMAL(3,1) DEFAULT 0,
    checkin_completed BOOLEAN DEFAULT FALSE,
    productivity_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERTAR LOGROS INICIALES
-- ========================================
INSERT IGNORE INTO achievements (achievement_key, name, description, category, points, rarity, requirement_type, requirement_value, icon) VALUES
('first_task', 'Primera Misión', 'Completa tu primera tarea', 'Inicio', 50, 'common', 'tasks_completed', 1, 'target'),
('task_master_bronze', 'Maestro de Tareas - Bronce', 'Completa 10 tareas', 'Productividad', 100, 'uncommon', 'tasks_completed', 10, 'medal'),
('task_master_silver', 'Maestro de Tareas - Plata', 'Completa 25 tareas', 'Productividad', 250, 'rare', 'tasks_completed', 25, 'medal'),
('task_master_gold', 'Maestro de Tareas - Oro', 'Completa 50 tareas', 'Productividad', 500, 'epic', 'tasks_completed', 50, 'medal'),
('streak_master', 'Racha Perfecta', 'Mantén una racha de 7 días completando tareas', 'Consistencia', 200, 'rare', 'streak_days', 7, 'flame'),
('team_player', 'Jugador de Equipo', 'Colabora en 5 proyectos de equipo', 'Colaboración', 150, 'uncommon', 'team_tasks', 5, 'users'),
('productivity_master', 'Maestro de Productividad', 'Completa 100 tareas en total', 'Productividad', 1000, 'legendary', 'tasks_completed', 100, 'award'),
('gem_collector', 'Coleccionista de Gemas', 'Acumula 1000 gemas', 'Progreso', 300, 'rare', 'gems_earned', 1000, 'gem'),
('early_bird', 'Madrugador', 'Completa check-in antes de las 9 AM por 5 días', 'Disciplina', 150, 'uncommon', 'early_checkins', 5, 'sunrise');

-- ========================================
-- INSERTAR RECOMPENSAS INICIALES
-- ========================================
INSERT IGNORE INTO rewards (title, description, cost, category, rarity, icon) VALUES
('Día Libre Extra', 'Un día libre adicional para disfrutar', 500, 'tiempo', 'common', 'clock'),
('Almuerzo Premium', 'Almuerzo en restaurante de lujo para 2 personas', 300, 'experiencia', 'rare', 'gift'),
('Curso Online Premium', 'Acceso a cualquier curso de desarrollo profesional', 800, 'desarrollo', 'epic', 'target'),
('Gadget Tecnológico', 'Auriculares inalámbricos de alta gama', 1200, 'tecnologia', 'legendary', 'zap'),
('Trabajo Remoto Semanal', 'Una semana completa de trabajo desde casa', 400, 'tiempo', 'rare', 'clock'),
('Certificación Profesional', 'Pago completo de certificación en tu área', 1500, 'desarrollo', 'legendary', 'award');

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_rewards_available ON rewards(is_available, category);

-- ========================================
-- PROCEDIMIENTO PARA ACTUALIZAR LOGROS
-- ========================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS UpdateUserAchievements(IN p_user_id VARCHAR(36))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_achievement_id VARCHAR(36);
    DECLARE v_requirement_type VARCHAR(50);
    DECLARE v_requirement_value INT;
    DECLARE v_current_value INT DEFAULT 0;
    
    DECLARE achievement_cursor CURSOR FOR 
        SELECT id, requirement_type, requirement_value 
        FROM achievements 
        WHERE is_active = TRUE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN achievement_cursor;
    
    achievement_loop: LOOP
        FETCH achievement_cursor INTO v_achievement_id, v_requirement_type, v_requirement_value;
        IF done THEN
            LEAVE achievement_loop;
        END IF;
        
        -- Calcular progreso según el tipo de requirement
        CASE v_requirement_type
            WHEN 'tasks_completed' THEN
                SELECT COUNT(*) INTO v_current_value 
                FROM tasks 
                WHERE user_id = p_user_id AND status = 'completed';
            
            WHEN 'gems_earned' THEN
                SELECT COALESCE(total_gems, 0) INTO v_current_value 
                FROM users 
                WHERE id = p_user_id;
            
            WHEN 'streak_days' THEN
                SELECT COALESCE(current_streak, 0) INTO v_current_value 
                FROM users 
                WHERE id = p_user_id;
                
            ELSE
                SET v_current_value = 0;
        END CASE;
        
        -- Insertar o actualizar progreso del logro
        INSERT INTO user_achievements (user_id, achievement_id, progress, completed, unlocked_at)
        VALUES (p_user_id, v_achievement_id, v_current_value, 
                v_current_value >= v_requirement_value,
                CASE WHEN v_current_value >= v_requirement_value THEN NOW() ELSE NULL END)
        ON DUPLICATE KEY UPDATE 
            progress = v_current_value,
            completed = v_current_value >= v_requirement_value,
            unlocked_at = CASE 
                WHEN v_current_value >= v_requirement_value AND unlocked_at IS NULL 
                THEN NOW() 
                ELSE unlocked_at 
            END;
            
    END LOOP;
    
    CLOSE achievement_cursor;
END //
DELIMITER ;