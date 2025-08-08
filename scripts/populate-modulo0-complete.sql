-- =====================================================
-- MÓDULO 0 COMPLETO: PROPÓSITO DE VIDA Y BHAG
-- =====================================================

-- Insertar MÓDULO 0
INSERT INTO diagnostic_modules (id, module_code, title, description, icon, order_index) VALUES
('mod0-uuid', 'MOD0', 'PROPÓSITO DE VIDA Y BHAG', 'Identifica lo que realmente te motiva en tu vida personal, define tu BHAG (Big Hairy Audacious Goal) y alinea tu negocio con ese objetivo.', 'Compass', 0);

-- Insertar submódulos para MÓDULO 0
INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index) VALUES
('sub0-1-uuid', 'mod0-uuid', 'SUB0_1', 'Propósito de vida y motivación profunda', 1),
('sub0-2-uuid', 'mod0-uuid', 'SUB0_2', 'Definición de tu BHAG', 2),
('sub0-3-uuid', 'mod0-uuid', 'SUB0_3', 'Estructura de vida alineada al propósito', 3);

-- =====================================================
-- SUBMÓDULO 0.1: Propósito de vida y motivación profunda
-- =====================================================

-- Pregunta M0S1Q1
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s1q1', 'sub0-1-uuid', 'M0S1Q1', '¿Qué te mueve realmente en la vida? (elige máximo 3)', 'multiple', 1, 1);

-- Opciones para M0S1Q1
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s1q1-1', 'q-m0s1q1', 'O1', 'Aprender cosas nuevas constantemente', 1, '🧠', 1),
('opt-m0s1q1-2', 'q-m0s1q1', 'O2', 'Generar riqueza y seguridad financiera', 1, '💰', 2),
('opt-m0s1q1-3', 'q-m0s1q1', 'O3', 'Viajar por el mundo y conocer culturas', 1, '✈️', 3),
('opt-m0s1q1-4', 'q-m0s1q1', 'O4', 'Pasar tiempo con mi familia', 1, '👨‍👩‍👧‍👦', 4),
('opt-m0s1q1-5', 'q-m0s1q1', 'O5', 'Sentirme libre y en paz', 1, '🧘‍♂️', 5),
('opt-m0s1q1-6', 'q-m0s1q1', 'O6', 'Lograr algo grande que me dé reconocimiento', 1, '🏆', 6),
('opt-m0s1q1-7', 'q-m0s1q1', 'O7', 'Aportar valor real al mundo', 1, '🌱', 7),
('opt-m0s1q1-8', 'q-m0s1q1', 'O8', 'Tener tiempo para mis pasiones o hobbies', 1, '🎨', 8);

-- Pregunta M0S1Q2
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s1q2', 'sub0-1-uuid', 'M0S1Q2', '¿Qué pasaría si tuvieras éxito total en tu negocio?', 'single', 1, 2);

-- Opciones para M0S1Q2
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s1q2-1', 'q-m0s1q2', 'O1', 'Podría retirarme joven y disfrutar la vida', 1, NULL, 1),
('opt-m0s1q2-2', 'q-m0s1q2', 'O2', 'Viajaría por el mundo sin preocuparme por dinero', 1, NULL, 2),
('opt-m0s1q2-3', 'q-m0s1q2', 'O3', 'Escalaría mi empresa para hacer historia', 1, NULL, 3),
('opt-m0s1q2-4', 'q-m0s1q2', 'O4', 'Tendría tiempo para mí y mi familia', 1, NULL, 4),
('opt-m0s1q2-5', 'q-m0s1q2', 'O5', 'No sé, solo quiero dejar de preocuparme por el dinero', 1, NULL, 5);

-- Pregunta M0S1Q3
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s1q3', 'sub0-1-uuid', 'M0S1Q3', '¿Cuál de estas frases resuena más contigo?', 'single', 1, 3);

-- Opciones para M0S1Q3
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s1q3-1', 'q-m0s1q3', 'O1', '"Quiero ser libre, no rico."', 1, NULL, 1),
('opt-m0s1q3-2', 'q-m0s1q3', 'O2', '"Quiero ser rico para después ser libre."', 1, NULL, 2),
('opt-m0s1q3-3', 'q-m0s1q3', 'O3', '"Quiero dejar una huella imborrable."', 1, NULL, 3),
('opt-m0s1q3-4', 'q-m0s1q3', 'O4', '"Quiero vivir tranquilo y feliz."', 1, NULL, 4);

-- =====================================================
-- SUBMÓDULO 0.2: Definición de tu BHAG
-- =====================================================

-- Pregunta M0S2Q1
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s2q1', 'sub0-2-uuid', 'M0S2Q1', '¿Cuál es tu BHAG (Big Hairy Audacious Goal)?', 'single', 1, 1);

-- Opciones para M0S2Q1
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s2q1-1', 'q-m0s2q1', 'O1', 'Convertirme en millonario y retirarme antes de los 40', 1, NULL, 1),
('opt-m0s2q1-2', 'q-m0s2q1', 'O2', 'Vender mi empresa por más de $10 millones', 1, NULL, 2),
('opt-m0s2q1-3', 'q-m0s2q1', 'O3', 'Crear una empresa que impacte a millones de personas', 1, NULL, 3),
('opt-m0s2q1-4', 'q-m0s2q1', 'O4', 'Tener libertad de tiempo total en 5 años', 1, NULL, 4),
('opt-m0s2q1-5', 'q-m0s2q1', 'O5', 'Otro (especificar)', 1, NULL, 5);

