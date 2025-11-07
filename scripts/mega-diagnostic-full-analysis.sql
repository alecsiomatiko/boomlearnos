-- ============================================================
-- ANÁLISIS COMPLETO DEL SISTEMA DE MEGA DIAGNÓSTICO
-- ============================================================

SELECT '===================================================' as info;
SELECT 'ANÁLISIS DEL SISTEMA DE MEGA DIAGNÓSTICO' as info;
SELECT '===================================================' as info;

-- 1. MÓDULOS PRINCIPALES
SELECT '1. MÓDULOS PRINCIPALES (diagnostic_modules)' as info;
SELECT * FROM diagnostic_modules ORDER BY order_index;

-- 2. CONTEO DE SUBMÓDULOS POR MÓDULO
SELECT '2. SUBMÓDULOS POR MÓDULO' as info;
SELECT 
    dm.module_code,
    dm.title,
    COUNT(ds.id) as total_submodules,
    dm.estimated_time_minutes,
    dm.is_active
FROM diagnostic_modules dm
LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
GROUP BY dm.id, dm.module_code, dm.title, dm.estimated_time_minutes, dm.is_active
ORDER BY dm.order_index;

-- 3. SAMPLE DE SUBMÓDULOS
SELECT '3. PRIMEROS 20 SUBMÓDULOS' as info;
SELECT 
    ds.submodule_code,
    ds.title,
    dm.module_code as parent_module,
    ds.order_index
FROM diagnostic_submodules ds
JOIN diagnostic_modules dm ON ds.module_id = dm.id
ORDER BY dm.order_index, ds.order_index
LIMIT 20;

-- 4. CONTEO DE PREGUNTAS POR SUBMÓDULO
SELECT '4. PREGUNTAS POR SUBMÓDULO (primeros 30)' as info;
SELECT 
    ds.submodule_code,
    ds.title as submodule_title,
    dm.module_code,
    COUNT(dq.id) as total_questions
FROM diagnostic_submodules ds
JOIN diagnostic_modules dm ON ds.module_id = dm.id
LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
GROUP BY ds.id, ds.submodule_code, ds.title, dm.module_code
ORDER BY dm.order_index, ds.order_index
LIMIT 30;

-- 5. SAMPLE DE PREGUNTAS
SELECT '5. PRIMERAS 10 PREGUNTAS' as info;
SELECT 
    dq.question_code,
    SUBSTRING(dq.question_text, 1, 100) as question_preview,
    dq.question_type,
    ds.submodule_code,
    dm.module_code,
    (SELECT COUNT(*) FROM diagnostic_options WHERE question_id = dq.id) as option_count
FROM diagnostic_questions dq
JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
JOIN diagnostic_modules dm ON ds.module_id = dm.id
ORDER BY dm.order_index, ds.order_index, dq.order_index
LIMIT 10;

-- 6. ESTADÍSTICAS GENERALES
SELECT '6. ESTADÍSTICAS GENERALES' as info;
SELECT 
    (SELECT COUNT(*) FROM diagnostic_modules) as total_modules,
    (SELECT COUNT(*) FROM diagnostic_modules WHERE is_active = 1) as active_modules,
    (SELECT COUNT(*) FROM diagnostic_submodules) as total_submodules,
    (SELECT COUNT(*) FROM diagnostic_questions) as total_questions,
    (SELECT COUNT(*) FROM diagnostic_options) as total_options;

-- 7. RESPUESTAS DE USUARIOS - PROBLEMA DETECTADO
SELECT '7. ANÁLISIS DE user_responses' as info;
SELECT 
    COUNT(*) as total_responses,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT question_id) as unique_questions_answered,
    MIN(created_at) as first_response,
    MAX(created_at) as last_response
FROM user_responses;

-- 8. TOP USUARIOS CON RESPUESTAS
SELECT '8. TOP 15 USUARIOS CON MÁS RESPUESTAS' as info;
SELECT 
    ur.user_id,
    u.username,
    u.full_name,
    COUNT(*) as total_responses,
    MIN(ur.created_at) as first_response,
    MAX(ur.created_at) as last_response
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
GROUP BY ur.user_id, u.username, u.full_name
ORDER BY total_responses DESC
LIMIT 15;

-- 9. VERIFICAR COMPATIBILIDAD DE IDS (IMPORTANTE)
SELECT '9. VERIFICACIÓN DE TIPOS DE ID - PROBLEMA POTENCIAL' as info;
SELECT 
    'user_responses.question_id es INT' as problema,
    'diagnostic_questions.id es VARCHAR(36)' as incompatibilidad,
    'Esto puede causar problemas en JOINs' as impacto;

-- 10. INTENTAR CRUZAR DATOS (puede fallar)
SELECT '10. INTENTANDO CRUZAR user_responses con diagnostic_questions' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.question_id as response_question_id,
    ur.selected_option_id,
    'Sin match directo por incompatibilidad de tipos' as nota
FROM user_responses ur
LIMIT 10;

-- 11. USER_DIAGNOSTICS
SELECT '11. USER_DIAGNOSTICS' as info;
SELECT * FROM user_diagnostics LIMIT 10;

-- 12. ONBOARDING_DIAGNOSTICS  
SELECT '12. ONBOARDING_DIAGNOSTICS' as info;
SELECT * FROM onboarding_diagnostics LIMIT 10;

-- 13. USER_DIAGNOSTIC_OVERVIEW
SELECT '13. USER_DIAGNOSTIC_OVERVIEW' as info;
SELECT * FROM user_diagnostic_overview LIMIT 10;

-- 14. TAMAÑO DE TABLAS
SELECT '14. TAMAÑO DE TABLAS' as info;
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Size_MB',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS 'Index_MB'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND (TABLE_NAME LIKE '%diagnostic%' OR TABLE_NAME LIKE '%response%')
ORDER BY TABLE_NAME;

SELECT '===================================================' as info;
SELECT 'FIN DEL ANÁLISIS' as info;
SELECT '===================================================' as info;
