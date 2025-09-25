-- Crear tabla de organizaciones con campos corregidos
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    size VARCHAR(50), -- Cambié de company_size a size
    description TEXT,
    target_audience TEXT,
    main_challenges TEXT,
    current_goals TEXT,
    unique_value TEXT,
    work_values TEXT,
    communication_style VARCHAR(50),
    mission TEXT,
    vision TEXT,
    values_json TEXT, -- JSON string de valores
    identity_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'ai_generated', 'manual', 'template'
    identity_generated_at TIMESTAMP WITH TIME ZONE,
    ai_generation_failed BOOLEAN DEFAULT FALSE,
    ai_error_message TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columna a users para relacionar con organización
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'personal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_access_dashboard BOOLEAN DEFAULT FALSE;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_identity_status ON organizations(identity_status);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_step ON users(onboarding_step);
