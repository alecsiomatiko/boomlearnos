-- ============================================================================
-- TABLAS FALTANTES PARA PRODUCCIÓN - BOOMLEARNOS
-- ============================================================================

-- 1. Tabla de organizaciones (empresas) - LA MÁS IMPORTANTE
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY,
  
  -- Datos básicos (del registro inicial)
  name VARCHAR(255) NOT NULL,
  
  -- Datos generados por IA (onboarding identidad empresarial)
  mission TEXT,
  vision TEXT,
  values JSON,
  purpose_statement TEXT,
  tagline VARCHAR(255),
  brand_colors JSON,
  logo_url VARCHAR(500),
  
  -- Datos del cuestionario empresarial
  industry VARCHAR(100),
  business_type VARCHAR(100),
  size ENUM('1-10', '11-50', '51-200', '201-1000', '1000+'),
  years_in_business INT,
  country VARCHAR(100),
  city VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  main_product_service TEXT,
  target_market TEXT,
  monthly_revenue DECIMAL(12,2),
  employee_count INT,
  main_challenges TEXT,
  business_goals TEXT,
  
  -- Control
  owner_id VARCHAR(36),
  identity_completed BOOLEAN DEFAULT FALSE,
  diagnostic_completed BOOLEAN DEFAULT FALSE,
  setup_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Relación usuarios-organizaciones
CREATE TABLE IF NOT EXISTS user_organizations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  role ENUM('owner', 'admin', 'manager', 'employee') DEFAULT 'owner',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  UNIQUE KEY unique_user_org (user_id, organization_id)
);

-- 3. Respuestas de diagnóstico (sin foreign keys por ahora)
CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  answer_data JSON NOT NULL,
  confidence_level TINYINT DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_question_id (question_id),
  UNIQUE KEY unique_user_question (user_id, question_id)
);

-- 4. Sistema de gems mejorado
CREATE TABLE IF NOT EXISTS user_gems (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  gems_count INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  UNIQUE KEY unique_user_org_gems (user_id, organization_id)
);

-- 5. Sistema de medallas mejorado
CREATE TABLE IF NOT EXISTS user_medals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  medal_code VARCHAR(50) NOT NULL,
  medal_name VARCHAR(255) NOT NULL,
  medal_description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_medal_code (medal_code)
);

-- 6. Actualizar tabla users para agregar campos de onboarding
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_step ENUM('personal', 'business', 'diagnostic', 'completed') DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_access_dashboard BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_organization_id VARCHAR(36),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