-- Pregunta M0S2Q2
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s2q2', 'sub0-2-uuid', 'M0S2Q2', '¿Cuánto dinero necesitas realmente para cumplir ese sueño?', 'single', 1, 2);

-- Opciones para M0S2Q2
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s2q2-1', 'q-m0s2q2', 'O1', 'Menos de $5M MXN', 1, NULL, 1),
('opt-m0s2q2-2', 'q-m0s2q2', 'O2', 'Entre $5M y $20M MXN', 1, NULL, 2),
('opt-m0s2q2-3', 'q-m0s2q2', 'O3', 'Entre $20M y $100M MXN', 1, NULL, 3),
('opt-m0s2q2-4', 'q-m0s2q2', 'O4', 'Más de $100M MXN', 1, NULL, 4),
('opt-m0s2q2-5', 'q-m0s2q2', 'O5', 'No lo sé', 1, NULL, 5);

-- Pregunta M0S2Q3
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s2q3', 'sub0-2-uuid', 'M0S2Q3', '¿Qué plazo te das para lograrlo?', 'single', 1, 3);

-- Opciones para M0S2Q3
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s2q3-1', 'q-m0s2q3', 'O1', '1 año', 1, NULL, 1),
('opt-m0s2q3-2', 'q-m0s2q3', 'O2', '3 años', 1, NULL, 2),
('opt-m0s2q3-3', 'q-m0s2q3', 'O3', '5 años', 1, NULL, 3),
('opt-m0s2q3-4', 'q-m0s2q3', 'O4', '10 años o más', 1, NULL, 4);

-- =====================================================
-- SUBMÓDULO 0.3: Estructura de vida alineada al propósito
-- =====================================================

-- Pregunta M0S3Q1
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s3q1', 'sub0-3-uuid', 'M0S3Q1', '¿Cuánto tiempo dedicas semanalmente a avanzar en tu BHAG?', 'single', 1, 1);

-- Opciones para M0S3Q1
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s3q1-1', 'q-m0s3q1', 'O1', 'Nada, solo sobrevivo', 1, NULL, 1),
('opt-m0s3q1-2', 'q-m0s3q1', 'O2', 'Menos de 5 horas', 1, NULL, 2),
('opt-m0s3q1-3', 'q-m0s3q1', 'O3', 'Entre 5 y 10 horas', 1, NULL, 3),
('opt-m0s3q1-4', 'q-m0s3q1', 'O4', 'Más de 10 horas de foco real', 1, NULL, 4);

-- Pregunta M0S3Q2
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s3q2', 'sub0-3-uuid', 'M0S3Q2', '¿Qué hábitos tienes para acercarte a tu objetivo? (elige todos los que apliquen)', 'multiple', 1, 2);

-- Opciones para M0S3Q2
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s3q2-1', 'q-m0s3q2', 'O1', 'Leer libros o tomar cursos', 1, NULL, 1),
('opt-m0s3q2-2', 'q-m0s3q2', 'O2', 'Trabajar en mi negocio con foco', 1, NULL, 2),
('opt-m0s3q2-3', 'q-m0s3q2', 'O3', 'Visualizar / meditar / escribir metas', 1, NULL, 3),
('opt-m0s3q2-4', 'q-m0s3q2', 'O4', 'Ahorrar e invertir estratégicamente', 1, NULL, 4),
('opt-m0s3q2-5', 'q-m0s3q2', 'O5', 'Cuidar mi salud física y mental', 1, NULL, 5),
('opt-m0s3q2-6', 'q-m0s3q2', 'O6', 'Ninguno aún', 1, NULL, 6);

-- Pregunta M0S3Q3
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index) VALUES
('q-m0s3q3', 'sub0-3-uuid', 'M0S3Q3', '¿Cuál de estos caminos te gustaría explorar más para acercarte a tu BHAG?', 'single', 1, 3);

-- Opciones para M0S3Q3
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s3q3-1', 'q-m0s3q3', 'O1', 'Escalar mi negocio actual', 1, '📈', 1),
('opt-m0s3q3-2', 'q-m0s3q3', 'O2', 'Emprender algo nuevo', 1, '💡', 2),
('opt-m0s3q3-3', 'q-m0s3q3', 'O3', 'Aprender de mentores o cursos', 1, '📚', 3),
('opt-m0s3q3-4', 'q-m0s3q3', 'O4', 'Aliarme con otras personas', 1, '🤝', 4),
('opt-m0s3q3-5', 'q-m0s3q3', 'O5', 'Mejorar mi bienestar personal primero', 1, '🧘‍♂️', 5),
('opt-m0s3q3-6', 'q-m0s3q3', 'O6', 'Entrar a una escuela de negocios como el IPADE', 1, '🧑‍🏫', 6);

-- =====================================================
-- VERIFICACIÓN: Contar elementos insertados
-- =====================================================
SELECT 'MÓDULO 0 - RESUMEN DE INSERCIÓN:' as info;
SELECT COUNT(*) as total_modulos FROM diagnostic_modules WHERE module_code = 'MOD0';
SELECT COUNT(*) as total_submodulos FROM diagnostic_submodules WHERE module_id = 'mod0-uuid';
SELECT COUNT(*) as total_preguntas FROM diagnostic_questions WHERE submodule_id IN (SELECT id FROM diagnostic_submodules WHERE module_id = 'mod0-uuid');
SELECT COUNT(*) as total_opciones FROM diagnostic_options WHERE question_id IN (SELECT id FROM diagnostic_questions WHERE submodule_id IN (SELECT id FROM diagnostic_submodules WHERE module_id = 'mod0-uuid'));