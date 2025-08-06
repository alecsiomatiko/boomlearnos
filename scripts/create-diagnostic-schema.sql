-- =====================================================
-- DIAGNOSTIC SYSTEM DATABASE SCHEMA
-- Separación clara entre datos maestros y progreso de usuario
-- =====================================================

-- Limpiar tablas existentes en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS user_diagnostic_answers;
DROP TABLE IF EXISTS user_diagnostic_sessions;
DROP TABLE IF EXISTS user_module_progress;
DROP TABLE IF EXISTS diagnostic_results;
DROP TABLE IF EXISTS diagnostic_options;
DROP TABLE IF EXISTS diagnostic_questions;
DROP TABLE IF EXISTS diagnostic_submodules;
DROP TABLE IF EXISTS diagnostic_modules;

-- =====================================================
-- DATOS MAESTROS (SEED DATA) - NO CAMBIAN POR USUARIO
-- =====================================================

-- Tabla principal de módulos de diagnóstico
CREATE TABLE diagnostic_modules (
    id VARCHAR(36) PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INT NOT NULL,
    estimated_time_minutes INT DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_module_code (module_code),
    INDEX idx_order_index (order_index),
    INDEX idx_active (is_active)
);

-- Submódulos dentro de cada módulo
CREATE TABLE diagnostic_submodules (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) NOT NULL,
    submodule_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_submodule_code (submodule_code),
    INDEX idx_order_index (order_index)
);

-- Preguntas del diagnóstico
CREATE TABLE diagnostic_questions (
    id VARCHAR(36) PRIMARY KEY,
    submodule_id VARCHAR(36) NOT NULL,
    question_code VARCHAR(50) NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_type ENUM('single', 'multiple') NOT NULL,
    weight INT DEFAULT 1,
    order_index INT NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    feedback_text TEXT,
    parent_question_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submodule_id) REFERENCES diagnostic_submodules(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_question_id) REFERENCES diagnostic_questions(id) ON DELETE SET NULL,
    INDEX idx_submodule_id (submodule_id),
    INDEX idx_question_code (question_code),
    INDEX idx_order_index (order_index),
    INDEX idx_parent_question (parent_question_id)
);

-- Opciones de respuesta para cada pregunta
CREATE TABLE diagnostic_options (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    option_code VARCHAR(20) NOT NULL,
    option_text TEXT NOT NULL,
    weight INT NOT NULL,
    emoji VARCHAR(10),
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id),
    INDEX idx_option_code (option_code),
    INDEX idx_order_index (order_index),
    UNIQUE KEY uk_question_option (question_id, option_code)
);

-- =====================================================
-- PROGRESO Y DATOS DEL USUARIO
-- =====================================================

-- Progreso general del usuario por módulo
CREATE TABLE user_module_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'abandoned') DEFAULT 'not_started',
    total_questions INT DEFAULT 0,
    answered_questions INT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_score INT DEFAULT 0,
    max_possible_score INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_module (user_id, module_id),
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_status (status),
    INDEX idx_completion (completion_percentage),
    INDEX idx_last_activity (last_activity_at)
);

-- Sesiones de diagnóstico (para manejar múltiples intentos)
CREATE TABLE user_diagnostic_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    session_number INT DEFAULT 1,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    current_question_index INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    session_data JSON, -- Para guardar estado temporal
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id) ON DELETE CASCADE,
    INDEX idx_user_module (user_id, module_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
);

-- Respuestas específicas del usuario
CREATE TABLE user_diagnostic_answers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_options JSON NOT NULL, -- Array de option_codes seleccionados
    calculated_score INT NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES user_diagnostic_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_question (session_id, question_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_question_id (question_id),
    INDEX idx_answered_at (answered_at)
);

-- Resultados finales y análisis
CREATE TABLE diagnostic_results (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    total_score INT NOT NULL,
    max_possible_score INT NOT NULL,
    percentage_score DECIMAL(5,2) NOT NULL,
    level_achieved VARCHAR(50),
    score_breakdown JSON, -- Desglose por categorías/submódulos
    recommendations JSON, -- Recomendaciones personalizadas
    strengths JSON, -- Fortalezas identificadas
    improvement_areas JSON, -- Áreas de mejora
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES user_diagnostic_sessions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_session_id (session_id),
    INDEX idx_percentage_score (percentage_score),
    INDEX idx_generated_at (generated_at)
);

-- =====================================================
-- VISTAS ÚTILES PARA EL FRONTEND
-- =====================================================

-- Vista para obtener progreso completo del usuario
CREATE VIEW user_diagnostic_overview AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    dm.id as module_id,
    dm.module_code,
    dm.title as module_title,
    dm.description as module_description,
    dm.icon,
    dm.order_index,
    dm.estimated_time_minutes,
    COALESCE(ump.status, 'not_started') as status,
    COALESCE(ump.total_questions, 0) as total_questions,
    COALESCE(ump.answered_questions, 0) as answered_questions,
    COALESCE(ump.completion_percentage, 0.00) as completion_percentage,
    COALESCE(ump.total_score, 0) as total_score,
    COALESCE(ump.max_possible_score, 0) as max_possible_score,
    ump.started_at,
    ump.completed_at,
    ump.last_activity_at
