-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100),
    business_type VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    level INTEGER DEFAULT 1,
    total_gems INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 100,
    last_checkin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_hours INTEGER DEFAULT 1,
    actual_hours INTEGER,
    completion_percentage INTEGER DEFAULT 0,
    gems_earned INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de gemas
CREATE TABLE IF NOT EXISTS gems_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID,
    gems_amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    calculation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de check-ins diarios
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    energy_level INTEGER NOT NULL,
    priority_text TEXT,
    energy_gained INTEGER DEFAULT 0,
    streak_bonus INTEGER DEFAULT 0,
    gems_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, checkin_date)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_gems_history_user_id ON gems_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);

-- Insertar usuario de prueba
INSERT INTO users (
    id, 
    email, 
    name, 
    phone, 
    city, 
    business_type, 
    role, 
    level, 
    total_gems, 
    current_streak, 
    longest_streak, 
    energy
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@kalabasboom.com',
    'Administrador KalabasBoom',
    '+1234567890',
    'Ciudad de México',
    'Tecnología',
    'admin',
    5,
    1250,
    7,
    15,
    85
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    business_type = EXCLUDED.business_type,
    updated_at = CURRENT_TIMESTAMP;

-- Insertar tareas de ejemplo
INSERT INTO tasks (
    user_id,
    title,
    description,
    category,
    difficulty,
    priority,
    due_date,
    estimated_hours,
    status
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Revisar reportes mensuales de ventas',
    'Analizar los reportes de ventas del mes anterior y preparar resumen ejecutivo',
    'important_urgent',
    'medium',
    'high',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    3,
    'pending'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Actualizar estrategia de marketing digital',
    'Revisar y actualizar la estrategia de marketing para el próximo trimestre',
    'important_not_urgent',
    'complicated',
    'medium',
    CURRENT_TIMESTAMP + INTERVAL '1 week',
    5,
    'pending'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Responder emails urgentes',
    'Revisar y responder emails marcados como urgentes',
    'not_important_urgent',
    'simple',
    'high',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    1,
    'pending'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Organizar archivos del proyecto',
    'Organizar y clasificar archivos del proyecto actual',
    'not_important_not_urgent',
    'simple',
    'low',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    2,
    'pending'
)
ON CONFLICT DO NOTHING;

-- Insertar historial de gemas de ejemplo
INSERT INTO gems_history (
    user_id,
    source_type,
    gems_amount,
    description
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'task_completion',
    94,
    'Tarea completada: Implementar sistema de autenticación'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'daily_checkin',
    25,
    'Check-in diario completado'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'streak_bonus',
    15,
    'Bonificación por racha de 7 días'
)
ON CONFLICT DO NOTHING;
