-- ============================================================
-- FIX: Recrear user_diagnostic_overview VIEW
-- ============================================================

-- PASO 1: Eliminar VIEW corrupto
DROP VIEW IF EXISTS user_diagnostic_overview;

-- PASO 2: Crear nuevo VIEW con estructura correcta
CREATE VIEW user_diagnostic_overview AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    
    -- Onboarding diagnostic
    CASE WHEN od.id IS NOT NULL THEN 1 ELSE 0 END as onboarding_completed,
    od.created_at as onboarding_completed_at,
    
    -- Mega diagnostic progress
    COUNT(DISTINCT ur.question_id) as total_questions_answered,
    COUNT(DISTINCT ur.module_code) as modules_started,
    
    -- Timestamps
    MIN(ur.created_at) as first_response_date,
    MAX(ur.created_at) as last_response_date,
    NOW() as last_updated
    
FROM users u
LEFT JOIN onboarding_diagnostics od ON u.id = od.user_id
LEFT JOIN user_responses ur ON u.id = ur.user_id
GROUP BY u.id, u.name, u.email, od.id, od.created_at;

SELECT '✅ VIEW user_diagnostic_overview recreado correctamente' as resultado;

-- PASO 3: Probar el VIEW
SELECT 'Probando VIEW:' as info;
SELECT * FROM user_diagnostic_overview LIMIT 5;
