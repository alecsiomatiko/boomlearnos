-- Simple organization system creation
-- Create tables and columns directly

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
    id VARCHAR(50) PRIMARY KEY,
    organization_id INT NOT NULL,
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

-- Add organization_id column to users if not exists
ALTER TABLE users ADD COLUMN organization_id INT DEFAULT NULL;

-- Add department_id column to users if not exists  
ALTER TABLE users ADD COLUMN department_id INT DEFAULT NULL;

-- Insert default organization
INSERT INTO organizations (name, description, admin_user_id) VALUES
('BoomlearnOS Company', 'Organización principal del sistema', 1);

-- Insert default departments
INSERT INTO departments (organization_id, name, description, color) VALUES
(1, 'Administración', 'Departamento administrativo', '#EF4444'),
(1, 'Ventas', 'Departamento de ventas', '#10B981'),
(1, 'Marketing', 'Departamento de marketing', '#8B5CF6'),
(1, 'Desarrollo', 'Departamento de desarrollo', '#F59E0B'),
(1, 'Soporte', 'Departamento de soporte técnico', '#06B6D4');