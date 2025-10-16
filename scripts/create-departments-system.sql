-- Create new tables for organization areas and invitations system
-- These tables will work alongside the existing organizations table

-- Create departments/areas table
CREATE TABLE IF NOT EXISTS organization_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL,
    department_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    invitation_password VARCHAR(255) NOT NULL,
    invited_by INT NOT NULL,
    expires_at TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    used_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add department_id column to users table if not exists
ALTER TABLE users ADD COLUMN department_id INT DEFAULT NULL;

-- Insert default departments for all existing organizations
INSERT INTO organization_departments (organization_id, name, description, color) 
SELECT DISTINCT id, 'Administración', 'Departamento administrativo', '#EF4444' FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = organizations.id AND name = 'Administración');

INSERT INTO organization_departments (organization_id, name, description, color) 
SELECT DISTINCT id, 'Ventas', 'Departamento de ventas', '#10B981' FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = organizations.id AND name = 'Ventas');

INSERT INTO organization_departments (organization_id, name, description, color) 
SELECT DISTINCT id, 'Marketing', 'Departamento de marketing', '#8B5CF6' FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = organizations.id AND name = 'Marketing');

INSERT INTO organization_departments (organization_id, name, description, color) 
SELECT DISTINCT id, 'Desarrollo', 'Departamento de desarrollo', '#F59E0B' FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = organizations.id AND name = 'Desarrollo');

INSERT INTO organization_departments (organization_id, name, description, color) 
SELECT DISTINCT id, 'Soporte', 'Departamento de soporte técnico', '#06B6D4' FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM organization_departments WHERE organization_id = organizations.id AND name = 'Soporte');