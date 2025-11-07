-- ============================================================
-- FIX COMPLETO: Recrear sistema de respuestas correctamente
-- ============================================================

-- PASO 1: Las respuestas actuales son inválidas (IDs incorrectos)
SELECT 'PASO 1: Limpiando respuestas inválidas' as info;
TRUNCATE TABLE user_responses;

-- PASO 2: Verificar estructura actual
SELECT 'PASO 2: Estructura actual de user_responses' as info;
DESCRIBE user_responses;

-- PASO 3: Agregar columnas faltantes si no existen
SELECT 'PASO 3: Verificando columnas necesarias' as info;

-- Verificar si necesitamos agregar module_code
SELECT COLUMN_NAME 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'user_responses' 
AND COLUMN_NAME = 'module_code';

-- PASO 4: Recrear tabla con estructura correcta
SELECT 'PASO 4: Recreando user_responses con estructura correcta' as info;

DROP TABLE IF EXISTS user_responses;

CREATE TABLE user_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_id VARCHAR(36) NOT NULL,
    module_code VARCHAR(20),
    submodule_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para búsquedas rápidas
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id),
    INDEX idx_module_code (module_code),
    INDEX idx_user_module (user_id, module_code),
    
    -- Foreign Keys
    CONSTRAINT fk_user_responses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_user_responses_question
        FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_user_responses_option
        FOREIGN KEY (selected_option_id) REFERENCES diagnostic_options(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraint para evitar respuestas duplicadas
    UNIQUE KEY unique_user_question (user_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Tabla user_responses recreada correctamente' as resultado;

-- PASO 5: Verificar estructura final
SELECT 'PASO 5: Estructura final' as info;
DESCRIBE user_responses;

-- PASO 6: Verificar Foreign Keys
SELECT 'PASO 6: Foreign Keys instalados' as info;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_responses'
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT '✅ FIX COMPLETO - Sistema de respuestas listo para usar' as resultado;
