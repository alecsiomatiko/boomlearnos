-- Revisar todas las tablas relacionadas con mega diagnóstico
-- ============================================================

-- 1. Ver todas las tablas del sistema
SELECT 'TODAS LAS TABLAS EN LA BASE DE DATOS' as info;
SHOW TABLES;

-- 2. Tablas de questionnaires (cuestionarios/módulos)
SELECT '\n=== ESTRUCTURA: questionnaires ===' as info;
DESCRIBE questionnaires;

SELECT '\n=== DATOS: questionnaires (primeros 10) ===' as info;
SELECT * FROM questionnaires LIMIT 10;

SELECT '\n=== CONTEO: questionnaires por tipo ===' as info;
SELECT questionnaire_type, COUNT(*) as total 
FROM questionnaires 
GROUP BY questionnaire_type;

-- 3. Tablas de questions (preguntas)
SELECT '\n=== ESTRUCTURA: questions ===' as info;
DESCRIBE questions;

SELECT '\n=== CONTEO: questions por cuestionario ===' as info;
SELECT q.questionnaire_id, qn.title as questionnaire_name, COUNT(*) as total_questions
FROM questions q
JOIN questionnaires qn ON q.questionnaire_id = qn.id
GROUP BY q.questionnaire_id, qn.title
ORDER BY q.questionnaire_id;

-- 4. Tablas de user_responses (respuestas de usuarios)
SELECT '\n=== ESTRUCTURA: user_responses ===' as info;
DESCRIBE user_responses;

SELECT '\n=== CONTEO: user_responses total ===' as info;
SELECT COUNT(*) as total_responses FROM user_responses;

SELECT '\n=== CONTEO: user_responses por usuario (top 10) ===' as info;
SELECT user_id, COUNT(*) as total_responses, 
       COUNT(DISTINCT questionnaire_id) as questionnaires_answered
FROM user_responses
GROUP BY user_id
ORDER BY total_responses DESC
LIMIT 10;

-- 5. Tablas de user_diagnostics (diagnósticos completados)
SELECT '\n=== ESTRUCTURA: user_diagnostics ===' as info;
DESCRIBE user_diagnostics;

SELECT '\n=== CONTEO: user_diagnostics total ===' as info;
SELECT COUNT(*) as total_diagnostics FROM user_diagnostics;

SELECT '\n=== DATOS: user_diagnostics (primeros 10) ===' as info;
SELECT * FROM user_diagnostics LIMIT 10;

-- 6. Verificar módulos específicos del mega diagnóstico
SELECT '\n=== MÓDULOS MEGA DIAGNÓSTICO ===' as info;
SELECT id, title, questionnaire_type, module_code, description
FROM questionnaires
WHERE questionnaire_type IN ('mega_diagnostic', 'etapa1', 'etapa2', 'modulo0')
ORDER BY questionnaire_type, id;

-- 7. Verificar progreso de usuarios en mega diagnóstico
SELECT '\n=== PROGRESO USUARIOS EN MEGA DIAGNÓSTICO ===' as info;
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT ur.questionnaire_id) as questionnaires_started,
    COUNT(ur.id) as total_answers,
    COUNT(DISTINCT CASE WHEN q.questionnaire_type LIKE '%mega%' THEN ur.questionnaire_id END) as mega_modules_started
FROM users u
LEFT JOIN user_responses ur ON u.id = ur.user_id
LEFT JOIN questionnaires q ON ur.questionnaire_id = q.id
GROUP BY u.id, u.username
HAVING total_answers > 0
ORDER BY total_answers DESC
LIMIT 20;

-- 8. Verificar integridad de datos
SELECT '\n=== VERIFICACIÓN DE INTEGRIDAD ===' as info;
SELECT 
    'Preguntas sin cuestionario' as check_type,
    COUNT(*) as count
FROM questions q
LEFT JOIN questionnaires qn ON q.questionnaire_id = qn.id
WHERE qn.id IS NULL

UNION ALL

SELECT 
    'Respuestas sin pregunta' as check_type,
    COUNT(*) as count
FROM user_responses ur
LEFT JOIN questions q ON ur.question_id = q.id
WHERE q.id IS NULL

UNION ALL

SELECT 
    'Respuestas sin usuario' as check_type,
    COUNT(*) as count
FROM user_responses ur
LEFT JOIN users u ON ur.user_id = u.id
WHERE u.id IS NULL;

-- 9. Ver estructura de tablas relacionadas
SELECT '\n=== TABLAS RELACIONADAS AL MEGA DIAGNÓSTICO ===' as info;
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND (TABLE_NAME LIKE '%question%' 
     OR TABLE_NAME LIKE '%diagnostic%' 
     OR TABLE_NAME LIKE '%response%')
ORDER BY TABLE_NAME;
