-- ============================================================
-- Crear tabla para caché de análisis IA de módulos
-- ============================================================

-- Verificar si la tabla existe
SELECT 'Verificando tabla ai_analysis_cache' as info;

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    module_code VARCHAR(20) NOT NULL,
    analysis_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_user_module (user_id, module_code),
    INDEX idx_created (created_at),
    
    -- Foreign Keys
    CONSTRAINT fk_ai_cache_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraint único para evitar duplicados (se actualiza el más reciente)
    UNIQUE KEY unique_user_module_analysis (user_id, module_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Tabla ai_analysis_cache creada o verificada' as resultado;

-- Verificar estructura
SELECT 'Estructura de ai_analysis_cache:' as info;
DESCRIBE ai_analysis_cache;

-- Verificar Foreign Keys
SELECT 'Foreign Keys instalados:' as info;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ai_analysis_cache'
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT '✅ Setup completo de ai_analysis_cache' as resultado;
