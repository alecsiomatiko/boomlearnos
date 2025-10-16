-- Fix organization system creation
-- Create tables without foreign key constraints first

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

-- Check if columns exist before adding them
SET @organization_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'organization_id');

SET @department_id_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'u191251575_BoomlearnOS' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'department_id');

-- Add columns only if they don't exist
SET @sql = IF(@organization_id_exists = 0, 'ALTER TABLE users ADD COLUMN organization_id INT AFTER role', 'SELECT "organization_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@department_id_exists = 0, 'ALTER TABLE users ADD COLUMN department_id INT AFTER organization_id', 'SELECT "department_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert default organization using first admin user
INSERT INTO organizations (name, description, admin_user_id) 
SELECT 'BoomlearnOS Company', 'Organización principal del sistema', 
       (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as admin_user_id
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

-- Insert default departments
INSERT INTO departments (organization_id, name, description, color) 
SELECT org.id, dept.name, dept.description, dept.color
FROM (SELECT id FROM organizations LIMIT 1) as org
CROSS JOIN (
    SELECT 'Administración' as name, 'Departamento administrativo' as description, '#EF4444' as color
    UNION ALL SELECT 'Ventas', 'Departamento de ventas', '#10B981'
    UNION ALL SELECT 'Marketing', 'Departamento de marketing', '#8B5CF6'
    UNION ALL SELECT 'Desarrollo', 'Departamento de desarrollo', '#F59E0B'
    UNION ALL SELECT 'Soporte', 'Departamento de soporte técnico', '#06B6D4'
) as dept
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE organization_id = org.id AND name = dept.name);