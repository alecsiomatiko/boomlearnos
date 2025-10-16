-- Organization and invitation system tables
-- Create organizational structure and invitation management

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_id INT NOT NULL,
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
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Update users table to include organization and department
ALTER TABLE users ADD COLUMN organization_id INT AFTER role;
ALTER TABLE users ADD COLUMN department_id INT AFTER organization_id;
ALTER TABLE users ADD COLUMN invited_by INT AFTER department_id;
ALTER TABLE users ADD COLUMN invitation_id VARCHAR(50) AFTER invited_by;

-- Add foreign key constraints to users table
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_invited_by 
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL;

-- Insert default organization for existing admin users
INSERT INTO organizations (name, description, admin_id) 
SELECT 'BoomlearnOS Company', 'Organización principal del sistema', id 
FROM users WHERE role = 'admin' LIMIT 1;

-- Insert default departments
INSERT INTO departments (organization_id, name, description, color) VALUES
((SELECT id FROM organizations LIMIT 1), 'Administración', 'Departamento administrativo', '#EF4444'),
((SELECT id FROM organizations LIMIT 1), 'Ventas', 'Departamento de ventas', '#10B981'),
((SELECT id FROM organizations LIMIT 1), 'Marketing', 'Departamento de marketing', '#8B5CF6'),
((SELECT id FROM organizations LIMIT 1), 'Desarrollo', 'Departamento de desarrollo', '#F59E0B'),
((SELECT id FROM organizations LIMIT 1), 'Soporte', 'Departamento de soporte técnico', '#06B6D4');

-- Update existing admin users with organization
UPDATE users SET organization_id = (SELECT id FROM organizations LIMIT 1), 
                 department_id = (SELECT id FROM departments WHERE name = 'Administración' LIMIT 1)
WHERE role = 'admin';