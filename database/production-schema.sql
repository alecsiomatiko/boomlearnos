-- ============================================================================
-- SCHEMA COMPLETO PARA PRODUCCIÓN - BOOMLEARNOS
-- ============================================================================

-- PASO 1: Crear tablas base SIN foreign keys
-- ============================================================================

-- Tabla de usuarios (SIN foreign keys primero)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Datos personales (completados en onboarding identidad personal)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  position VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  
  -- Control de onboarding OBLIGATORIO
  onboarding_step ENUM('personal', 'business', 'diagnostic', 'completed') DEFAULT 'personal',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  can_access_dashboard BOOLEAN DEFAULT FALSE,
  
  -- Relación con organización (SIN foreign key todavía)
  current_organization_id VARCHAR(36),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Tabla de organizaciones (SIN foreign keys primero)
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
  
  -- Datos del cuestionario empresarial (si se implementa)
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

-- PASO 2: Crear tablas de diagnóstico
-- ============================================================================

CREATE TABLE IF NOT EXISTS diagnostic_modules (
  id VARCHAR(36) PRIMARY KEY,
  module_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category ENUM('modulo0', 'etapa1', 'etapa2') NOT NULL,
  order_index INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnostic_submodules (
  id VARCHAR(36) PRIMARY KEY,
  module_id VARCHAR(36) NOT NULL,
  submodule_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (module_id) REFERENCES diagnostic_modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id VARCHAR(36) PRIMARY KEY,
  submodule_id VARCHAR(36) NOT NULL,
  question_code VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('single', 'multiple', 'scale', 'text', 'number', 'date') NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.00,
  order_index INT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  feedback_text TEXT,
  help_text TEXT,
  
  FOREIGN KEY (submodule_id) REFERENCES diagnostic_submodules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagnostic_options (
  id VARCHAR(36) PRIMARY KEY,
  question_id VARCHAR(36) NOT NULL,
  option_code VARCHAR(50) NOT NULL,
  option_text TEXT NOT NULL,
  weight DECIMAL(3,2) DEFAULT 0,
  emoji VARCHAR(10),
  color VARCHAR(7),
  order_index INT NOT NULL,
  
  FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id) ON DELETE CASCADE
);

-- PASO 3: Crear tablas que dependen de users y organizations
-- ============================================================================

-- Relación usuarios-organizaciones
CREATE TABLE IF NOT EXISTS user_organizations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  role ENUM('owner', 'admin', 'manager', 'employee') DEFAULT 'owner',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_org (user_id, organization_id)
);

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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_question (user_id, question_id)
);

-- PASO 4: Crear tablas de gamificación
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_gems (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  gems_count INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_org_gems (user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS user_medals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  medal_code VARCHAR(50) NOT NULL,
  medal_name VARCHAR(255) NOT NULL,
  medal_description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
