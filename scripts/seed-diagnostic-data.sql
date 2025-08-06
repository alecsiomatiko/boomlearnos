-- Insertar módulos de diagnóstico
INSERT INTO diagnostic_modules (id, module_code, title, description, icon, order_index) VALUES
('mod0-uuid', 'MOD0', 'PROPÓSITO DE VIDA Y BHAG', 'Identifica lo que realmente te motiva en tu vida personal, define tu BHAG (Big Hairy Audacious Goal) y alinea tu negocio con ese objetivo.', 'Compass', 0),
('mod1-uuid', 'ETAPA1', 'MAPEO TOTAL DEL NEGOCIO', 'Este es el primer paso para conocerte y sentar las bases de tu plan de crecimiento. ¡Contesta con sinceridad!', 'Building', 1),
('mod2-uuid', 'MOD1', 'ORGANIZACIÓN Y ROLES', 'Evaluación de la estructura organizacional y definición de roles', 'Users', 2),
('mod3-uuid', 'MOD2', 'PROCESOS Y SISTEMAS', 'Análisis de procesos operativos y sistemas de gestión', 'Settings', 3),
('mod4-uuid', 'MOD3', 'EQUIPO Y CULTURA', 'Evaluación del equipo de trabajo y cultura organizacional', 'Heart', 4);

-- Insertar submódulos para MÓDULO 0
INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index) VALUES
('sub0-1-uuid', 'mod0-uuid', 'SUB0_1', 'Propósito de vida y motivación profunda', 1),
('sub0-2-uuid', 'mod0-uuid', 'SUB0_2', 'Definición de tu BHAG', 2),
('sub0-3-uuid', 'mod0-uuid', 'SUB0_3', 'Estructura de vida alineada al propósito', 3);

-- Insertar submódulos para ETAPA 1
INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index) VALUES
('sub1-1-uuid', 'mod1-uuid', 'SUB1_1', 'Información básica del negocio', 1),
('sub1-2-uuid', 'mod1-uuid', 'SUB1_2', 'Situación financiera y herramientas', 2);

-- Insertar submódulos para MÓDULO 1
INSERT INTO diagnostic_submodules (id, module_id, submodule_code, title, order_index) VALUES
('sub2-1-uuid', 'mod2-uuid', 'SUB2_1', 'Estructura actual', 1),
('sub2-2-uuid', 'mod2-uuid', 'SUB2_2', 'Delegación y liderazgo', 2);

-- Insertar preguntas para MÓDULO 0 - Submódulo 1
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index, feedback_text) VALUES
('q-m0s1q1', 'sub0-1-uuid', 'M0S1Q1', '¿Qué te mueve realmente en la vida? (elige máximo 3)', 'multiple', 1, 1, NULL),
('q-m0s1q2', 'sub0-1-uuid', 'M0S1Q2', '¿Qué pasaría si tuvieras éxito total en tu negocio?', 'single', 1, 2, NULL),
('q-m0s1q3', 'sub0-1-uuid', 'M0S1Q3', '¿Cuál de estas frases resuena más contigo?', 'single', 1, 3, NULL);

-- Insertar opciones para M0S1Q1
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s1q1-1', 'q-m0s1q1', 'O1', 'Aprender cosas nuevas constantemente', 1, '🧠', 1),
('opt-m0s1q1-2', 'q-m0s1q1', 'O2', 'Generar riqueza y seguridad financiera', 1, '💰', 2),
('opt-m0s1q1-3', 'q-m0s1q1', 'O3', 'Viajar por el mundo y conocer culturas', 1, '✈️', 3),
('opt-m0s1q1-4', 'q-m0s1q1', 'O4', 'Pasar tiempo con mi familia', 1, '👨‍👩‍👧‍👦', 4),
('opt-m0s1q1-5', 'q-m0s1q1', 'O5', 'Sentirme libre y en paz', 1, '🧘‍♂️', 5),
('opt-m0s1q1-6', 'q-m0s1q1', 'O6', 'Lograr algo grande que me dé reconocimiento', 1, '🏆', 6),
('opt-m0s1q1-7', 'q-m0s1q1', 'O7', 'Aportar valor real al mundo', 1, '🌱', 7),
('opt-m0s1q1-8', 'q-m0s1q1', 'O8', 'Tener tiempo para mis pasiones o hobbies', 1, '🎨', 8);

-- Insertar opciones para M0S1Q2
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-m0s1q2-1', 'q-m0s1q2', 'O1', 'Podría retirarme joven y disfrutar la vida', 1, NULL, 1),
('opt-m0s1q2-2', 'q-m0s1q2', 'O2', 'Viajaría por el mundo sin preocuparme por dinero', 1, NULL, 2),
('opt-m0s1q2-3', 'q-m0s1q2', 'O3', 'Escalaría mi empresa para hacer historia', 1, NULL, 3),
('opt-m0s1q2-4', 'q-m0s1q2', 'O4', 'Tendría tiempo para mí y mi familia', 1, NULL, 4),
('opt-m0s1q2-5', 'q-m0s1q2', 'O5', 'No sé, solo quiero dejar de preocuparme por el dinero', 1, NULL, 5);

-- Insertar preguntas para ETAPA 1
INSERT INTO diagnostic_questions (id, submodule_id, question_code, question_text, question_type, weight, order_index, feedback_text) VALUES
('q-e1q1', 'sub1-1-uuid', 'Q1_ANTIGUEDAD', '¿Cuánto tiempo lleva tu negocio operando?', 'single', 3, 1, '¡Buen dato! Saber la antigüedad nos indica si estás iniciando o si ya buscas optimización.'),
('q-e1q2', 'sub1-1-uuid', 'Q2_EQUIPO', '¿Cuántas personas trabajan actualmente en tu negocio (incluyéndote a ti)?', 'single', 3, 2, 'Perfecto, saber si eres solitario o tienes un equipo amplio cambia las estrategias de organización.'),
('q-e1q3', 'sub1-1-uuid', 'Q3_GIRO', '¿Cuál es el giro principal de tu negocio?', 'single', 4, 3, '¡Excelente! Conocer tu giro y modelo de venta nos ayuda a enfocar las soluciones.');

-- Insertar opciones para Q1_ANTIGUEDAD
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-e1q1-1', 'q-e1q1', 'Q1A', 'Menos de 6 meses', 2, '🍼', 1),
('opt-e1q1-2', 'q-e1q1', 'Q1B', 'Entre 6 meses y 1 año', 3, '🚶', 2),
('opt-e1q1-3', 'q-e1q1', 'Q1C', 'Entre 1 y 3 años', 4, '🏃', 3),
('opt-e1q1-4', 'q-e1q1', 'Q1D', 'Más de 3 años', 5, '🏆', 4);

-- Insertar opciones para Q2_EQUIPO
INSERT INTO diagnostic_options (id, question_id, option_code, option_text, weight, emoji, order_index) VALUES
('opt-e1q2-1', 'q-e1q2', 'Q2A', 'Solo yo', 2, '👤', 1),
('opt-e1q2-2', 'q-e1q2', 'Q2B', 'De 2 a 5 personas', 3, '👥', 2),
('opt-e1q2-3', 'q-e1q2', 'Q2C', 'De 6 a 10 personas', 4, '👨‍👩‍👧‍👦', 3),
('opt-e1q2-4', 'q-e1q2', 'Q2D', 'Más de 10 personas', 5, '🏢', 4);