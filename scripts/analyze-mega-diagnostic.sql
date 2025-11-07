-- ============================================================
-- ANÁLISIS COMPLETO DEL SISTEMA DE MEGA DIAGNÓSTICO
-- ============================================================

SELECT '===================================================' as '';
SELECT 'ANÁLISIS DEL SISTEMA DE MEGA DIAGNÓSTICO' as '';
SELECT '===================================================' as '';
SELECT '' as '';

-- 1. ESTRUCTURA DE DIAGNOSTIC_MODULES
SELECT '1. ESTRUCTURA: diagnostic_modules' as '';
DESCRIBE diagnostic_modules;
SELECT '' as '';

SELECT '2. CONTENIDO: diagnostic_modules' as '';
SELECT * FROM diagnostic_modules ORDER BY id;
SELECT '' as '';

-- 3. ESTRUCTURA DE DIAGNOSTIC_SUBMODULES
SELECT '3. ESTRUCTURA: diagnostic_submodules' as '';
DESCRIBE diagnostic_submodules;
SELECT '' as '';

SELECT '4. CONTENIDO: diagnostic_submodules' as '';
SELECT * FROM diagnostic_submodules ORDER BY module_id, id LIMIT 20;
SELECT '' as '';

SELECT '5. CONTEO: submodules por módulo' as '';
SELECT 
    dm.id,
    dm.name as module_name,
    dm.code as module_code,
    COUNT(ds.id) as total_submodules
FROM diagnostic_modules dm
LEFT JOIN diagnostic_submodules ds ON dm.id = ds.module_id
GROUP BY dm.id, dm.name, dm.code
ORDER BY dm.id;
SELECT '' as '';

-- 6. ESTRUCTURA DE DIAGNOSTIC_QUESTIONS
SELECT '6. ESTRUCTURA: diagnostic_questions' as '';
DESCRIBE diagnostic_questions;
SELECT '' as '';

SELECT '7. CONTEO: questions por submodule' as '';
SELECT 
    ds.id as submodule_id,
    ds.title as submodule_title,
    dm.name as module_name,
    COUNT(dq.id) as total_questions
FROM diagnostic_submodules ds
LEFT JOIN diagnostic_modules dm ON ds.module_id = dm.id
LEFT JOIN diagnostic_questions dq ON ds.id = dq.submodule_id
GROUP BY ds.id, ds.title, dm.name
ORDER BY dm.id, ds.id
LIMIT 30;
SELECT '' as '';

-- 8. ESTRUCTURA DE DIAGNOSTIC_OPTIONS
SELECT '8. ESTRUCTURA: diagnostic_options' as '';
DESCRIBE diagnostic_options;
SELECT '' as '';

SELECT '9. SAMPLE: preguntas con sus opciones (primera pregunta de cada submodule)' as '';
SELECT 
    dq.id as question_id,
    dq.question_text,
    ds.title as submodule,
    dm.name as module,
    (SELECT COUNT(*) FROM diagnostic_options WHERE question_id = dq.id) as option_count
FROM diagnostic_questions dq
JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
JOIN diagnostic_modules dm ON ds.module_id = dm.id
GROUP BY ds.id
LIMIT 10;
SELECT '' as '';

-- 10. ESTRUCTURA DE USER_RESPONSES
SELECT '10. ESTRUCTURA: user_responses' as '';
DESCRIBE user_responses;
SELECT '' as '';

SELECT '11. CONTEO: user_responses total' as '';
SELECT COUNT(*) as total_responses FROM user_responses;
SELECT '' as '';

SELECT '12. PROGRESO: respuestas por usuario (top 20)' as '';
SELECT 
    ur.user_id,
    u.username,
    u.full_name,
    COUNT(DISTINCT ur.question_id) as questions_answered,
    COUNT(*) as total_responses,
    MIN(ur.created_at) as first_response,
    MAX(ur.created_at) as last_response
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
GROUP BY ur.user_id, u.username, u.full_name
ORDER BY questions_answered DESC
LIMIT 20;
SELECT '' as '';

