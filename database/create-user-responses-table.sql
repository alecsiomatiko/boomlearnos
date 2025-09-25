-- Script para crear tabla de respuestas de usuarios
-- Este script debe ejecutarse en tu base de datos MySQL

CREATE TABLE IF NOT EXISTS user_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para mejorar rendimiento
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id),
  INDEX idx_user_question (user_id, question_id),
  
  -- Clave foránea con las preguntas del diagnóstico
  FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_option_id) REFERENCES diagnostic_options(id) ON DELETE CASCADE,
  
  -- Restricción única para evitar respuestas duplicadas por usuario/pregunta
  UNIQUE KEY unique_user_question (user_id, question_id)
);

-- Tabla opcional para almacenar análisis generados por IA
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  analysis_type ENUM('comprehensive', 'module', 'insights') DEFAULT 'comprehensive',
  analysis_data JSON NOT NULL,
  ai_insights JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_analysis_type (analysis_type),
  INDEX idx_expires_at (expires_at),
  
  -- Índice único para evitar duplicados
  UNIQUE KEY unique_user_analysis (user_id, analysis_type)
);

-- Tabla para almacenar conversaciones de chat con IA
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  message_role ENUM('user', 'ai') NOT NULL,
  message_content TEXT NOT NULL,
  related_modules JSON,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
);

-- Insertar datos de ejemplo si la tabla está vacía (opcional)
-- Esto es solo para testing - reemplaza 'user123' con un ID real
INSERT IGNORE INTO user_responses (user_id, question_id, selected_option_id) VALUES
('user123', 1, 1),
('user123', 2, 2),
('user123', 3, 3);

-- Verificar que las tablas se crearon correctamente
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME IN ('user_responses', 'ai_analysis_cache', 'ai_chat_conversations');

-- Verificar estructura de user_responses
DESCRIBE user_responses;
