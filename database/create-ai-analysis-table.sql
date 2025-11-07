-- Tabla para almacenar análisis de IA
-- Guarda análisis generales y por módulo para no regenerarlos cada vez

CREATE TABLE IF NOT EXISTS ai_analysis (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  analysis_type ENUM('general', 'module') NOT NULL DEFAULT 'general',
  module_id VARCHAR(36) NULL,
  module_code VARCHAR(100) NULL,
  analysis_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_module_id (module_id),
  INDEX idx_user_module (user_id, module_code),
  INDEX idx_analysis_type (analysis_type),
  
  -- Foreign key
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Agregar comentarios
ALTER TABLE ai_analysis COMMENT = 'Almacena análisis de IA para evitar regeneración constante';
