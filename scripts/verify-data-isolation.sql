-- ================================================
-- SCRIPT DE VERIFICACIÓN DE AISLAMIENTO DE DATOS
-- ================================================
-- Este script verifica que cada administrador solo pueda
-- ver sus propios datos y no los de otras organizaciones

-- 1. Verificar que cada usuario tenga su propia organización
SELECT 
    u.id,
    u.email,
    u.role,
    u.organization_id,
    o.name as org_name,
    o.owner_id
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.role = 'admin'
ORDER BY u.created_at DESC;

-- 2. Verificar que las respuestas estén asociadas a organizaciones
SELECT 
    ur.user_id,
    ur.organization_id,
    u.email,
    o.name as org_name,
    COUNT(*) as total_responses
FROM user_responses ur
JOIN users u ON ur.user_id = u.id
LEFT JOIN organizations o ON ur.organization_id = o.id
GROUP BY ur.user_id, ur.organization_id, u.email, o.name
ORDER BY ur.user_id;

-- 3. Verificar que los análisis de IA estén por usuario
SELECT 
    ai.user_id,
    u.email,
    ai.analysis_type,
    ai.module_code,
    ai.created_at
FROM ai_analysis ai
JOIN users u ON ai.user_id = u.id
ORDER BY ai.created_at DESC
LIMIT 20;

-- 4. Verificar que los planes estratégicos estén por usuario y organización
SELECT 
    sp.user_id,
    sp.organization_id,
    u.email,
    o.name as org_name,
    sp.created_at
FROM strategic_plans sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN organizations o ON sp.organization_id = o.id
ORDER BY sp.created_at DESC;

-- 5. Verificar que no haya datos compartidos entre organizaciones
-- (Este query NO debe devolver resultados)
SELECT 
    ur1.user_id as user1,
    ur2.user_id as user2,
    ur1.organization_id as org1,
    ur2.organization_id as org2,
    COUNT(*) as shared_responses
FROM user_responses ur1
JOIN user_responses ur2 
    ON ur1.question_id = ur2.question_id 
    AND ur1.user_id != ur2.user_id
    AND ur1.organization_id != ur2.organization_id
GROUP BY ur1.user_id, ur2.user_id, ur1.organization_id, ur2.organization_id
HAVING shared_responses > 0;

-- 6. Verificar integridad referencial
SELECT 
    'Respuestas sin usuario' as issue,
    COUNT(*) as count
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Respuestas sin organización' as issue,
    COUNT(*) as count
FROM user_responses ur
LEFT JOIN organizations o ON ur.organization_id = o.id
WHERE ur.organization_id IS NOT NULL AND o.id IS NULL

UNION ALL

SELECT 
    'Usuarios sin organización' as issue,
    COUNT(*) as count
FROM users u
WHERE u.role = 'admin' AND u.organization_id IS NULL;
