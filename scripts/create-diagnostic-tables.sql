-- Crear extensión UUID si no existe (solo para PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de módulos de diagnóstico
CREATE TABLE diagnostic_modules (
    id VARCHAR(36) PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    order_index INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_module_code (module_code)
);

-- Tabla de submódulos
CREATE TABLE diagnostic_submodules (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36),
    submodule_code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id),
    UNIQUE KEY uk_submodule_code (submodule_code)
);

-- Tabla de preguntas
CREATE TABLE diagnostic_questions (
    id VARCHAR(36) PRIMARY KEY,
    submodule_id VARCHAR(36),
    question_code VARCHAR(20) NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('single', 'multiple') NOT NULL,
    weight INT DEFAULT 1,
    order_index INT NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    feedback_text TEXT,
    parent_question_id VARCHAR(36),
    FOREIGN KEY (submodule_id) REFERENCES diagnostic_submodules(id),
    FOREIGN KEY (parent_question_id) REFERENCES diagnostic_questions(id),
    UNIQUE KEY uk_question_code (question_code)
);

-- Tabla de opciones de respuesta
CREATE TABLE diagnostic_options (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36),
    option_code VARCHAR(20) NOT NULL,
    option_text TEXT NOT NULL,
    weight INT NOT NULL,
    emoji VARCHAR(10),
    order_index INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id)
);

-- Tabla de diagnósticos de usuario
CREATE TABLE user_diagnostics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    module_id VARCHAR(36),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    total_score INT,
    status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id)
);

-- Tabla de respuestas de usuario
CREATE TABLE user_diagnostic_answers (
    id VARCHAR(36) PRIMARY KEY,
    user_diagnostic_id VARCHAR(36),
    question_id VARCHAR(36),
    selected_options JSON,
    score INT,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_diagnostic_id) REFERENCES user_diagnostics(id),
    FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id)
);

-- Tabla de resultados de diagnóstico
CREATE TABLE diagnostic_results (
    id VARCHAR(36) PRIMARY KEY,
    user_diagnostic_id VARCHAR(36),
    module_id VARCHAR(36),
    score_breakdown JSON,
    total_score INT,
    level_achieved VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_diagnostic_id) REFERENCES user_diagnostics(id),
    FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id)
);

-- Índices para optimización
CREATE INDEX idx_user_diagnostics_user ON user_diagnostics(user_id);
CREATE INDEX idx_user_diagnostics_module ON user_diagnostics(module_id);
CREATE INDEX idx_diagnostic_questions_submodule ON diagnostic_questions(submodule_id);
CREATE INDEX idx_diagnostic_options_question ON diagnostic_options(question_id);
CREATE INDEX idx_user_answers_diagnostic ON user_diagnostic_answers(user_diagnostic_id);