-- 13. ESTRUCTURA DE USER_DIAGNOSTICS
SELECT '13. ESTRUCTURA: user_diagnostics' as '';
DESCRIBE user_diagnostics;
SELECT '' as '';

SELECT '14. CONTENIDO: user_diagnostics' as '';
SELECT * FROM user_diagnostics ORDER BY created_at DESC LIMIT 10;
SELECT '' as '';

-- 15. ESTRUCTURA DE ONBOARDING_DIAGNOSTICS
SELECT '15. ESTRUCTURA: onboarding_diagnostics' as '';
DESCRIBE onboarding_diagnostics;
SELECT '' as '';

SELECT '16. CONTENIDO: onboarding_diagnostics' as '';
SELECT * FROM onboarding_diagnostics ORDER BY created_at DESC LIMIT 10;
SELECT '' as '';

-- 17. ESTRUCTURA DE USER_DIAGNOSTIC_OVERVIEW
SELECT '17. ESTRUCTURA: user_diagnostic_overview' as '';
DESCRIBE user_diagnostic_overview;
SELECT '' as '';

SELECT '18. CONTENIDO: user_diagnostic_overview' as '';
SELECT * FROM user_diagnostic_overview ORDER BY last_updated DESC LIMIT 10;
SELECT '' as '';

-- 19. ANÁLISIS DE COMPLETITUD
SELECT '19. ANÁLISIS: módulos completados por usuario' as '';
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT CASE WHEN ur.question_id IS NOT NULL THEN ds.module_id END) as modules_with_responses,
    COUNT(DISTINCT ur.question_id) as questions_answered
FROM users u
LEFT JOIN user_responses ur ON u.id = ur.user_id
LEFT JOIN diagnostic_questions dq ON ur.question_id = dq.id
LEFT JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
GROUP BY u.id, u.username
HAVING questions_answered > 0
ORDER BY questions_answered DESC
LIMIT 20;
SELECT '' as '';

-- 20. VERIFICACIÓN DE INTEGRIDAD
SELECT '20. VERIFICACIÓN: integridad de datos' as '';
SELECT 'Respuestas sin pregunta válida' as check_type, COUNT(*) as count
FROM user_responses ur
LEFT JOIN diagnostic_questions dq ON ur.question_id = dq.id
WHERE dq.id IS NULL

UNION ALL

SELECT 'Respuestas sin usuario válido' as check_type, COUNT(*) as count
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'Preguntas sin submodule válido' as check_type, COUNT(*) as count
FROM diagnostic_questions dq
LEFT JOIN diagnostic_submodules ds ON dq.submodule_id = ds.id
WHERE ds.id IS NULL

UNION ALL

SELECT 'Submodules sin module válido' as check_type, COUNT(*) as count
FROM diagnostic_submodules ds
LEFT JOIN diagnostic_modules dm ON ds.module_id = dm.id
WHERE dm.id IS NULL;

SELECT '' as '';

-- 21. ESTADÍSTICAS GENERALES
SELECT '21. ESTADÍSTICAS GENERALES' as '';
SELECT 
    (SELECT COUNT(*) FROM diagnostic_modules) as total_modules,
    (SELECT COUNT(*) FROM diagnostic_submodules) as total_submodules,
    (SELECT COUNT(*) FROM diagnostic_questions) as total_questions,
    (SELECT COUNT(*) FROM diagnostic_options) as total_options,
    (SELECT COUNT(*) FROM user_responses) as total_user_responses,
    (SELECT COUNT(DISTINCT user_id) FROM user_responses) as users_with_responses,
    (SELECT COUNT(*) FROM user_diagnostics) as total_diagnostics_completed;

SELECT '' as '';
SELECT '===================================================' as '';
SELECT 'FIN DEL ANÁLISIS' as '';
SELECT '===================================================' as '';
