CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO departments (name, description) VALUES 
('Desarrollo', 'Equipo de desarrollo de software'),
('Marketing', 'Equipo de marketing y comunicaciones'), 
('Ventas', 'Equipo de ventas y atención al cliente'),
('Administración', 'Administración y recursos humanos');

-- Update users table to add department_id if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id VARCHAR(36);
ALTER TABLE users ADD FOREIGN KEY IF NOT EXISTS (department_id) REFERENCES departments(id);

-- Assign users to random departments for testing
UPDATE users SET department_id = (SELECT id FROM departments ORDER BY RAND() LIMIT 1) WHERE department_id IS NULL;