-- ============================================================
-- FIX CRÍTICO: Corregir incompatibilidad de tipos de datos
-- ============================================================
-- PROBLEMA: user_responses.question_id es INT 
--           pero diagnostic_questions.id es VARCHAR(36)
-- SOLUCIÓN: Cambiar user_responses.question_id a VARCHAR(36)
-- ============================================================

-- PASO 1: Hacer backup de la tabla
CREATE TABLE IF NOT EXISTS user_responses_backup AS 
SELECT * FROM user_responses;

-- PASO 2: Ver el contenido actual
SELECT 'CONTENIDO ACTUAL DE user_responses' as info;
SELECT * FROM user_responses;

-- PASO 3: Verificar si hay Foreign Keys que eliminar
SELECT 'VERIFICANDO FOREIGN KEYS' as info;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_responses'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- PASO 4: Modificar el tipo de dato de question_id
ALTER TABLE user_responses 
MODIFY COLUMN question_id VARCHAR(36) NOT NULL;

-- PASO 5: Verificar el cambio
SELECT 'NUEVA ESTRUCTURA DE user_responses' as info;
DESCRIBE user_responses;

-- PASO 6: Intentar agregar Foreign Key
ALTER TABLE user_responses
ADD CONSTRAINT fk_user_responses_question
FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

SELECT '✅ FIX COMPLETADO - user_responses.question_id ahora es VARCHAR(36)' as resultado;
