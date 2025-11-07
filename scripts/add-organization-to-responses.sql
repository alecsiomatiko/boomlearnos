-- =====================================================
-- MIGRACIÓN: Agregar organization_id a user_responses
-- Fecha: 2025-11-03
-- Propósito: Hacer que las respuestas sean por empresa
-- =====================================================

-- Paso 1: Agregar la columna organization_id
ALTER TABLE user_responses 
ADD COLUMN organization_id VARCHAR(36) NULL AFTER user_id;

-- Paso 2: Agregar índice para mejorar rendimiento
ALTER TABLE user_responses 
ADD INDEX idx_organization_id (organization_id);

-- Paso 3: Agregar Foreign Key para integridad referencial
ALTER TABLE user_responses 
ADD CONSTRAINT fk_user_responses_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Paso 4: Actualizar registros existentes con la organización actual del usuario
-- (Esto asume que los usuarios tienen current_organization_id en la tabla users)
UPDATE user_responses ur
INNER JOIN users u ON ur.user_id = u.id
SET ur.organization_id = u.current_organization_id
WHERE ur.organization_id IS NULL AND u.current_organization_id IS NOT NULL;

-- Paso 5: Hacer la columna NOT NULL después de llenar datos
ALTER TABLE user_responses 
MODIFY COLUMN organization_id VARCHAR(36) NOT NULL;

-- Paso 6: Modificar la clave única para incluir organization_id
-- Primero eliminar el índice único actual si existe
-- ALTER TABLE user_responses DROP INDEX unique_user_question IF EXISTS;

-- Crear nueva clave única: un usuario puede responder la misma pregunta en diferentes organizaciones
ALTER TABLE user_responses 
ADD UNIQUE KEY unique_user_org_question (user_id, organization_id, question_id);

-- Verificación
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_responses,
    COUNT(DISTINCT organization_id) as total_organizations,
    COUNT(DISTINCT user_id) as total_users
FROM user_responses;
