-- Crear usuario de prueba para acceso directo
-- Este script se ejecutará automáticamente para crear el usuario

INSERT INTO users (
  id, 
  name, 
  email, 
  password, 
  company_name, 
  role, 
  level, 
  points, 
  created_at, 
  updated_at, 
  last_login
) VALUES (
  'test-user-001',
  'Administrador BoomLearn',
  'admin@boomlearn.com',
  'admin123',
  'BoomLearn Technologies',
  'admin',
  'strategist',
  1250,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Agregar algunas medallas de ejemplo
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
('test-user-001', 'first-task', NOW()),
('test-user-001', 'team-player', NOW()),
('test-user-001', 'innovator', NOW())
ON CONFLICT DO NOTHING;
