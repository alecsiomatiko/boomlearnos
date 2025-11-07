-- Tabla para almacenar planes estratégicos
-- Guarda planes para no regenerarlos con IA cada vez

CREATE TABLE IF NOT EXISTS strategic_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NULL,
  plan_data JSON NOT NULL,
  objective_general TEXT NULL,
  duration_months INT DEFAULT 6,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  
  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Agregar comentarios
ALTER TABLE strategic_plans COMMENT = 'Almacena planes estratégicos generados por IA';
