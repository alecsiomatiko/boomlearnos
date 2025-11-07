-- ============================================================
-- REPORTE COMPLETO: SISTEMA DE MEGA DIAGNÓSTICO
-- ============================================================

-- 1. MÓDULOS PRINCIPALES
SELECT 'MÓDULOS PRINCIPALES' as '==================';
SELECT 
    module_code,
    title,
    description,
    order_index,
    estimated_time_minutes,
    is_active
FROM diagnostic_modules 
ORDER BY order_index;

-- 2. SUBMÓDULOS POR MÓDULO
SELECT 'SUBMÓDULOS POR MÓDULO' as '==================';
SELECT 
    dm.module_code,
    dm.title as module_title,
    COUNT(ds.id) as total_submodules
FROM diagnostic_modules dm
LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
GROUP BY dm.id, dm.module_code, dm.title
ORDER BY dm.order_index;

-- 3. LISTADO DE TODOS LOS SUBMÓDULOS
SELECT 'TODOS LOS SUBMÓDULOS' as '==================';
SELECT 
    dm.module_code as module,
    ds.submodule_code,
    ds.title,
    ds.order_index
FROM diagnostic_submodules ds
JOIN diagnostic_modules dm ON ds.module_id = dm.id
ORDER BY dm.order_index, ds.order_index;

-- 4. PREGUNTAS POR SUBMÓDULO
SELECT 'PREGUNTAS POR SUBMÓDULO' as '==================';
SELECT 
    dm.module_code,
    ds.submodule_code,
    COUNT(dq.id) as total_questions
FROM diagnostic_modules dm
JOIN diagnostic_submodules ds ON dm.id = ds.module_id
LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
GROUP BY dm.module_code, ds.submodule_code
ORDER BY dm.order_index, ds.order_index;

-- 5. SAMPLE DE PREGUNTAS
SELECT 'MUESTRA DE PREGUNTAS' as '==================';
SELECT 
    dm.module_code,
    ds.submodule_code,
    dq.question_code,
    LEFT(dq.question_text, 80) as question_preview,
    dq.question_type
FROM diagnostic_questions dq
JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
JOIN diagnostic_modules dm ON ds.module_id = dm.id
ORDER BY dm.order_index, ds.order_index, dq.order_index
LIMIT 20;

-- 6. OPCIONES POR PREGUNTA
SELECT 'OPCIONES DE RESPUESTA' as '==================';
SELECT 
    dq.question_code,
    COUNT(do.id) as total_options
FROM diagnostic_questions dq
LEFT JOIN diagnostic_options do ON dq.id = do.question_id
GROUP BY dq.id, dq.question_code
ORDER BY total_options DESC
LIMIT 20;

-- 7. ESTADÍSTICAS GENERALES
SELECT 'ESTADÍSTICAS GENERALES' as '==================';
SELECT 
    (SELECT COUNT(*) FROM diagnostic_modules) as modules,
    (SELECT COUNT(*) FROM diagnostic_modules WHERE is_active = 1) as active_modules,
    (SELECT COUNT(*) FROM diagnostic_submodules) as submodules,
    (SELECT COUNT(*) FROM diagnostic_questions) as questions,
    (SELECT COUNT(*) FROM diagnostic_options) as options,
    (SELECT COUNT(*) FROM user_responses) as user_responses,
    (SELECT COUNT(DISTINCT user_id) FROM user_responses) as users_with_responses;

-- 8. PROBLEMA: INCOMPATIBILIDAD DE TIPOS
SELECT 'PROBLEMA DETECTADO' as '==================';
SELECT 
    'user_responses.question_id' as tabla_campo,
    'INT' as tipo_actual,
    'diagnostic_questions.id usa VARCHAR(36)' as problema,
    'No se pueden hacer JOINs directos' as impacto;

-- 9. RESPUESTAS POR USUARIO
SELECT 'RESPUESTAS POR USUARIO' as '==================';
SELECT 
    ur.user_id,
    u.name,
    u.email,
    COUNT(*) as total_responses,
    DATE(MIN(ur.created_at)) as first_response,
    DATE(MAX(ur.created_at)) as last_response
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
GROUP BY ur.user_id, u.name, u.email
ORDER BY total_responses DESC
LIMIT 15;

-- 10. USER_DIAGNOSTICS
SELECT 'USER DIAGNOSTICS' as '==================';
SELECT 
    ud.*,
    u.name,
    u.email
FROM user_diagnostics ud
LEFT JOIN users u ON ud.user_id = u.id
LIMIT 10;

-- 11. ONBOARDING_DIAGNOSTICS
SELECT 'ONBOARDING DIAGNOSTICS' as '==================';
SELECT 
    od.*,
    u.name,
    u.email
FROM onboarding_diagnostics od
LEFT JOIN users u ON od.user_id = u.id
LIMIT 10;

-- 12. USER_DIAGNOSTIC_OVERVIEW
SELECT 'USER DIAGNOSTIC OVERVIEW' as '==================';
SELECT * FROM user_diagnostic_overview LIMIT 10;

-- 13. TAMAÑO DE TABLAS
SELECT 'TAMAÑO DE TABLAS' as '==================';
SELECT 
    TABLE_NAME,
    TABLE_ROWS as rows,
    ROUND(DATA_LENGTH / 1024, 2) AS 'Data_KB',
    ROUND(INDEX_LENGTH / 1024, 2) AS 'Index_KB'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND (TABLE_NAME LIKE '%diagnostic%' OR TABLE_NAME LIKE '%response%')
ORDER BY TABLE_ROWS DESC;

SELECT 'FIN DEL REPORTE' as '==================';