FROM users u
CROSS JOIN diagnostic_modules dm
LEFT JOIN user_module_progress ump ON u.id = ump.user_id AND dm.id = ump.module_id
WHERE dm.is_active = true
ORDER BY u.id, dm.order_index;

-- Vista para estadísticas de módulos
CREATE VIEW module_statistics AS
SELECT 
    dm.id as module_id,
    dm.module_code,
    dm.title,
    COUNT(DISTINCT dq.id) as total_questions,
    COUNT(DISTINCT ump.user_id) as users_started,
    COUNT(DISTINCT CASE WHEN ump.status = 'completed' THEN ump.user_id END) as users_completed,
    ROUND(AVG(CASE WHEN ump.status = 'completed' THEN ump.completion_percentage END), 2) as avg_completion_rate,
    ROUND(AVG(CASE WHEN ump.status = 'completed' THEN ump.total_score END), 2) as avg_score
FROM diagnostic_modules dm
LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
LEFT JOIN user_module_progress ump ON dm.id = ump.module_id
WHERE dm.is_active = true
GROUP BY dm.id, dm.module_code, dm.title
ORDER BY dm.order_index;

-- =====================================================
-- TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- Trigger para actualizar progreso cuando se responde una pregunta
DELIMITER //
CREATE TRIGGER update_user_progress_after_answer
AFTER INSERT ON user_diagnostic_answers
FOR EACH ROW
BEGIN
    DECLARE module_id_var VARCHAR(36);
    DECLARE total_questions_var INT;
    DECLARE answered_questions_var INT;
    DECLARE total_score_var INT;
    DECLARE max_score_var INT;
    
    -- Obtener module_id de la sesión
    SELECT uds.module_id INTO module_id_var
    FROM user_diagnostic_sessions uds 
    WHERE uds.id = NEW.session_id;
    
    -- Calcular estadísticas actuales
    SELECT 
        COUNT(DISTINCT dq.id),
        COUNT(DISTINCT uda.question_id),
        COALESCE(SUM(uda.calculated_score), 0),
        SUM(dq.weight * (
            SELECT MAX(do.weight) 
            FROM diagnostic_options do 
            WHERE do.question_id = dq.id
        ))
    INTO total_questions_var, answered_questions_var, total_score_var, max_score_var
    FROM diagnostic_questions dq
    JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
    LEFT JOIN user_diagnostic_answers uda ON dq.id = uda.question_id 
        AND uda.user_id = NEW.user_id
        AND uda.session_id = NEW.session_id
    WHERE ds.module_id = module_id_var;
    
    -- Actualizar o insertar progreso
    INSERT INTO user_module_progress (
        id, user_id, module_id, status, total_questions, answered_questions,
        completion_percentage, total_score, max_possible_score, started_at
    ) VALUES (
        UUID(), NEW.user_id, module_id_var, 
        CASE WHEN answered_questions_var >= total_questions_var THEN 'completed' ELSE 'in_progress' END,
        total_questions_var, answered_questions_var,
        ROUND((answered_questions_var / total_questions_var) * 100, 2),
        total_score_var, max_score_var, NOW()
    ) ON DUPLICATE KEY UPDATE
        status = CASE WHEN answered_questions_var >= total_questions_var THEN 'completed' ELSE 'in_progress' END,
        answered_questions = answered_questions_var,
        completion_percentage = ROUND((answered_questions_var / total_questions_var) * 100, 2),
        total_score = total_score_var,
        max_possible_score = max_score_var,
        completed_at = CASE WHEN answered_questions_var >= total_questions_var THEN NOW() ELSE completed_at END;
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- Índices compuestos para queries frecuentes
CREATE INDEX idx_user_module_status ON user_module_progress(user_id, module_id, status);
CREATE INDEX idx_session_user_module ON user_diagnostic_sessions(user_id, module_id, status);
CREATE INDEX idx_answers_user_session ON user_diagnostic_answers(user_id, session_id);

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

ALTER TABLE diagnostic_modules COMMENT = 'Módulos maestros de diagnóstico - datos inmutables';
ALTER TABLE diagnostic_submodules COMMENT = 'Submódulos dentro de cada módulo de diagnóstico';
ALTER TABLE diagnostic_questions COMMENT = 'Preguntas maestras del sistema de diagnóstico';
ALTER TABLE diagnostic_options COMMENT = 'Opciones de respuesta para cada pregunta';
ALTER TABLE user_module_progress COMMENT = 'Progreso individual de cada usuario por módulo';
ALTER TABLE user_diagnostic_sessions COMMENT = 'Sesiones de diagnóstico para manejar múltiples intentos';
ALTER TABLE user_diagnostic_answers COMMENT = 'Respuestas específicas del usuario por sesión';
ALTER TABLE diagnostic_results COMMENT = 'Resultados finales y análisis personalizado';